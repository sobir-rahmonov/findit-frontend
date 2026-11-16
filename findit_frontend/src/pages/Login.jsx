import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Login() {
  const { isAuth, login, register } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const mode = params.get("mode") === "register" ? "register" : "login";

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (isAuth) return <Navigate to={from} replace />;

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((e) => ({ ...e, [k]: undefined }));
  }

  function switchMode(m) {
    setError("");
    setFieldErrors({});
    setParams(m === "register" ? { mode: "register" } : {});
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.username.trim(), form.password);
      } else {
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          password: form.password,
        };
        if (form.phone.trim()) payload.phone = form.phone.trim();
        await register(payload);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }

  const fe = (k) => fieldErrors[k];

  return (
    <div className="auth">
      <aside className="auth-brand">
        <h2>Yo'qolgan buyum topiladi.</h2>
        <p>
          Universitet, savdo markazi, kutubxona va aeroportlardagi yo'qolgan va topilgan
          buyumlar yagona ro'yxatda. Tizim mos e'lonlarni o'zi topadi.
        </p>
        <ul>
          <li><span className="dot lost" /> Yo'qotdingizmi? E'lon bering.</li>
          <li><span className="dot found" /> Topdingizmi? Egasiga qaytaring.</li>
          <li><span className="dot info" /> Moderator egalikni tekshiradi.</li>
        </ul>
      </aside>

      <section className="auth-form-wrap">
        <div className="auth-card">
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={mode === "login"} className={mode === "login" ? "on" : ""} onClick={() => switchMode("login")} type="button">Kirish</button>
            <button role="tab" aria-selected={mode === "register"} className={mode === "register" ? "on" : ""} onClick={() => switchMode("register")} type="button">Ro'yxatdan o'tish</button>
          </div>

          <form onSubmit={onSubmit} className="auth-form" noValidate>
            {error && <div className="alert alert-error" role="alert">{error}</div>}

            {mode === "register" && (
              <>
                <div className="field">
                  <label htmlFor="first_name">Ism</label>
                  <input id="first_name" className={"input" + (fe("first_name") ? " invalid" : "")} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} autoComplete="given-name" />
                  {fe("first_name") && <span className="field-error">{fe("first_name")}</span>}
                </div>
                <div className="field">
                  <label htmlFor="last_name">Familiya</label>
                  <input id="last_name" className={"input" + (fe("last_name") ? " invalid" : "")} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} autoComplete="family-name" />
                  {fe("last_name") && <span className="field-error">{fe("last_name")}</span>}
                </div>
              </>
            )}

            <div className="field">
              <label htmlFor="username">Foydalanuvchi nomi</label>
              <input id="username" className={"input" + (fe("username") ? " invalid" : "")} value={form.username} onChange={(e) => set("username", e.target.value)} autoComplete="username" required />
              {fe("username") && <span className="field-error">{fe("username")}</span>}
            </div>

            {mode === "register" && (
              <>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" className={"input" + (fe("email") ? " invalid" : "")} value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" required />
                  {fe("email") && <span className="field-error">{fe("email")}</span>}
                </div>
                <div className="field">
                  <label htmlFor="phone">Telefon (ixtiyoriy)</label>
                  <input id="phone" type="tel" className={"input" + (fe("phone") ? " invalid" : "")} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+998 90 123 45 67" autoComplete="tel" />
                  {fe("phone") && <span className="field-error">{fe("phone")}</span>}
                </div>
              </>
            )}

            <div className="field">
              <label htmlFor="password">Parol</label>
              <input id="password" type="password" className={"input" + (fe("password") ? " invalid" : "")} value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
              {fe("password") && <span className="field-error">{fe("password")}</span>}
              {mode === "register" && !fe("password") && <span className="field-hint">Kamida 6 belgi, juda oddiy bo'lmasin.</span>}
            </div>

            <button className="btn btn-primary btn-lg btn-block" disabled={busy} type="submit">
              {busy ? "Kuting..." : mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
            </button>
          </form>

          <p className="auth-foot muted">
            <Link to="/">← Bosh sahifaga qaytish</Link>
          </p>
        </div>
      </section>
    </div>
  );
}