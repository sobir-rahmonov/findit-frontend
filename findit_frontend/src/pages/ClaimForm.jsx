import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, mediaUrl } from "../api/client.js";
import { formatDate } from "../lib/format.js";
import { TypeChip } from "../components/Chips.jsx";
import Icon from "../components/Icon.jsx";
import "./ClaimForm.css";

const STEPS = [
  ["Da'vo yuboriladi", "Topgan odamga xabar boradi."],
  ["Moderator tekshiradi", "Belgilaringiz yashirin belgi bilan solishtiriladi."],
  ["Buyumni olasiz", "Tasdiqlansa, buyum qayerda saqlanayotgani ko'rinadi."],
];

export default function ClaimForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [post, setPost] = useState(null);
  const [myLost, setMyLost] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [lostId, setLostId] = useState(params.get("lost") || "");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get(`/posts/${id}/`)
      .then((p) => {
        if (!alive) return;
        if (p.is_mine) setLoadError("O'z e'loningizga da'vo yubora olmaysiz.");
        else if (p.type !== "found" || p.status !== "active") setLoadError("Bu e'longa da'vo yuborib bo'lmaydi.");
        else setPost(p);
      })
      .catch((e) => alive && setLoadError(e.message));
    api.get("/posts/mine/", { type: "lost", status: "active" })
      .then((d) => alive && setMyLost(d.results || []))
      .catch(() => {});
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setFe({});
    if (text.trim().length < 10) {
      setFe({ description: "Belgilarni batafsilroq yozing (kamida 10 belgi)." });
      return;
    }
    const fd = new FormData();
    fd.append("found_post", id);
    if (lostId) fd.append("lost_post", lostId);
    fd.append("description", text.trim());
    if (file) fd.append("proof_image", file);

    setBusy(true);
    try {
      await api.post("/claims/", fd);
      navigate("/me/claims", { state: { created: true } });
    } catch (err) {
      setError(err.message);
      setFe(err.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="container page">
        <div className="alert alert-error">{loadError}</div>
        <div><Link to={`/posts/${id}`} className="btn btn-outline">← E'longa qaytish</Link></div>
      </div>
    );
  }
  if (!post) return <div className="container page"><div className="skeleton" style={{ height: 400 }} /></div>;

  const img = mediaUrl(post.image);

  return (
    <div className="container page">
      <Link to={`/posts/${id}`} className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
        <Icon name="arrowLeft" size={18} /> E'longa qaytish
      </Link>
      <div>
        <h1 className="page-title">Bu buyum meniki</h1>
        <p className="muted" style={{ maxWidth: 620, margin: "8px 0 0" }}>
          Moderator da'voingizni topgan odam qoldirgan yashirin belgi bilan solishtiradi.
          Faqat egasi biladigan narsalarni yozing.
        </p>
      </div>

      <div className="claim-layout">
        <form onSubmit={onSubmit} className="claim-form" noValidate>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          {fe.lost_post && <div className="alert alert-error">{fe.lost_post}</div>}

          <fieldset className="fs">
            <legend>Qaysi e'loningiz bilan bog'laymiz?</legend>
            {myLost.map((l) => (
              <label key={l.id} className={"opt" + (lostId === String(l.id) ? " on" : "")}>
                <input type="radio" name="lost" checked={lostId === String(l.id)} onChange={() => setLostId(String(l.id))} />
                <span className="opt-radio" />
                <span className="opt-text">
                  <strong>{l.title}</strong>
                  <span className="muted">Yo'qolgan · {l.place_name || "Joy ko'rsatilmagan"} · {formatDate(l.event_date)}</span>
                </span>
              </label>
            ))}
            <label className={"opt" + (lostId === "" ? " on" : "")}>
              <input type="radio" name="lost" checked={lostId === ""} onChange={() => setLostId("")} />
              <span className="opt-radio" />
              <span className="opt-text">
                <strong>Bog'lamasdan yuborish</strong>
                <span className="muted">E'lonim yo'q yoki boshqa buyum</span>
              </span>
            </label>
          </fieldset>

          <fieldset className="fs">
            <legend>Buyumni tasdiqlovchi belgilar</legend>
            <label className="sr-only" htmlFor="desc">Belgilar</label>
            <textarea id="desc" rows={5} maxLength={1000} className={"textarea" + (fe.description ? " invalid" : "")} value={text} onChange={(e) => setText(e.target.value)} placeholder="Masalan: muqovasining burchagi yirtilgan, ichida 2 ta viza tamg'asi bor." />
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="field-hint">Kamida 10 belgi. Hammaga ko'rinadigan ma'lumotni yozmang.</span>
              <span className="field-hint">{text.length} / 1000</span>
            </div>
            {fe.description && <span className="field-error">{fe.description}</span>}
          </fieldset>

          <fieldset className="fs">
            <legend>Isbot rasmi (ixtiyoriy)</legend>
            <label htmlFor="proof" className="drop">
              {preview ? <img src={preview} alt="Isbot rasmi" /> : (
                <span className="row" style={{ justifyContent: "center", color: "var(--sub)" }}>
                  <Icon name="image" size={22} stroke={1.6} /> Buyumning avvalgi rasmi yoki chek
                </span>
              )}
            </label>
            <input id="proof" type="file" accept="image/*" className="file-input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file && <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setFile(null)}>Tanlovni bekor qilish</button>}
            {fe.proof_image && <span className="field-error">{fe.proof_image}</span>}
          </fieldset>

          <div className="row">
            <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>{busy ? "Yuborilmoqda..." : "Da'voni yuborish"}</button>
            <Link to={`/posts/${id}`} className="btn btn-ghost btn-lg">Bekor qilish</Link>
          </div>
        </form>

        <aside className="claim-side">
          <div className="card claim-post">
            <div className="claim-thumb">{img ? <img src={img} alt="" /> : <Icon name="image" color="var(--line-3)" />}</div>
            <div className="claim-post-info">
              <TypeChip type="found" />
              <strong>{post.title}</strong>
              <span className="muted" style={{ fontSize: 13 }}>{post.place_name} · {formatDate(post.event_date)}</span>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 18 }}>Keyingi qadamlar</h3>
            <ol className="next-steps">
              {STEPS.map(([t, d], i) => (
                <li key={t}>
                  <span className="step-n">{i + 1}</span>
                  <div><strong>{t}</strong><div className="muted" style={{ fontSize: 14 }}>{d}</div></div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}