import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, mediaUrl } from "../api/client.js";
import { fetchAllMine } from "../api/posts.js";
import { formatDate } from "../lib/format.js";
import { StatusChip, TypeChip } from "../components/Chips.jsx";
import AccountNav from "../components/AccountNav.jsx";
import Icon from "../components/Icon.jsx";
import "./MyPosts.css";

const TABS = [
  ["all", "Hammasi"],
  ["pending", "Tekshiruvda"],
  ["active", "Faol"],
  ["handover", "Topshirilmoqda"],
  ["closed", "Yopilgan"],
  ["rejected", "Rad etilgan"],
];

function note(p) {
  switch (p.status) {
    case "pending": return { text: "Moderator tekshirmoqda. Odatda bir kun ichida.", color: "var(--sub)", side: "Kutilmoqda", sideColor: "var(--warn)" };
    case "active": return { text: "E'lon hamma uchun ko'rinadi.", color: "var(--sub)", side: "Faol", sideColor: "var(--found)" };
    case "handover": return { text: p.type === "found" ? "Egalik tasdiqlandi. Buyumni egasiga topshiring." : "Egalik tasdiqlandi. Buyumni olib ketishingiz mumkin.", color: "var(--info)", side: "Topshirilmoqda", sideColor: "var(--info)" };
    case "closed": return { text: "Buyum egasiga topshirildi. Rahmat!", color: "var(--sub)", side: "Yakunlandi", sideColor: "var(--sub)" };
    case "rejected": return { text: `Sabab: ${p.reject_reason || "ko'rsatilmagan"}. Tahrirlab, qayta yuboring.`, color: "var(--danger)", side: "Qayta yuborish kerak", sideColor: "var(--danger)" };
    default: return { text: "", color: "var(--sub)", side: "", sideColor: "var(--sub)" };
  }
}

export default function MyPosts() {
  const location = useLocation();
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [flash, setFlash] = useState(
    location.state?.saved === "created" ? "E'lon yuborildi."
      : location.state?.saved === "edited" ? "E'lon saqlandi va qayta tekshiruvga yuborildi."
      : ""
  );

  useEffect(() => {
    let alive = true;
    fetchAllMine({ ordering: "-created_at" })
      .then((d) => alive && setPosts(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);

  const counts = useMemo(() => {
    const c = { all: posts ? posts.length : 0 };
    (posts || []).forEach((p) => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [posts]);

  const shown = (posts || []).filter((p) => tab === "all" || p.status === tab);

  async function onDelete(p) {
    if (!window.confirm(`«${p.title}» e'lonini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.del(`/posts/${p.id}/`);
      setPosts((list) => list.filter((x) => x.id !== p.id));
      setFlash("E'lon o'chirildi.");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="container page narrow">
      <AccountNav />

      {flash && <div className="alert alert-success" role="status">{flash}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="pills">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" aria-pressed={tab === k} className={"pill" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
            {l} <span className="dim">{counts[k] || 0}</span>
          </button>
        ))}
      </div>

      {posts === null && !error && (
        <div className="mylist">{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 124 }} />)}</div>
      )}

      {posts && shown.length === 0 && (
        <div className="empty">
          <strong>Bu bo'limda e'lon yo'q.</strong>
          <p><Link to="/posts/new" className="btn btn-primary">E'lon qo'shish</Link></p>
        </div>
      )}

      <div className="mylist">
        {shown.map((p) => {
          const n = note(p);
          const locked = ["handover", "closed"].includes(p.status);
          const img = mediaUrl(p.image);
          return (
            <article key={p.id} className="myitem">
              <div className="myimg">
                {img ? <img src={img} alt="" loading="lazy" /> : <Icon name="image" size={30} stroke={1.5} color="var(--line-3)" />}
              </div>
              <div className="mybody">
                <div className="row" style={{ gap: 8 }}>
                  <TypeChip type={p.type} />
                  <StatusChip status={p.status} />
                  <span className="dim" style={{ fontSize: 13 }}>{formatDate(p.event_date)}{p.place_name ? ` · ${p.place_name}` : ""}</span>
                </div>
                <Link to={`/posts/${p.id}`} className="mytitle">{p.title}</Link>
                <div style={{ fontSize: 14, color: n.color }}>{n.text}</div>
              </div>
              <div className="myside">
                <span style={{ fontSize: 14, fontWeight: 600, color: n.sideColor }}>{n.side}</span>
                <div className="row" style={{ gap: 8 }}>
                  <Link to={`/posts/${p.id}`} className="btn btn-outline btn-sm">Ko'rish</Link>
                  {!locked && <Link to={`/posts/${p.id}/edit`} className="btn btn-outline btn-sm">Tahrirlash</Link>}
                  {!locked && (
                    <button type="button" className="btn btn-outline btn-sm btn-icon" style={{ width: 40 }} aria-label="O'chirish" onClick={() => onDelete(p)}>
                      <Icon name="trash" size={18} color="var(--sub)" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}