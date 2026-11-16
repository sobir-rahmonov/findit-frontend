import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import { STATUS_LABELS, TYPE_LABELS } from "../../lib/format.js";

const CLAIM_LABELS = { pending: "Ko'rib chiqilmoqda", approved: "Tasdiqlangan", rejected: "Rad etilgan", completed: "Topshirilgan", cancelled: "Bekor qilingan" };
const REPORT_LABELS = { open: "Ko'rilmagan", resolved: "Hal qilingan", dismissed: "Asossiz" };
const ROLE_LABELS = { user: "Foydalanuvchi", moderator: "Moderator", admin: "Administrator" };

function Stat({ label, value, to, tone }) {
  const body = (
    <>
      <span className="muted" style={{ fontSize: 14 }}>{label}</span>
      <strong className="stat-n" style={tone ? { color: tone } : undefined}>{value}</strong>
    </>
  );
  return to ? <Link to={to} className="card stat">{body}</Link> : <div className="card stat">{body}</div>;
}

function BarList({ title, items, color = "var(--info)" }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="card">
      <h3 style={{ fontSize: 18, marginBottom: 14 }}>{title}</h3>
      <div className="bars">
        {items.map((i) => (
          <div key={i.label} className="bar-row">
            <span className="bar-label">{i.label}</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${(i.value / max) * 100}%`, background: i.color || color }} /></div>
            <span className="bar-val">{i.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Trend({ days }) {
  const max = Math.max(1, ...days.map((d) => Math.max(d.lost, d.found)));
  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 18 }}>Oxirgi 14 kun: yangi e'lonlar</h3>
        <span className="spacer" />
        <span className="legend"><i style={{ background: "var(--lost)" }} /> Yo'qolgan</span>
        <span className="legend"><i style={{ background: "var(--found)" }} /> Topilgan</span>
      </div>
      <div className="trend" role="img" aria-label="Kunlik e'lonlar grafigi">
        {days.map((d) => (
          <div key={d.date} className="trend-col" title={`${d.date}: yo'qolgan ${d.lost}, topilgan ${d.found}`}>
            <div className="trend-bars">
              <div style={{ height: `${(d.lost / max) * 100}%`, background: "var(--lost)" }} />
              <div style={{ height: `${(d.found / max) * 100}%`, background: "var(--found)" }} />
            </div>
            <span className="dim trend-d">{Number(d.date.slice(8))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const toItems = (obj, labels) => Object.entries(obj).map(([k, v]) => ({ label: labels[k] || k, value: v }));

export default function AdminStats() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/statistics/").then(setD).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!d) return <div className="skeleton" style={{ height: 320 }} />;

  return (
    <>
      <div className="stat-grid">
        <Stat label="Tekshiruvdagi e'lonlar" value={d.queues.pending_posts} to="/moderation/posts" tone="var(--warn)" />
        <Stat label="Kutilayotgan da'volar" value={d.queues.pending_claims} to="/moderation/claims" tone="var(--warn)" />
        <Stat label="Ko'rilmagan shikoyatlar" value={d.queues.open_reports} to="/moderation/reports" tone="var(--danger)" />
      </div>

      <div className="stat-grid">
        <Stat label="Foydalanuvchilar" value={d.users.total} />
        <Stat label="E'lonlar" value={d.posts.total} />
        <Stat label="Da'volar" value={d.claims.total} />
        <Stat label="Egasiga qaytgan buyumlar" value={`${d.returns.returned_items} (${d.returns.return_rate_percent}%)`} tone="var(--found)" />
      </div>

      <Trend days={d.posts.per_day} />

      <div className="grid-2">
        <BarList title="E'lonlar holati" items={toItems(d.posts.by_status, STATUS_LABELS)} />
        <BarList
          title="E'lon turlari (faol)"
          items={Object.entries(d.posts.active_by_type).map(([k, v]) => ({ label: TYPE_LABELS[k] || k, value: v, color: k === "found" ? "var(--found)" : "var(--lost)" }))}
        />
        <BarList title="Da'volar holati" items={toItems(d.claims.by_status, CLAIM_LABELS)} color="var(--found)" />
        <BarList title="Shikoyatlar holati" items={toItems(d.reports.by_status, REPORT_LABELS)} color="var(--warn)" />
        <BarList title="Foydalanuvchilar rollari" items={toItems(d.users.by_role, ROLE_LABELS)} />
        <BarList title="Eng ko'p e'lon berilgan kategoriyalar" items={d.posts.top_categories.map((c) => ({ label: c.name, value: c.count }))} color="var(--lost)" />
      </div>

      <div className="muted" style={{ fontSize: 14 }}>
        Bloklangan foydalanuvchilar: {d.users.blocked} · So'nggi 7 kunda qo'shilgan: {d.users.new_last_7_days} · Topilgan mosliklar: {d.matches.total}
      </div>
    </>
  );
}