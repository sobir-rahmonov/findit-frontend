import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api/client.js";
import { fetchAllPages } from "../api/posts.js";
import { formatDate } from "../lib/format.js";
import AccountNav from "../components/AccountNav.jsx";
import "./MyPosts.css";

const CLAIM = {
  pending: ["Ko'rib chiqilmoqda", "pending"],
  approved: ["Tasdiqlandi", "handover"],
  rejected: ["Rad etildi", "rejected"],
  completed: ["Topshirildi", "closed"],
  cancelled: ["Bekor qilindi", "closed"],
};

const TABS = [["all", "Hammasi"], ["pending", "Ko'rib chiqilmoqda"], ["approved", "Tasdiqlandi"], ["rejected", "Rad etildi"], ["completed", "Topshirildi"], ["cancelled", "Bekor qilindi"]];

export default function MyClaims() {
  const location = useLocation();
  const [claims, setClaims] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [flash, setFlash] = useState(location.state?.created ? "Da'vo yuborildi. Moderator tez orada ko'rib chiqadi." : "");

  useEffect(() => {
    let alive = true;
    fetchAllPages("/claims/")
      .then((d) => alive && setClaims(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);

  const counts = useMemo(() => {
    const c = { all: claims ? claims.length : 0 };
    (claims || []).forEach((x) => { c[x.status] = (c[x.status] || 0) + 1; });
    return c;
  }, [claims]);

  const shown = (claims || []).filter((c) => tab === "all" || c.status === tab);

  async function onCancel(c) {
    if (!window.confirm("Da'voni bekor qilishni tasdiqlaysizmi?")) return;
    try {
      const upd = await api.post(`/claims/${c.id}/cancel/`);
      setClaims((list) => list.map((x) => (x.id === c.id ? upd : x)));
      setFlash("Da'vo bekor qilindi.");
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

      {claims === null && !error && <div className="mylist">{[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}</div>}
      {claims && shown.length === 0 && (
        <div className="empty">
          <strong>Da'vo yo'q.</strong>
          <p className="muted">Topilgan buyum sizniki bo'lsa, e'lon sahifasida «Bu mening buyumim» tugmasini bosing.</p>
          <Link to="/search?type=found" className="btn btn-outline">Topilgan buyumlarni ko'rish</Link>
        </div>
      )}

      <div className="mylist">
        {shown.map((c) => {
          const [label, cls] = CLAIM[c.status] || [c.status_display, "closed"];
          return (
            <article key={c.id} className="myitem" style={{ flexDirection: "column" }}>
              <div className="row" style={{ gap: 8 }}>
                <span className={`chip chip-${cls}`}>{label}</span>
                <span className="dim" style={{ fontSize: 13 }}>{formatDate(c.created_at)}</span>
                {c.lost_post_title && <span className="dim" style={{ fontSize: 13 }}>· e'loningiz: {c.lost_post_title}</span>}
              </div>
              <Link to={`/posts/${c.found_post}`} className="mytitle">{c.found_post_title}</Link>
              <div className="muted" style={{ fontSize: 14 }}>Sizning belgilaringiz: {c.description}</div>

              {c.status === "rejected" && c.moderator_note && <div className="alert alert-error">Moderator izohi: {c.moderator_note}</div>}
              {["approved", "completed"].includes(c.status) && c.pickup_info && (
                <div className="alert alert-info">Buyum qayerda: {c.pickup_info}</div>
              )}
              {c.status === "completed" && c.handover_note && <div className="muted" style={{ fontSize: 14 }}>Izoh: {c.handover_note}</div>}

              {c.status === "pending" && (
                <div><button className="btn btn-outline btn-sm" onClick={() => onCancel(c)}>Da'voni bekor qilish</button></div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}