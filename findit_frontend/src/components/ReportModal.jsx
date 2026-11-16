import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import "./Modal.css";

const REASONS = [
  ["spam", "Spam"],
  ["fake", "Soxta e'lon"],
  ["inappropriate", "Nomaqbul mazmun"],
  ["fraud", "Firibgarlik"],
  ["other", "Boshqa"],
];

export default function ReportModal({ postId, onClose, onDone }) {
  const [reason, setReason] = useState("spam");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      await api.post("/reports/", { post: postId, reason, text: text.trim() });
      onDone();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal card" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="rep-title">
        <h2 id="rep-title" style={{ fontSize: 24 }}>Shikoyat qilish</h2>
        <p className="muted" style={{ margin: 0 }}>Moderator shikoyatni ko'rib chiqadi.</p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <div className="field">
          <label htmlFor="rep-reason">Sabab</label>
          <select id="rep-reason" className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="rep-text">Izoh {reason === "other" ? "" : "(ixtiyoriy)"}</label>
          <textarea id="rep-text" className={"textarea" + (fieldErrors.text ? " invalid" : "")} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} />
          {fieldErrors.text && <span className="field-error">{fieldErrors.text}</span>}
        </div>

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Bekor qilish</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Yuborilmoqda..." : "Yuborish"}</button>
        </div>
      </form>
    </div>
  );
}