import { Link } from "react-router-dom";

const LOST = [
  "Ro'yxatdan o'ting va «E'lon qo'shish» tugmasini bosing.",
  "Buyum turi, rangi, yo'qolgan joy va sanani kiriting. Rasm qo'shsangiz, topish osonroq.",
  "Tizim mos «topilgan» e'lonlarni ko'rsatadi. Buyumingizni topsangiz, «Bu mening buyumim» tugmasini bosing.",
  "Moderator da'voni tekshiradi, tasdiqlansa buyum qayerda saqlanayotgani ko'rinadi.",
];
const FOUND = [
  "Topilgan buyum haqida e'lon bering va qayerda saqlayotganingizni yozing.",
  "Faqat egasi biladigan yashirin belgini kiriting. U hammaga ko'rinmaydi.",
  "Egasi da'vo yuborsa, moderator belgilarni solishtiradi.",
  "Tasdiqlangach, buyumni egasiga topshirasiz va e'lon yopiladi.",
];

function Steps({ title, items, color }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 26, color }}>{title}</h2>
      <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }} className="muted">
        {items.map((t) => <li key={t}>{t}</li>)}
      </ol>
    </div>
  );
}

export default function How() {
  return (
    <div className="container page narrow">
      <h1 className="page-title">Qanday ishlaydi</h1>
      <p className="muted" style={{ maxWidth: 620, margin: 0 }}>
        FindIt yo'qolgan va topilgan buyumlarni bir joyga to'playdi va egasini topishga yordam beradi.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <Steps title="Buyum yo'qotdim" items={LOST} color="var(--lost)" />
        <Steps title="Buyum topdim" items={FOUND} color="var(--found)" />
      </div>
      <div className="row">
        <Link to="/posts/new" className="btn btn-primary btn-lg">E'lon qo'shish</Link>
        <Link to="/search" className="btn btn-outline btn-lg">Qidirish</Link>
      </div>
    </div>
  );
}