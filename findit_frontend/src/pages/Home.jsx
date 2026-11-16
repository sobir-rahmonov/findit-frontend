import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import useCatalog from "../hooks/useCatalog.js";
import PostCard from "../components/PostCard.jsx";
import Icon from "../components/Icon.jsx";
import "../components/PostCard.css";
import "./Home.css";

const STEPS = [
  { n: "1", t: "E'lon bering", d: "Yo'qotgan yoki topgan buyumingizni rasm, joy va sana bilan yozing." },
  { n: "2", t: "Tizim moslaydi", d: "Rang, joy, sana va kategoriya bo'yicha mos e'lonlar avtomatik topiladi." },
  { n: "3", t: "Egalik tasdiqlanadi", d: "Moderator da'voni topgan odam qoldirgan yashirin belgi bilan solishtiradi." },
];

export default function Home() {
  const navigate = useNavigate();
  const { places } = useCatalog();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState(null);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    let alive = true;
    api.get("/posts/", { ordering: "-created_at" })
      .then((d) => {
        if (!alive) return;
        setRecent((d.results || []).slice(0, 6));
        setTotal(d.count);
      })
      .catch(() => alive && setRecent([]));
    return () => { alive = false; };
  }, []);

  function onSearch(e) {
    e.preventDefault();
    navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-in">
          <span className="hero-tag"><span className="dot found" /> Jamoat joylari uchun yagona ro'yxat</span>
          <h1>Yo'qolgan buyum<br />egasini topadi.</h1>
          <p className="muted hero-sub">
            Universitet, savdo markazi, kutubxona va aeroportlarda yo'qolgan va topilgan buyumlar.
            E'lon bering, tizim mosini o'zi topadi.
          </p>

          <form className="hero-search" onSubmit={onSearch} role="search">
            <Icon name="search" color="var(--dim)" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Masalan: qora hamyon, AirPods, pasport"
              aria-label="Buyumni qidirish"
            />
            <button className="btn btn-primary" type="submit">Qidirish</button>
          </form>

          <div className="hero-cta">
            <Link to="/posts/new?type=lost" className="btn btn-outline btn-lg cta-lost">Men yo'qotdim</Link>
            <Link to="/posts/new?type=found" className="btn btn-outline btn-lg cta-found">Men topdim</Link>
          </div>

          {total != null && <div className="dim hero-count">Hozir faol e'lonlar: <strong>{total}</strong></div>}
        </div>
      </section>

      <section className="container home-sec">
        <div className="sec-head">
          <h2>So'nggi e'lonlar</h2>
          <Link to="/search" className="btn btn-ghost btn-sm">Hammasi →</Link>
        </div>
        {recent === null ? (
          <div className="post-grid">{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 280 }} />)}</div>
        ) : recent.length === 0 ? (
          <div className="empty">Hozircha faol e'lon yo'q. Birinchi bo'ling!</div>
        ) : (
          <div className="post-grid">{recent.map((p) => <PostCard key={p.id} post={p} />)}</div>
        )}
      </section>

      <section className="container home-sec">
        <h2>Qanday ishlaydi</h2>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n} className="card step">
              <span className="step-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p className="muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {places.length > 0 && (
        <section className="container home-sec">
          <h2>Joylar bo'yicha qidirish</h2>
          <div className="place-grid">
            {places.slice(0, 8).map((p) => (
              <Link key={p.id} to={`/search?place=${p.id}`} className="place-card">
                <strong>{p.name}</strong>
                <span className="dim">{p.place_type_display}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container home-sec" style={{ paddingBottom: 96 }}>
        <div className="cta-band">
          <div>
            <h2>Buyum yo'qoldimi yoki topdingizmi?</h2>
            <p className="muted">Bir daqiqada e'lon bering. Moderator tekshirgach, hamma ko'radi.</p>
          </div>
          <Link to="/posts/new" className="btn btn-primary btn-lg">E'lon qo'shish</Link>
        </div>
      </section>
    </>
  );
}