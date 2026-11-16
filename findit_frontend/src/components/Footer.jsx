import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-in">
        <span className="dim">© {new Date().getFullYear()} FindIt · Yo'qolgan va topilgan buyumlar</span>
        <nav className="row" style={{ gap: 4 }} aria-label="Quyi menyu">
          <Link to="/search">Qidiruv</Link>
          <Link to="/map">Xarita</Link>
          <Link to="/how">Qanday ishlaydi</Link>
        </nav>
      </div>
    </footer>
  );
}