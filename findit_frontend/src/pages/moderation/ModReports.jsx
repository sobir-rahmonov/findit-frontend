import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import useQueue from "../../hooks/useQueue.js";
import { formatDateTime } from "../../lib/format.js";
import PromptModal from "../../components/PromptModal.jsx";
import Icon from "../../components/Icon.jsx";
import { QueueView, StatusPills, pingMod } from "../../components/ModBits.jsx";

const STATUSES = [["open", "Ko'rilmagan"], ["resolved", "Hal qilingan"], ["dismissed", "Asossiz"]];
const CLS = { open: "pending", resolved: "found", dismissed: "closed" };

export default function ModReports() {
  const [status, setStatus] = useState("open");
  const [flash, setFlash] = useState("");
  const [modal, setModal] = useState(null); // { kind: "resolve"|"dismiss", report }
  const queue = useQueue("/moderation/reports/", { status });

  async function submit(note, rejectPost) {
    const { kind, report } = modal;
    const body = kind === "resolve" ? { note, reject_post: rejectPost } : { note };
    await api.post(`/moderation/reports/${report.id}/${kind}/`, body);
    setFlash("Bajarildi.");
    await queue.reload();
    pingMod();
  }

  return (
    <>
      <StatusPills options={STATUSES} value={status} onChange={(s) => { setStatus(s); setFlash(""); }} />
      {flash && <div className="alert alert-success" role="status">{flash}</div>}
      <div className="muted">{queue.items ? `${queue.count} ta shikoyat` : "Yuklanmoqda..."}</div>

      <QueueView queue={queue} emptyText="Bu bo'limda shikoyat yo'q.">
        {(queue.items || []).map((r) => (
          <article key={r.id} className="mod-card mod-col">
            <div className="row" style={{ gap: 8 }}>
              <span className={`chip chip-${CLS[r.status] || "closed"}`}>{r.status_display}</span>
              <span className="chip chip-pending">{r.reason_display}</span>
              <span className="dim" style={{ fontSize: 13 }}>{formatDateTime(r.created_at)}</span>
            </div>

            {r.post_info && (
              <div className="row" style={{ gap: 8 }}>
                <Icon name="flag" size={18} color="var(--sub)" />
                <span>E'lon:</span>
                <Link to={`/posts/${r.post_info.id}`} className="mytitle" style={{ fontSize: 17 }}>{r.post_info.title}</Link>
                <span className="dim" style={{ fontSize: 13 }}>muallif @{r.post_info.author_username}</span>
              </div>
            )}
            {r.target_info && (
              <div className="row" style={{ gap: 8 }}>
                <Icon name="user" size={18} color="var(--sub)" />
                <span>Foydalanuvchi: <strong>@{r.target_info.username}</strong>{r.target_info.is_blocked ? " (bloklangan)" : ""}</span>
              </div>
            )}

            <div className="muted mod-text">{r.text || "Izoh yozilmagan."}</div>
            <div className="dim" style={{ fontSize: 13 }}>Shikoyat qildi: @{r.reporter_username}</div>

            {r.resolution_note && (
              <div className="alert alert-info">Qaror ({r.handled_by_name || "—"}): {r.resolution_note}</div>
            )}

            {r.status === "open" && (
              <div className="row">
                <button className="btn btn-success" onClick={() => setModal({ kind: "resolve", report: r })}>Asosli, hal qilish</button>
                <button className="btn btn-outline" onClick={() => setModal({ kind: "dismiss", report: r })}>Asossiz</button>
              </div>
            )}
          </article>
        ))}
      </QueueView>

      {modal && (
        <PromptModal
          title={modal.kind === "resolve" ? "Shikoyatni hal qilish" : "Shikoyat asossiz"}
          description="Izoh shikoyat qilgan foydalanuvchiga xabar sifatida boradi."
          label="Qaror izohi"
          confirmLabel={modal.kind === "resolve" ? "Hal qilish" : "Asossiz deb yopish"}
          checkbox={modal.kind === "resolve" && modal.report.post_info ? { label: "E'lonni rad etish (olib tashlash)" } : null}
          onSubmit={submit}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}