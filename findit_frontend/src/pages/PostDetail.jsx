import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate, formatDateFull } from "../lib/format.js";
import { StatusChip, TypeChip } from "../components/Chips.jsx";
import PostMap from "../components/PostMap.jsx";
import ReportModal from "../components/ReportModal.jsx";
import Icon from "../components/Icon.jsx";
import "./PostDetail.css";

function initials(name) {
  return (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuth } = useAuth();

  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [flash, setFlash] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    setPost(null);
    setError("");
    setMatches(null);
    setSimilar([]);
    api.get(`/posts/${id}/`)
      .then((p) => {
        if (!alive) return;
        setPost(p);
        if (p.is_mine) {
          api.get(`/posts/${id}/matches/`).then((m) => alive && setMatches(m)).catch(() => {});
        }
        if (p.place) {
          api.get("/posts/", { place: p.place })
            .then((d) => alive && setSimilar((d.results || []).filter((x) => x.id !== p.id).slice(0, 3)))
            .catch(() => {});
        }
      })
      .catch((e) => alive && setError(e.status === 404 ? "E'lon topilmadi yoki ko'rish uchun ruxsat yo'q." : e.message));
    return () => { alive = false; };
  }, [id]);

  async function onDelete() {
    if (!window.confirm("E'lonni o'chirishni tasdiqlaysizmi?")) return;
    setBusy(true);
    try {
      await api.del(`/posts/${id}/`);
      navigate("/me/posts");
    } catch (e) {
      setFlash(e.message);
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="container page">
        <div className="alert alert-error">{error}</div>
        <div><Link to="/search" className="btn btn-outline">← Qidiruvga qaytish</Link></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container page">
        <div className="skeleton" style={{ height: 440 }} />
      </div>
    );
  }

  const img = mediaUrl(post.image);
  const isFound = post.type === "found";
  const editable = post.is_mine && ["pending", "active", "rejected"].includes(post.status);
  const canClaim = !post.is_mine && isFound && post.status === "active";
  const canReport = !post.is_mine && ["active", "handover"].includes(post.status);

  const facts = [
    ["Kategoriya", post.category_name],
    ["Rangi", post.color_display],
    [isFound ? "Topilgan sana" : "Yo'qolgan sana", formatDateFull(post.event_date)],
    ["Joy", post.place_name || "Ko'rsatilmagan"],
    ["Brend", post.brand || "Ko'rsatilmagan"],
  ];
  if (isFound) facts.push(["Saqlanmoqda", post.storage_note || "Ko'rsatilmagan"]);

  return (
    <div className="container page">
      <div className="crumbs dim">
        <Link to="/">Bosh sahifa</Link> / <Link to="/search">Qidiruv</Link> / <span className="muted">{post.title}</span>
      </div>

      {flash && <div className="alert alert-success" role="status">{flash}</div>}

      <div className="detail">
        <div className="detail-left">
          <div className="detail-img">
            {img ? <img src={img} alt={post.title} /> : <Icon name="image" size={64} stroke={1.2} color="var(--line-3)" />}
          </div>

          <section className="detail-sec">
            <h2>Tavsif</h2>
            <p className="muted detail-desc">{post.description || "Tavsif kiritilmagan."}</p>
          </section>

          {post.latitude != null && (
            <section className="detail-sec">
              <h2>{isFound ? "Qayerda topilgan" : "Qayerda yo'qolgan"}</h2>
              <PostMap posts={[post]} height={280} zoom={15} />
              <div className="muted row" style={{ gap: 8 }}>
                <Icon name="map" size={18} color="var(--dim)" />
                {[post.place_name, post.location_detail].filter(Boolean).join(", ") || "Xaritada belgilangan"}
              </div>
            </section>
          )}
        </div>

        <aside className="detail-right">
          <div className="card detail-card">
            <div className="row" style={{ gap: 8 }}>
              <TypeChip type={post.type} />
              <StatusChip status={post.status} />
            </div>
            <h1 className="detail-title">{post.title}</h1>

            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>

            {post.status === "rejected" && post.reject_reason && (
              <div className="alert alert-error">Rad etish sababi: {post.reject_reason}</div>
            )}
            {post.status === "pending" && post.is_mine && (
              <div className="alert alert-info">E'lon moderator tekshiruvida. Tasdiqlangach hamma ko'radi.</div>
            )}

            {isFound && !post.is_mine && (
              <div className="notice">
                <Icon name="lock" color="var(--sub)" />
                <div className="muted">Topgan odam <strong style={{ color: "var(--text)" }}>yashirin belgi</strong> qoldirgan. Uni faqat haqiqiy egasi biladi.</div>
              </div>
            )}
            {isFound && post.is_mine && post.private_detail && (
              <div className="notice">
                <Icon name="lock" color="var(--sub)" />
                <div className="muted">
                  <strong style={{ color: "var(--text)" }}>Yashirin belgi (faqat siz va moderator ko'radi):</strong>
                  <div>{post.private_detail}</div>
                </div>
              </div>
            )}

            <div className="detail-actions">
              {canClaim && <Link to={`/posts/${post.id}/claim`} className="btn btn-primary btn-lg btn-block">Bu mening buyumim</Link>}
              {!post.is_mine && !isFound && post.status === "active" && (
                <Link to="/posts/new?type=found" className="btn btn-primary btn-lg btn-block">Bu buyumni topdim</Link>
              )}
              {editable && <Link to={`/posts/${post.id}/edit`} className="btn btn-outline btn-block">Tahrirlash</Link>}
              {post.is_mine && !["handover", "closed"].includes(post.status) && (
                <button className="btn btn-danger btn-block" onClick={onDelete} disabled={busy}>O'chirish</button>
              )}
              {canReport && (
                isAuth ? (
                  <button className="btn btn-ghost btn-block" onClick={() => setReportOpen(true)}>
                    <Icon name="flag" size={16} /> Shikoyat qilish
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-ghost btn-block"><Icon name="flag" size={16} /> Shikoyat uchun kiring</Link>
                )
              )}
            </div>
          </div>

          {post.is_mine && matches && matches.count > 0 && (
            <div className="card match-card">
              <div className="row">
                <strong style={{ color: "var(--found)" }}>Mos e'lonlar: {matches.count} ta</strong>
                <span className="spacer" />
                <strong className="match-score">{matches.results[0].score}%</strong>
              </div>
              <div className="match-list">
                {matches.results.map((m) => (
                  <Link key={m.id} to={`/posts/${m.post.id}`} className="match-item">
                    <div className="match-top">
                      <TypeChip type={m.post.type} />
                      <strong>{m.post.title}</strong>
                      <span className="spacer" />
                      <span style={{ color: "var(--found)", fontWeight: 600 }}>{m.score}%</span>
                    </div>
                    <div className="meter"><div style={{ width: `${Math.min(100, m.score)}%` }} /></div>
                    {Array.isArray(m.reasons) && m.reasons.length > 0 && (
                      <span className="dim" style={{ fontSize: 13 }}>{m.reasons.join(" · ")}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="card author">
            <div className="avatar-lg">{initials(post.author_name)}</div>
            <div>
              <strong>{post.author_name}</strong>
              <div className="dim" style={{ fontSize: 13 }}>E'lon bergan · {formatDate(post.created_at)}</div>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="detail-sec" style={{ marginTop: 24 }}>
          <h2>Shu joydagi boshqa e'lonlar</h2>
          <div className="similar">
            {similar.map((s) => (
              <Link key={s.id} to={`/posts/${s.id}`} className="sim-card">
                <div className="sim-img">
                  {s.image ? <img src={mediaUrl(s.image)} alt="" /> : <Icon name="image" color="var(--line-3)" />}
                </div>
                <div className="sim-body">
                  <TypeChip type={s.type} />
                  <strong>{s.title}</strong>
                  <span className="muted" style={{ fontSize: 13 }}>{s.place_name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {reportOpen && (
        <ReportModal
          postId={post.id}
          onClose={() => setReportOpen(false)}
          onDone={() => { setReportOpen(false); setFlash("Shikoyat yuborildi. Rahmat!"); }}
        />
      )}
    </div>
  );
}