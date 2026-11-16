import { useEffect, useState } from "react";
import { api } from "../../api/client.js";

export default function AdminSettings() {
  const [f, setF] = useState(null);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/admin/settings/").then(setF).catch((e) => setError(e.message));
  }, []);

  function set(k, v) {
    setF((s) => ({ ...s, [k]: v }));
    setFe((e) => ({ ...e, [k]: undefined }));
    setMsg("");
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError(""); setMsg(""); setFe({});
    try {
      const upd = await api.patch("/admin/settings/", {
        require_moderation: f.require_moderation,
        match_threshold: Number(f.match_threshold),
        match_max_distance_km: Number(f.match_max_distance_km),
        match_date_window_days: Number(f.match_date_window_days),
        max_active_posts_per_user: Number(f.max_active_posts_per_user),
      });
      setF(upd);
      setMsg("Sozlamalar saqlandi.");
    } catch (err) {
      setError(err.message);
      setFe(err.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }

  if (!f) return error ? <div className="alert alert-error">{error}</div> : <div className="skeleton" style={{ height: 320 }} />;

  const num = (k, label, hint, props = {}) => (
    <div className="field">
      <label htmlFor={k}>{label}</label>
      <input id={k} type="number" className={"input" + (fe[k] ? " invalid" : "")} value={f[k]} onChange={(e) => set(k, e.target.value)} {...props} />
      {fe[k] ? <span className="field-error">{fe[k]}</span> : <span className="field-hint">{hint}</span>}
    </div>
  );

  return (
    <form className="card settings" onSubmit={save} noValidate>
      {msg && <div className="alert alert-success" role="status">{msg}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <label className="switch-row">
        <span>
          <strong>E'lonlar moderator tekshiruvidan o'tsin</strong>
          <span className="muted" style={{ display: "block", fontSize: 14 }}>
            O'chirilsa, yangi e'lonlar darhol faol bo'ladi.
          </span>
        </span>
        <input type="checkbox" role="switch" checked={f.require_moderation} onChange={(e) => set("require_moderation", e.target.checked)} />
      </label>

      <div className="grid2">
        {num("match_threshold", "Moslik chegarasi (%)", "Shundan past mosliklar ko'rsatilmaydi (1–100).", { min: 1, max: 100 })}
        {num("match_max_distance_km", "Eng katta masofa (km)", "Joylar orasidagi masofa shundan oshmasligi kerak.", { min: 0.5, step: 0.5 })}
        {num("match_date_window_days", "Sana farqi (kun)", "Yo'qolgan va topilgan sanalar orasidagi eng katta farq.", { min: 1 })}
        {num("max_active_posts_per_user", "Bitta foydalanuvchining faol e'lonlari", "Chegaraga yetgach yangi e'lon berib bo'lmaydi.", { min: 1 })}
      </div>

      <div><button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saqlanmoqda..." : "Saqlash"}</button></div>
    </form>
  );
}