import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api/client.js";
import { resetCatalog } from "../../hooks/useCatalog.js";
import LocationPicker from "../../components/LocationPicker.jsx";
import "../../components/Modal.css";

const TYPES = [
  ["university", "Universitet"],
  ["mall", "Savdo markazi"],
  ["library", "Kutubxona"],
  ["airport", "Aeroport"],
  ["station", "Vokzal / metro"],
  ["other", "Boshqa jamoat joyi"],
];

function PlaceModal({ item, onClose, onSaved }) {
  const editing = !!item;
  const [f, setF] = useState({
    name: item?.name || "",
    place_type: item?.place_type || "other",
    address: item?.address || "",
    lat: item?.latitude != null ? String(item.latitude) : "",
    lng: item?.longitude != null ? String(item.longitude) : "",
    is_active: item?.is_active ?? true,
  });
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});
  const [busy, setBusy] = useState(false);

  const center = useMemo(() => (f.lat !== "" ? [Number(f.lat), Number(f.lng)] : null), [f.lat, f.lng]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(""); setFe({});
    try {
      const body = {
        name: f.name.trim(),
        place_type: f.place_type,
        address: f.address.trim(),
        is_active: f.is_active,
        latitude: f.lat !== "" ? Number(f.lat) : null,
        longitude: f.lng !== "" ? Number(f.lng) : null,
      };
      if (editing) await api.patch(`/places/${item.id}/`, body);
      else await api.post("/places/", body);
      onSaved();
    } catch (err) {
      setError(err.message);
      setFe(err.fieldErrors || {});
      setBusy(false);
    }
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal card" style={{ maxWidth: 560 }} onSubmit={submit} role="dialog" aria-modal="true">
        <h2 style={{ fontSize: 24 }}>{editing ? "Joyni tahrirlash" : "Yangi joy"}</h2>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="p-name">Nomi *</label>
          <input id="p-name" className={"input" + (fe.name ? " invalid" : "")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoFocus />
          {fe.name && <span className="field-error">{fe.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="p-type">Turi</label>
          <select id="p-type" className="select" value={f.place_type} onChange={(e) => setF({ ...f, place_type: e.target.value })}>
            {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="p-addr">Manzil</label>
          <input id="p-addr" className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        </div>
        <div className="field">
          <span className="label">Xaritada joylashuvi</span>
          <LocationPicker height={240} value={{ lat: f.lat, lng: f.lng }} center={center} onChange={({ lat, lng }) => setF((s) => ({ ...s, lat, lng }))} />
          <div className="row">
            <span className="field-hint">{f.lat !== "" ? `${f.lat}, ${f.lng}` : "Xaritaga bosib belgilang."}</span>
            <span className="spacer" />
            {f.lat !== "" && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setF((s) => ({ ...s, lat: "", lng: "" }))}>Olib tashlash</button>}
          </div>
          {(fe.latitude || fe.longitude) && <span className="field-error">{fe.latitude || fe.longitude}</span>}
        </div>
        <label className="row" style={{ gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} style={{ width: 18, height: 18 }} />
          Faol
        </label>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Bekor qilish</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saqlanmoqda..." : "Saqlash"}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminPlaces() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await api.get("/places/");
      setList(Array.isArray(d) ? d : d.results || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function remove(p) {
    if (!window.confirm(`«${p.name}» joyini o'chirasizmi?`)) return;
    setError("");
    try {
      await api.del(`/places/${p.id}/`);
      resetCatalog();
      setFlash("Joy o'chirildi.");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="row">
        <span className="muted">{list ? `${list.length} ta joy` : "Yuklanmoqda..."}</span>
        <span className="spacer" />
        <button className="btn btn-primary" onClick={() => setModal({})}>Yangi joy</button>
      </div>
      {flash && <div className="alert alert-success" role="status">{flash}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {list === null && !error && <div className="skeleton" style={{ height: 200 }} />}

      {list && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Nomi</th><th>Turi</th><th>Manzil</th><th>Xarita</th><th>Holat</th><th /></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td className="muted">{p.place_type_display}</td>
                  <td className="muted">{p.address || "—"}</td>
                  <td className="muted">{p.latitude != null ? "Belgilangan" : "—"}</td>
                  <td><span className={"chip " + (p.is_active ? "chip-found" : "chip-closed")}>{p.is_active ? "Faol" : "Nofaol"}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setModal({ item: p })}>Tahrirlash</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>O'chirish</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <PlaceModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); resetCatalog(); setFlash("Saqlandi."); load(); }}
        />
      )}
    </>
  );
}