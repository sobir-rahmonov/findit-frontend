import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, tokenStore } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import AccountNav from "../components/AccountNav.jsx";
import Icon from "../components/Icon.jsx";
import "./Profile.css";

const ROLES = { user: "Foydalanuvchi", moderator: "Moderator", admin: "Administrator" };

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [f, setF] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    phone: user.phone || "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [fe, setFe] = useState({});
  const [busy, setBusy] = useState(false);

  const [pw, setPw] = useState({ old_password: "", new_password: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwFe, setPwFe] = useState({});
  const [pwBusy, setPwBusy] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setMsg(""); setErr(""); setFe({}); setBusy(true);
    try {
      const upd = await api.patch("/auth/me/", {
        first_name: f.first_name.trim(),
        last_name: f.last_name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
      });
      setUser(upd);
      setMsg("Ma'lumotlar saqlandi.");
    } catch (e2) {
      setErr(e2.message);
      setFe(e2.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg(""); setPwErr(""); setPwFe({});
    if (pw.new_password !== pw.confirm) {
      setPwFe({ confirm: "Parollar mos kelmadi." });
      return;
    }
    setPwBusy(true);
    try {
      const d = await api.post("/auth/change-password/", { old_password: pw.old_password, new_password: pw.new_password });
      if (d?.token) tokenStore.set(d.token); // eski token bekor qilingan
      setPw({ old_password: "", new_password: "", confirm: "" });
      setPwMsg("Parol o'zgartirildi.");
    } catch (e2) {
      setPwErr(e2.message);
      setPwFe(e2.fieldErrors || {});
    } finally {
      setPwBusy(false);
    }
  }

  async function onLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="container page narrow">
      <AccountNav />

      <div className="profile-grid">
        <form className="card prof-card" onSubmit={saveProfile} noValidate>
          <h2 style={{ fontSize: 22 }}>Shaxsiy ma'lumotlar</h2>
          {msg && <div className="alert alert-success" role="status">{msg}</div>}
          {err && <div className="alert alert-error" role="alert">{err}</div>}

          <div className="row" style={{ gap: 10 }}>
            <span className="muted">@{user.username}</span>
            <span className="chip chip-active">{ROLES[user.role] || user.role}</span>
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="pf">Ism</label>
              <input id="pf" className={"input" + (fe.first_name ? " invalid" : "")} value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} />
              {fe.first_name && <span className="field-error">{fe.first_name}</span>}
            </div>
            <div className="field">
              <label htmlFor="pl">Familiya</label>
              <input id="pl" className={"input" + (fe.last_name ? " invalid" : "")} value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} />
              {fe.last_name && <span className="field-error">{fe.last_name}</span>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="pe">Email</label>
            <input id="pe" type="email" className={"input" + (fe.email ? " invalid" : "")} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            {fe.email && <span className="field-error">{fe.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="pp">Telefon</label>
            <input id="pp" type="tel" className={"input" + (fe.phone ? " invalid" : "")} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+998 90 123 45 67" />
            {fe.phone && <span className="field-error">{fe.phone}</span>}
          </div>
          <div><button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saqlanmoqda..." : "Saqlash"}</button></div>
        </form>

        <div className="prof-side">
          <form className="card prof-card" onSubmit={changePassword} noValidate>
            <h2 style={{ fontSize: 22 }}>Parolni o'zgartirish</h2>
            {pwMsg && <div className="alert alert-success" role="status">{pwMsg}</div>}
            {pwErr && <div className="alert alert-error" role="alert">{pwErr}</div>}
            <div className="field">
              <label htmlFor="po">Eski parol</label>
              <input id="po" type="password" autoComplete="current-password" className={"input" + (pwFe.old_password ? " invalid" : "")} value={pw.old_password} onChange={(e) => setPw({ ...pw, old_password: e.target.value })} />
              {pwFe.old_password && <span className="field-error">{pwFe.old_password}</span>}
            </div>
            <div className="field">
              <label htmlFor="pn">Yangi parol</label>
              <input id="pn" type="password" autoComplete="new-password" className={"input" + (pwFe.new_password ? " invalid" : "")} value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
              {pwFe.new_password ? <span className="field-error">{pwFe.new_password}</span> : <span className="field-hint">Kamida 6 belgi, juda oddiy bo'lmasin.</span>}
            </div>
            <div className="field">
              <label htmlFor="pc">Yangi parolni takrorlang</label>
              <input id="pc" type="password" autoComplete="new-password" className={"input" + (pwFe.confirm ? " invalid" : "")} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              {pwFe.confirm && <span className="field-error">{pwFe.confirm}</span>}
            </div>
            <div><button className="btn btn-outline" type="submit" disabled={pwBusy}>{pwBusy ? "Saqlanmoqda..." : "Parolni o'zgartirish"}</button></div>
          </form>

          <button className="btn btn-danger" onClick={onLogout}><Icon name="logout" size={18} /> Hisobdan chiqish</button>
        </div>
      </div>
    </div>
  );
}