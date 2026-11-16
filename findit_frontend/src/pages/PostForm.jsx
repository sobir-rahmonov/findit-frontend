import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, mediaUrl } from "../api/client.js";
import useCatalog from "../hooks/useCatalog.js";
import { COLORS } from "../lib/format.js";
import LocationPicker from "../components/LocationPicker.jsx";
import Icon from "../components/Icon.jsx";
import "./PostForm.css";

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  type: "lost",
  title: "",
  category: "",
  color: "other",
  brand: "",
  description: "",
  place: "",
  location_detail: "",
  lat: "",
  lng: "",
  event_date: today(),
  storage_note: "",
  private_detail: "",
};

export default function PostForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { categories, places } = useCatalog();

  const [f, setF] = useState({ ...EMPTY, type: params.get("type") === "found" ? "found" : "lost" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImg, setExistingImg] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    let alive = true;
    api.get(`/posts/${id}/`)
      .then((p) => {
        if (!alive) return;
        if (!p.is_mine) { setLoadError("Bu e'lonni tahrirlash huquqingiz yo'q."); return; }
        if (["handover", "closed"].includes(p.status)) { setLoadError("Bu e'lonni endi o'zgartirib bo'lmaydi."); return; }
        setF({
          type: p.type,
          title: p.title || "",
          category: String(p.category || ""),
          color: p.color || "other",
          brand: p.brand || "",
          description: p.description || "",
          place: p.place ? String(p.place) : "",
          location_detail: p.location_detail || "",
          lat: p.latitude != null ? String(p.latitude) : "",
          lng: p.longitude != null ? String(p.longitude) : "",
          event_date: p.event_date || today(),
          storage_note: p.storage_note || "",
          private_detail: p.private_detail || "",
        });
        setExistingImg(mediaUrl(p.image));
      })
      .catch((e) => alive && setLoadError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, editing]);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const selectedPlace = useMemo(() => places.find((p) => String(p.id) === f.place), [places, f.place]);
  const mapCenter = useMemo(
    () => (selectedPlace && selectedPlace.latitude != null ? [Number(selectedPlace.latitude), Number(selectedPlace.longitude)] : null),
    [selectedPlace]
  );

  function set(k, v) {
    setF((s) => ({ ...s, [k]: v }));
    setFe((e) => ({ ...e, [k]: undefined }));
  }

  function onPlaceChange(v) {
    const p = places.find((x) => String(x.id) === v);
    setF((s) => ({
      ...s,
      place: v,
      lat: p && p.latitude != null ? String(p.latitude) : s.lat,
      lng: p && p.longitude != null ? String(p.longitude) : s.lng,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const local = {};
    if (!f.title.trim()) local.title = "Buyum nomini kiriting.";
    if (!f.category) local.category = "Kategoriyani tanlang.";
    if (!f.event_date) local.event_date = "Sanani kiriting.";
    if (Object.keys(local).length) {
      setFe(local);
      setError("Majburiy maydonlarni to'ldiring.");
      return;
    }

    const fd = new FormData();
    if (!editing) fd.append("type", f.type);
    fd.append("title", f.title.trim());
    fd.append("category", f.category);
    fd.append("color", f.color);
    fd.append("brand", f.brand.trim());
    fd.append("description", f.description.trim());
    fd.append("location_detail", f.location_detail.trim());
    fd.append("event_date", f.event_date);
    if (f.place) fd.append("place", f.place);
    if (f.lat !== "" && f.lng !== "") {
      fd.append("latitude", f.lat);
      fd.append("longitude", f.lng);
    }
    if (f.type === "found") {
      fd.append("storage_note", f.storage_note.trim());
      fd.append("private_detail", f.private_detail.trim());
    }
    if (file) fd.append("image", file);

    setBusy(true);
    try {
      const saved = editing ? await api.patch(`/posts/${id}/`, fd) : await api.post("/posts/", fd);
      navigate("/me/posts", { state: { saved: editing ? "edited" : "created", id: saved.id } });
    } catch (err) {
      setError(err.message);
      setFe(err.fieldErrors || {});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="container page"><div className="skeleton" style={{ height: 400 }} /></div>;
  if (loadError) {
    return (
      <div className="container page">
        <div className="alert alert-error">{loadError}</div>
        <div><Link to="/me/posts" className="btn btn-outline">← E'lonlarimga</Link></div>
      </div>
    );
  }

  const isFound = f.type === "found";
  const shownImg = preview || existingImg;
  const err = (k) => fe[k];

  return (
    <div className="container page narrow">
      <Link to={editing ? "/me/posts" : "/"} className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
        <Icon name="arrowLeft" size={18} /> Orqaga
      </Link>
      <div>
        <h1 className="page-title">{editing ? "E'lonni tahrirlash" : "E'lon qo'shish"}</h1>
        <p className="muted" style={{ margin: "8px 0 0" }}>
          {editing
            ? "Tahrirdan keyin e'lon qayta tekshiruvga yuboriladi."
            : "Qancha aniq yozsangiz, mos e'lonni shuncha tez topamiz."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="pform" noValidate>
        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {!editing && (
          <div className="seg type-seg" role="radiogroup" aria-label="E'lon turi">
            <button type="button" role="radio" aria-checked={!isFound} className={!isFound ? "on lost" : ""} onClick={() => set("type", "lost")}>Men yo'qotdim</button>
            <button type="button" role="radio" aria-checked={isFound} className={isFound ? "on found" : ""} onClick={() => set("type", "found")}>Men topdim</button>
          </div>
        )}

        <fieldset className="fs">
          <legend>Buyum haqida</legend>
          <div className="field">
            <label htmlFor="title">Buyum nomi *</label>
            <input id="title" className={"input" + (err("title") ? " invalid" : "")} value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={200} placeholder="Masalan: Qora AirPods quloqchin" />
            {err("title") && <span className="field-error">{err("title")}</span>}
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="category">Kategoriya *</label>
              <select id="category" className={"select" + (err("category") ? " invalid" : "")} value={f.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Tanlang</option>
                {categories.filter((c) => c.is_active !== false).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {err("category") && <span className="field-error">{err("category")}</span>}
            </div>
            <div className="field">
              <label htmlFor="brand">Brend / model</label>
              <input id="brand" className="input" value={f.brand} onChange={(e) => set("brand", e.target.value)} maxLength={100} />
            </div>
          </div>

          <div className="field">
            <span className="label">Rangi</span>
            <div className="swatches">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={f.color === c.value}
                  className={"swatch" + (f.color === c.value ? " on" : "")}
                  style={{ background: c.hex }}
                  onClick={() => set("color", c.value)}
                />
              ))}
            </div>
            <span className="field-hint">Tanlangan: {COLORS.find((c) => c.value === f.color)?.label}</span>
          </div>

          <div className="field">
            <label htmlFor="description">Tavsif</label>
            <textarea id="description" className="textarea" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Belgilari, holati, ichida nima borligi" />
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>{isFound ? "Qayerda va qachon topildi" : "Qayerda va qachon yo'qoldi"}</legend>
          <div className="grid2">
            <div className="field">
              <label htmlFor="place">Joy</label>
              <select id="place" className={"select" + (err("place") ? " invalid" : "")} value={f.place} onChange={(e) => onPlaceChange(e.target.value)}>
                <option value="">Tanlang</option>
                {places.filter((p) => p.is_active !== false).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {err("place") && <span className="field-error">{err("place")}</span>}
            </div>
            <div className="field">
              <label htmlFor="date">Sana *</label>
              <input id="date" type="date" max={today()} className={"input" + (err("event_date") ? " invalid" : "")} value={f.event_date} onChange={(e) => set("event_date", e.target.value)} />
              {err("event_date") && <span className="field-error">{err("event_date")}</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="loc">Aniq joy</label>
            <input id="loc" className="input" value={f.location_detail} onChange={(e) => set("location_detail", e.target.value)} maxLength={255} placeholder="Masalan: 2-terminal, kutish zali" />
          </div>

          <div className="field">
            <span className="label">Xaritada belgilang (ixtiyoriy)</span>
            <LocationPicker value={{ lat: f.lat, lng: f.lng }} center={mapCenter} onChange={({ lat, lng }) => setF((s) => ({ ...s, lat, lng }))} />
            <div className="row">
              <span className="field-hint">
                {f.lat !== "" ? `Belgilandi: ${f.lat}, ${f.lng}` : "Aniq joyni belgilash uchun xaritaga bosing."}
              </span>
              <span className="spacer" />
              {f.lat !== "" && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setF((s) => ({ ...s, lat: "", lng: "" }))}>Belgini olib tashlash</button>}
            </div>
            {(err("latitude") || err("longitude")) && <span className="field-error">{err("latitude") || err("longitude")}</span>}
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Rasm</legend>
          <label className="drop" htmlFor="image">
            {shownImg ? (
              <img src={shownImg} alt="Tanlangan rasm" />
            ) : (
              <span className="row" style={{ justifyContent: "center", color: "var(--sub)" }}>
                <Icon name="image" size={22} stroke={1.6} /> Rasm tanlash uchun bosing
              </span>
            )}
          </label>
          <input id="image" type="file" accept="image/*" className="file-input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {file && <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setFile(null)}>Tanlovni bekor qilish</button>}
          {err("image") && <span className="field-error">{err("image")}</span>}
        </fieldset>

        {isFound && (
          <fieldset className="fs">
            <legend>Topilgan buyum uchun</legend>
            <div className="field">
              <label htmlFor="storage">Buyum qayerda saqlanmoqda</label>
              <input id="storage" className="input" value={f.storage_note} onChange={(e) => set("storage_note", e.target.value)} maxLength={255} placeholder="Masalan: Kutubxona ma'muriyatida" />
              {err("storage_note") && <span className="field-error">{err("storage_note")}</span>}
            </div>
            <div className="field">
              <label htmlFor="private">Yashirin belgi</label>
              <textarea id="private" className="textarea" rows={3} value={f.private_detail} onChange={(e) => set("private_detail", e.target.value)} placeholder="Faqat haqiqiy egasi biladigan belgi: chizilgan joy, ichidagi narsa..." />
              <span className="field-hint row" style={{ gap: 6 }}><Icon name="lock" size={14} /> Bu maydon jamoatga ko'rsatilmaydi. Faqat siz va moderator ko'radi.</span>
            </div>
          </fieldset>
        )}

        <div className="row">
          <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
            {busy ? "Saqlanmoqda..." : editing ? "Saqlash" : "E'lonni yuborish"}
          </button>
          <Link to={editing ? "/me/posts" : "/"} className="btn btn-ghost btn-lg">Bekor qilish</Link>
        </div>
      </form>
    </div>
  );
}