import { useState } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl } from "../../api/client.js";
import useQueue from "../../hooks/useQueue.js";
import { formatDate, formatDateTime } from "../../lib/format.js";
import { StatusChip, TypeChip } from "../../components/Chips.jsx";
import PromptModal from "../../components/PromptModal.jsx";
import Icon from "../../components/Icon.jsx";
import { QueueView, StatusPills, pingMod } from "../../components/ModBits.jsx";

const STATUSES = [["pending", "Tekshiruvda"], ["active", "Faol"], ["rejected", "Rad etilgan"], ["handover", "Topshirilmoqda"], ["closed", "Yopilgan"]];

export default function ModPosts() {
  const [status, setStatus] = useState("pending");
  const [flash, setFlash] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const queue = useQueue("/moderation/posts/", { status });

  async function approve(p) {
    setBusyId(p.id);
    queue.setError("");
    try {
      await api.post(`/moderation/posts/${p.id}/approve/`);
      setFlash(`«${p.title}» tasdiqlandi.`);
      await queue.reload();
      pingMod();
    } catch (e) {
      queue.setError(e.message);
    }
    setBusyId(null);
  }

  async function reject(reason) {
    await api.post(`/moderation/posts/${rejecting.id}/reject/`, { reason });
    setFlash(`«${rejecting.title}» rad etildi.`);
    await queue.reload();
    pingMod();
  }

  return (
    <>
      <StatusPills options={STATUSES} value={status} onChange={(s) => { setStatus(s); setFlash(""); }} />
      {flash && <div className="alert alert-success" role="status">{flash}</div>}
      <div className="muted">{queue.items ? `${queue.count} ta e'lon` : "Yuklanmoqda..."}</div>

      <QueueView queue={queue} emptyText="Bu bo'limda e'lon yo'q.">
        {(queue.items || []).map((p) => {
          const img = mediaUrl(p.image);
          return (
            <article key={p.id} className="mod-card">
              <div className="mod-img">{img ? <img src={img} alt="" /> : <Icon name="image" size={28} stroke={1.5} color="var(--line-3)" />}</div>
              <div className="mod-main">
                <div className="row" style={{ gap: 8 }}>
                  <TypeChip type={p.type} />
                  <StatusChip status={p.status} />
                  {p.reports_count > 0 && <span className="chip chip-rejected">Shikoyat: {p.reports_count}</span>}
                  <span className="dim" style={{ fontSize: 13 }}>{formatDateTime(p.created_at)}</span>
                </div>
                <Link to={`/posts/${p.id}`} className="mytitle">{p.title}</Link>
                <div className="muted" style={{ fontSize: 14 }}>
                  {p.category_name} · {p.color_display} · {p.place_name || "Joy yo'q"} · {formatDate(p.event_date)}
                </div>
                {p.description && <div className="muted mod-text">{p.description}</div>}
                {p.type === "found" && (
                  <div className="mod-private">
                    <Icon name="lock" size={16} />
                    <div>
                      <div><strong>Yashirin belgi:</strong> {p.private_detail || "kiritilmagan"}</div>
                      <div className="dim">Saqlanmoqda: {p.storage_note || "ko'rsatilmagan"}</div>
                    </div>
                  </div>
                )}
                <div className="dim" style={{ fontSize: 13 }}>
                  Muallif: {p.author_name} (@{p.author_username}){p.author_phone ? ` · ${p.author_phone}` : ""}
                </div>
                {p.status === "rejected" && p.reject_reason && <div className="alert alert-error">Rad etish sababi: {p.reject_reason}</div>}
              </div>
              {p.status === "pending" && (
                <div className="mod-actions">
                  <button className="btn btn-success" onClick={() => approve(p)} disabled={busyId === p.id}>
                    <Icon name="check" size={18} /> Tasdiqlash
                  </button>
                  <button className="btn btn-danger" onClick={() => setRejecting(p)} disabled={busyId === p.id}>
                    <Icon name="x" size={18} /> Rad etish
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </QueueView>

      {rejecting && (
        <PromptModal
          title="E'lonni rad etish"
          description={`«${rejecting.title}». Sabab muallifga ko'rinadi.`}
          label="Rad etish sababi"
          placeholder="Masalan: rasm e'longa mos emas"
          confirmLabel="Rad etish"
          danger
          onSubmit={reject}
          onClose={() => setRejecting(null)}
        />
      )}
    </>
  );
}