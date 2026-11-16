import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import Icon from "./Icon.jsx";
import "./Header.css";

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="FindIt bosh sahifa">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="9" stroke="#EEF0F4" strokeWidth="2.4" />
        <path d="M21 21l7 7" stroke="#EEF0F4" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="14" cy="14" r="3" fill="#3DDC97" />
      </svg>
      <span>FindIt</span>
    </Link>
  );
}

export default function Header() {
  const { user, isAuth, isModerator, isAdmin, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setNavOpen(false);
  }, [location.pathname]);

 useEffect(() => {
  if (!isAuth) { setUnread(0); return; }
  let alive = true;
  async function load() {
    try {
      const d = await api.get("/notifications/unread-count/");
      if (alive) setUnread(d.unread ?? 0);
    } catch { /* ignore */ }
  }
  load();
  const t = setInterval(load, 30000);
  window.addEventListener("findit:unread", load);
  return () => {
    alive = false;
    clearInterval(t);
    window.removeEventListener("findit:unread", load);
  };
}, [isAuth, location.pathname]);
  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function onLogout() {
    await logout();
    navigate("/");
  }

  const initials = user
    ? ((user.first_name?.[0] || "") + (user.last_name?.[0] || "") || user.username?.slice(0, 2) || "?").toUpperCase()
    : "";

  return (
    <header className="header">
      <div className="container header-in">
        <Logo />

        <button className="btn btn-ghost btn-icon nav-toggle" onClick={() => setNavOpen((v) => !v)} aria-label="Menyu">
          <Icon name={navOpen ? "x" : "menu"} />
        </button>

        <nav className={"nav" + (navOpen ? " open" : "")} aria-label="Asosiy menyu">
          <NavLink to="/search">Qidiruv</NavLink>
          <NavLink to="/map">Xarita</NavLink>
          <NavLink to="/how">Qanday ishlaydi</NavLink>
        </nav>

        <div className="header-actions">
          {isAuth ? (
            <>
              <Link to="/posts/new" className="btn btn-primary btn-sm add-btn">
                <Icon name="plus" size={18} stroke={2.2} /> <span>E'lon qo'shish</span>
              </Link>
              <Link to="/notifications" className="bell" aria-label={`Xabarlar${unread ? `, ${unread} ta yangi` : ""}`}>
                <Icon name="bell" />
                {unread > 0 && <span className="badge">{unread > 99 ? "99+" : unread}</span>}
              </Link>
              <div className="avatar-wrap" ref={menuRef}>
                <button className="avatar" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen}>
                  {initials}
                </button>
                {menuOpen && (
                  <div className="dropdown" role="menu">
                    <div className="dd-head">
                      <strong>{user.first_name || user.username}</strong>
                      <span className="dim">@{user.username}</span>
                    </div>
                    <Link to="/me/posts" role="menuitem"><Icon name="image" size={18} /> E'lonlarim</Link>
                    <Link to="/me/claims" role="menuitem"><Icon name="check" size={18} /> Da'volarim</Link>
                    <Link to="/profile" role="menuitem"><Icon name="user" size={18} /> Profil</Link>
                    {isModerator && <Link to="/moderation" role="menuitem"><Icon name="shield" size={18} /> Moderator paneli</Link>}
                    {isAdmin && <Link to="/admin" role="menuitem"><Icon name="shield" size={18} /> Admin paneli</Link>}
                    <button onClick={onLogout} role="menuitem"><Icon name="logout" size={18} /> Chiqish</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Kirish</Link>
              <Link to="/login?mode=register" className="btn btn-primary btn-sm">Ro'yxatdan o'tish</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}