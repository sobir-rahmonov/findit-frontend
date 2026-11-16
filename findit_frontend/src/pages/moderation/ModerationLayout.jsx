import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { api } from "../../api/client.js";
import "./Moderation.css";
import "../../components/AccountNav.css";

export default function ModerationLayout() {
  const [counts, setCounts] = useState({});

  const load = useCallback(async () => {
    const res = await Promise.allSettled([
      api.get("/moderation/posts/"),
      api.get("/moderation/claims/"),
      api.get("/moderation/reports/"),
    ]);
    const c = (r) => (r.status === "fulfilled" ? r.value.count : null);
    setCounts({ posts: c(res[0]), claims: c(res[1]), reports: c(res[2]) });
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("findit:mod", load);
    return () => window.removeEventListener("findit:mod", load);
  }, [load]);

  const tab = (to, label, n) => (
    <NavLink to={to}>
      {label}
      {n > 0 && <span className="tab-badge">{n}</span>}
    </NavLink>
  );

  return (
    <div className="container page narrow" style={{ maxWidth: 1180 }}>
      <div>
        <h1 className="page-title">Moderator paneli</h1>
        <p className="muted" style={{ margin: "8px 0 0" }}>Tekshiruv navbati: eng eskisi birinchi ko'rinadi.</p>
      </div>
      <nav className="acc-nav" aria-label="Moderator bo'limlari">
        {tab("/moderation/posts", "E'lonlar", counts.posts)}
        {tab("/moderation/claims", "Da'volar", counts.claims)}
        {tab("/moderation/reports", "Shikoyatlar", counts.reports)}
      </nav>
      <Outlet />
    </div>
  );
}