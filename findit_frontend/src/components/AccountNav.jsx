import { Link, NavLink } from "react-router-dom";
import Icon from "./Icon.jsx";
import "./AccountNav.css";

export default function AccountNav({ title = "Mening hisobim" }) {
  return (
    <>
      <div className="row acc-head">
        <h1 className="page-title">{title}</h1>
        <span className="spacer" />
        <Link to="/posts/new" className="btn btn-primary">
          <Icon name="plus" size={18} stroke={2.2} /> Yangi e'lon
        </Link>
      </div>
      <nav className="acc-nav" aria-label="Hisob bo'limlari">
        <NavLink to="/me/posts">E'lonlarim</NavLink>
        <NavLink to="/me/claims">Da'volarim</NavLink>
        <NavLink to="/notifications">Xabarlar</NavLink>
        <NavLink to="/profile">Profil</NavLink>
      </nav>
    </>
  );
}