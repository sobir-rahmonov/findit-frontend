import { NavLink, Outlet } from "react-router-dom";
import "../../components/AccountNav.css";
import "../moderation/Moderation.css";
import "./Admin.css";

export default function AdminLayout() {
  return (
    <div className="container page" style={{ maxWidth: 1180 }}>
      <div>
        <h1 className="page-title">Admin paneli</h1>
        <p className="muted" style={{ margin: "8px 0 0" }}>Tizim holati, foydalanuvchilar va sozlamalar.</p>
      </div>
      <nav className="acc-nav" aria-label="Admin bo'limlari">
        <NavLink to="/admin/stats">Statistika</NavLink>
        <NavLink to="/admin/users">Foydalanuvchilar</NavLink>
        <NavLink to="/admin/categories">Kategoriyalar</NavLink>
        <NavLink to="/admin/places">Joylar</NavLink>
        <NavLink to="/admin/settings">Sozlamalar</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}