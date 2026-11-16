import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { formatDateTime } from "../lib/format.js";
import AccountNav from "../components/AccountNav.jsx";
import Icon from "../components/Icon.jsx";
import "./Notifications.css";

const KIND = {
  post_approved: ["check", "var(--found)"],
  post_rejected: ["x", "var(--danger)"],
  match_found: ["search", "var(--found)"],
  claim_received: ["shield", "var(--info)"],
  claim_approved: ["check", "var(--found)"],
  claim_rejected: ["x", "var(--danger)"],
  handover_completed: ["check", "var(--info)"],
  report_resolved: ["flag", "var(--sub)"],
  system: ["bell", "var(--sub)"],
};

function pingHeader() {
  window.dispatchEvent(new Event("findit:unread"));
}

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [next, setNext] = useState(false);
  const [page, setPage] = useState(1);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (pg, replace) => {
    const d = await api.get("/notifications/", { page: pg, is_read: onlyUnread ? "false" : "" });
    setItems((prev) => (replace ? d.results : [...(prev || []), ...d.results]));
    setNext(!!d.next);
    setPage(pg);
  }, [onlyUnread]);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setError("");
    load(1, true).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [load]);

  async function more() {
    setLoadingMore(true);
    try { await load(page + 1, false); } catch (e) { setError(e.message); }
    setLoadingMore(false);
  }

  async function open(n) {
    if (!n.is_read) {
      try {
        await api.post(`/notifications/${n.id}/read/`);
        setItems((list) => list.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
        pingHeader();
      } catch { /* ignore */ }
    }
    if (n.claim && ["claim_approved", "claim_rejected", "handover_completed"].includes(n.kind)) navigate("/me/claims");
    else if (n.post) navigate(`/posts/${n.post}`);
  }

  async function readAll() {
    try {
      await api.post("/notifications/read-all/");
      setItems((list) => list.map((x) => ({ ...x, is_read: true })));
      pingHeader();
    } catch (e) {
      setError(e.message);
    }
  }

  const hasUnread = (items || []).some((x) => !x.is_read);

  return (
    <div className="container page narrow">
      <AccountNav />
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="row">
        <div className="seg" style={{ width: 260 }}>
          <button type="button" className={!onlyUnread ? "on" : ""} onClick={() => setOnlyUnread(false)}>Hammasi</button>
          <button type="button" className={onlyUnread ? "on" : ""} onClick={() => setOnlyUnread(true)}>O'qilmagan</button>
        </div>
        <span className="spacer" />
        {hasUnread && <button className="btn btn-outline btn-sm" onClick={readAll}>Hammasini o'qilgan qilish</button>}
      </div>

      {items === null && !error && <div className="notif-list">{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 76 }} />)}</div>}
      {items && items.length === 0 && <div className="empty">{onlyUnread ? "O'qilmagan xabar yo'q." : "Hozircha xabar yo'q."}</div>}

      <div className="notif-list">
        {(items || []).map((n) => {
          const [icon, color] = KIND[n.kind] || KIND.system;
          return (
            <button key={n.id} className={"notif" + (n.is_read ? "" : " unread")} onClick={() => open(n)}>
              <span className="notif-ic" style={{ color }}><Icon name={icon} size={20} /></span>
              <span className="notif-body">
                <strong>{n.title}</strong>
                <span className="muted">{n.message}</span>
                <span className="dim" style={{ fontSize: 13 }}>{formatDateTime(n.created_at)}</span>
              </span>
              {!n.is_read && <span className="notif-dot" aria-label="O'qilmagan" />}
            </button>
          );
        })}
      </div>

      {next && (
        <div style={{ textAlign: "center" }}>
          <button className="btn btn-outline" onClick={more} disabled={loadingMore}>{loadingMore ? "Yuklanmoqda..." : "Yana ko'rsatish"}</button>
        </div>
      )}
    </div>
  );
}