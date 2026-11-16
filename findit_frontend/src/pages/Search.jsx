import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import useCatalog from "../hooks/useCatalog.js";
import { COLORS } from "../lib/format.js";
import PostCard from "../components/PostCard.jsx";
import PostMap from "../components/PostMap.jsx";
import Icon from "../components/Icon.jsx";
import "../components/PostCard.css";
import "./Search.css";

const PAGE_SIZE = 12;
const FILTER_KEYS = ["type", "category", "place", "color", "date_from", "date_to"];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const { categories, places } = useCatalog();
  const [q, setQ] = useState(params.get("q") || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const view = params.get("view") === "map" ? "map" : "list";
  const page = Number(params.get("page") || 1);
  const key = params.toString();

  function update(patch) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === "" || v == null) next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  }

  function resetAll() {
    setQ("");
    setParams(view === "map" ? { view: "map" } : {});
  }

  useEffect(() => {
    let alive = true;
    setData(null);
    setError("");
    api.get("/posts/", {
      search: params.get("q") || "",
      type: params.get("type") || "",
      category: params.get("category") || "",
      place: params.get("place") || "",
      color: params.get("color") || "",
      date_from: params.get("date_from") || "",
      date_to: params.get("date_to") || "",
      ordering: params.get("ordering") || "-created_at",
      page,
    })
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const hasFilters = FILTER_KEYS.some((k) => params.get(k)) || params.get("q");
  const pages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;
  const type = params.get("type") || "";

  const filters = (
    <div className="filters card">
      <div className="field">
        <span className="label">Turi</span>
        <div className="seg">
          {[["", "Hammasi"], ["lost", "Yo'qolgan"], ["found", "Topilgan"]].map(([v, l]) => (
            <button key={v} type="button" className={type === v ? "on" : ""} onClick={() => update({ type: v })}>{l}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="f-cat">Kategoriya</label>
        <select id="f-cat" className="select" value={params.get("category") || ""} onChange={(e) => update({ category: e.target.value })}>
          <option value="">Hammasi</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-place">Joy</label>
        <select id="f-place" className="select" value={params.get("place") || ""} onChange={(e) => update({ place: e.target.value })}>
          <option value="">Hammasi</option>
          {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
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
              aria-pressed={params.get("color") === c.value}
              className={"swatch" + (params.get("color") === c.value ? " on" : "")}
              style={{ background: c.hex }}
              onClick={() => update({ color: params.get("color") === c.value ? "" : c.value })}
            />
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="f-from">Sanadan</label>
        <input id="f-from" type="date" className="input" value={params.get("date_from") || ""} onChange={(e) => update({ date_from: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="f-to">Sanagacha</label>
        <input id="f-to" type="date" className="input" value={params.get("date_to") || ""} onChange={(e) => update({ date_to: e.target.value })} />
      </div>

      {hasFilters && <button type="button" className="btn btn-outline btn-block" onClick={resetAll}>Filtrlarni tozalash</button>}
    </div>
  );

  return (
    <div className="container page">
      <div className="row">
        <h1 className="page-title">Qidiruv</h1>
        <span className="spacer" />
        <div className="seg view-seg">
          <button type="button" className={view === "list" ? "on" : ""} onClick={() => update({ view: "", page: params.get("page") || "" })}>
            <Icon name="list" size={18} /> Ro'yxat
          </button>
          <button type="button" className={view === "map" ? "on" : ""} onClick={() => update({ view: "map", page: params.get("page") || "" })}>
            <Icon name="map" size={18} /> Xarita
          </button>
        </div>
      </div>

      <form className="search-bar" role="search" onSubmit={(e) => { e.preventDefault(); update({ q: q.trim() }); }}>
        <Icon name="search" color="var(--dim)" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nomi, tavsifi yoki brend bo'yicha" aria-label="Qidirish" />
        <button type="submit" className="btn btn-primary btn-sm">Qidirish</button>
      </form>

      <button type="button" className="btn btn-outline filters-toggle" onClick={() => setShowFilters((v) => !v)}>
        <Icon name="sliders" size={18} /> Filtrlar
      </button>

      <div className="search-layout">
        <aside className={"search-side" + (showFilters ? " open" : "")}>{filters}</aside>

        <section className="search-main">
          <div className="row results-head">
            <span className="muted">{data ? `${data.count} ta e'lon topildi` : "Yuklanmoqda..."}</span>
            <span className="spacer" />
            <label className="sr-only" htmlFor="ord">Saralash</label>
            <select id="ord" className="select ord" value={params.get("ordering") || "-created_at"} onChange={(e) => update({ ordering: e.target.value })}>
              <option value="-created_at">Yangilari avval</option>
              <option value="created_at">Eskilari avval</option>
              <option value="-event_date">Sana bo'yicha</option>
            </select>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {!data && !error && (
            <div className="post-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton" style={{ height: 280 }} />)}</div>
          )}

          {data && data.results.length === 0 && (
            <div className="empty">
              <strong>Hech narsa topilmadi.</strong>
              <p>Filtrlarni o'zgartirib ko'ring yoki so'rovni qisqartiring.</p>
            </div>
          )}

          {data && data.results.length > 0 && (
            view === "map"
              ? <PostMap posts={data.results} height={560} />
              : <div className="post-grid">{data.results.map((p) => <PostCard key={p.id} post={p} />)}</div>
          )}

          {data && pages > 1 && (
            <nav className="pager" aria-label="Sahifalar">
              <button className="btn btn-outline btn-sm" disabled={!data.previous} onClick={() => update({ page: page - 1 > 1 ? page - 1 : "" })}>← Oldingi</button>
              <span className="muted">{page} / {pages}</span>
              <button className="btn btn-outline btn-sm" disabled={!data.next} onClick={() => update({ page: page + 1 })}>Keyingi →</button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}