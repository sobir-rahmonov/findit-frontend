import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client.js";
import { resetCatalog } from "../../hooks/useCatalog.js";
import { slugify } from "../../lib/slug.js";
import "../../components/Modal.css";

function CategoryModal({ item, onClose, onSaved }) {
  const editing = !!item;
  const [f, setF] = useState({
    name: item?.name || "",
    slug: item?.slug || "",
    icon: item?.icon || "",
    is_active: item?.is_active ?? true,
  });
  const [slugTouched, setSlugTouched] = useState(editing);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});
  const [busy, setBusy] = useState(false);

  function setName(v) {
    setF((s) => ({ ...s, name: v, slug: slugTouched ? s.slug : slugify(v) }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(""); setFe({});
    try {
      const body = { name: f.name.trim(), slug: f.slug.trim(), icon: f.icon.trim(), is_active: f.is_active };
      if (editing) await api.patch(`/categories/${item.id}/`, body);
      else await api.post("/categories/", body);
      onSaved();
    } catch (err) {
      setError(err.message);
      setFe(err.fieldErrors || {});
      setBusy(false);
    }
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal card" onSubmit={submit} role="dialog" aria-modal="true">
        <h2 style={{ fontSize: 24 }}>{editing ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}</h2>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="c-name">Nomi *</label>
          <input id="c-name" className={"input" + (fe.name ? " invalid" : "")} value={f.name} onChange={(e) => setName(e.target.value)} autoFocus />
          {fe.name && <span className="field-error">{fe.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="c-slug">Slug *</label>
          <input id="c-slug" className={"input" + (fe.slug ? " invalid" : "")} value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: e.target.value }); }} />
          {fe.slug ? <span className="field-error">{fe.slug}</span> : <span className="field-hint">Qidiruv havolasida ishlatiladi (lotin harflari, tire).</span>}
        </div>
        <div className="field">
          <label htmlFor="c-icon">Belgi nomi (ixtiyoriy)</label>
          <input id="c-icon" className="input" value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} />
        </div>
        <label className="row" style={{ gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} style={{ width: 18, height: 18 }} />
          Faol (e'lon berishda tanlash mumkin)
        </label>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Bekor qilish</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saqlanmoqda..." : "Saqlash"}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminCategories() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [modal, setModal] = useState(null); // {item?}

  const load = useCallback(async () => {
    try {
      const d = await api.get("/categories/");
      setList(Array.isArray(d) ? d : d.results || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function remove(c) {
    if (!window.confirm(`«${c.name}» kategoriyasini o'chirasizmi?`)) return;
    setError("");
    try {
      await api.del(`/categories/${c.id}/`);
      resetCatalog();
      setFlash("Kategoriya o'chirildi.");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="row">
        <span className="muted">{list ? `${list.length} ta kategoriya` : "Yuklanmoqda..."}</span>
        <span className="spacer" />
        <button className="btn btn-primary" onClick={() => setModal({})}>Yangi kategoriya</button>
      </div>
      {flash && <div className="alert alert-success" role="status">{flash}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {list === null && !error && <div className="skeleton" style={{ height: 200 }} />}

      {list && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Nomi</th><th>Slug</th><th>Faol e'lonlar</th><th>Holat</th><th /></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td className="muted">{c.slug}</td>
                  <td className="muted">{c.active_posts ?? 0}</td>
                  <td><span className={"chip " + (c.is_active ? "chip-found" : "chip-closed")}>{c.is_active ? "Faol" : "Nofaol"}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setModal({ item: c })}>Tahrirlash</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>O'chirish</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <CategoryModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); resetCatalog(); setFlash("Saqlandi."); load(); }}
        />
      )}
    </>
  );
}