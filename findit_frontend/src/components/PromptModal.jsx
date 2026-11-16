import { useEffect, useState } from "react";
import "./Modal.css";

export default function PromptModal({
  title,
  description,
  label = "Izoh",
  required = true,
  placeholder = "",
  confirmLabel = "Tasdiqlash",
  danger = false,
  checkbox = null, // { label }
  onSubmit,
  onClose,
}) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    if (required && !text.trim()) {
      setError("Bu maydonni to'ldiring.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit(text.trim(), checked);
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal card" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="pm-title">
        <h2 id="pm-title" style={{ fontSize: 24 }}>{title}</h2>
        {description && <p className="muted" style={{ margin: 0 }}>{description}</p>}
        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <div className="field">
          <label htmlFor="pm-text">{label}{required ? " *" : " (ixtiyoriy)"}</label>
          <textarea id="pm-text" className="textarea" rows={3} maxLength={255} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} autoFocus />
        </div>

        {checkbox && (
          <label className="row" style={{ gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} style={{ width: 18, height: 18 }} />
            <span>{checkbox.label}</span>
          </label>
        )}

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Bekor qilish</button>
          <button type="submit" className={"btn " + (danger ? "btn-danger" : "btn-primary")} disabled={busy}>
            {busy ? "Kuting..." : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}