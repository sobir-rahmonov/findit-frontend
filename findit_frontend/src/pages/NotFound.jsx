import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container page">
      <h1 className="page-title">404</h1>
      <p className="muted">Bunday sahifa topilmadi.</p>
      <div><Link to="/" className="btn btn-primary">Bosh sahifaga</Link></div>
    </div>
  );
}