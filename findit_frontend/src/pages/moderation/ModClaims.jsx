import { useState } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl } from "../../api/client.js";
import useQueue from "../../hooks/useQueue.js";
import { formatDate, formatDateTime } from "../../lib/format.js";
import PromptModal from "../../components/PromptModal.jsx";
import Icon from "../../components/Icon.jsx";
import { QueueView, StatusPills, pingMod } from "../../components/ModBits.jsx";

const STATUSES = [["pending", "Kutilmoqda"], ["approved", "Tasdiqlangan"], ["completed", "Topshirilgan"], ["rejected", "Rad etilgan"], ["cancelled", "Bekor qilingan"]];
const CLS = { pending: "pending", approved: "handover", rejected: "rejected", completed: "closed", cancelled: "closed" };

const MODALS = {
  approve: { title: "Da'voni tasdiqlash", description: "Da'vogarga buyum qayerdaligi ko'rinadi.", label: "Izoh", required: false, confirm: "Tasdiqlash", danger: false },
  reject: { title: "Da'voni rad etish", description: "Sabab da'vogarga ko'rinadi.", label: "Rad etish sababi", required: true, confirm: "Rad etish", danger: true },
  complete: { title: "Buyum topshirildi", description: "E'lon yopiladi.", label: "Topshirish izohi", required: false, confirm: "Topshirildi", danger: false },
  revoke: { title: "Tasdiqni bekor qilish", description: "Da'vo qayta rad etiladi, e'lon yana faol bo'ladi.", label: "Sabab", required: true, confirm: "Bekor qilish", danger: true },
};

export default function ModClaims() {
  const [status, setStatus] = useState("pending");
  const [flash, setFlash] = useState("");
  const [modal, setModal] = useState(null); // { kind, claim }
  const queue = useQueue("/moderation/claims/", { status });

  async function submit(text) {
    const { kind, claim } = modal;
    const body = kind === "reject" || kind === "revoke" ? { reason: text } : { note: text };
    await api.post(`/moderation/claims/${claim.id}/${kind}/`, body);
    setFlash("Bajarildi.");
    await queue.reload();
    pingMod();
  }

  const open = (kind, claim) => setModal({ kind, claim });
  const m = modal ? MODALS[modal.kind] : null;

  return (
    <>
      <StatusPills options={STATUSES} value={status} onChange={(s) => { setStatus(s); setFlash(""); }} />
      {flash && <div className="alert alert-success" role="status">{flash}</div>}
      <div className="muted">{queue.items ? `${queue.count} ta da'vo` : "Yuklanmoqda..."}</div>

      <QueueView queue={queue} emptyText="Bu bo'limda da'vo yo'q.">
        {(queue.items || []).map((c) => {
          const f = c.found_post_detail;
          const l = c.lost_post_detail;
          const proof = mediaUrl(c.proof_image);
          return (
            <article key={c.id} className="mod-card mod-col">
              <div className="row" style={{ gap: 8 }}>
                <span className={`chip chip-${CLS[c.status] || "closed"}`}>{c.status_display}</span>
                <span className="dim" style={{ fontSize: 13 }}>{formatDateTime(c.created_at)}</span>
              </div>

              <div className="row" style={{ gap: 12 }}>
                <Link to={`/posts/${c.found_post}`} className="mytitle">{c.found_post_title}</Link>
                <span className="dim" style={{ fontSize: 13 }}>
                  {f?.place_name} · {formatDate(f?.event_date)} · topgan: {f?.author_name}
                </span>
              </div>

              <div className="cmp">
                <div className="cmp-col">
                  <h4><Icon name="lock" size={16} /> Topgan odam qoldirgan yashirin belgi</h4>
                  <p>{f?.private_detail || "Kiritilmagan"}</p>
                  <small className="dim">Saqlanmoqda: {f?.storage_note || "ko'rsatilmagan"}</small>
                </div>
                <div className="cmp-col">
                  <h4><Icon name="user" size={16} /> Da'vogar yozgan belgilar</h4>
                  <p>{c.description}</p>
                  {proof && <a href={proof} target="_blank" rel="noreferrer"><img className="proof" src={proof} alt="Isbot rasmi" /></a>}
                </div>
              </div>

              <div className="dim" style={{ fontSize: 13 }}>
                Da'vogar: {c.claimant_name} (@{c.claimant_username}){c.claimant_phone ? ` · ${c.claimant_phone}` : ""}
                {l ? <> · uning e'loni: <Link to={`/posts/${l.id}`}>{l.title}</Link></> : " · e'loni bog'lanmagan"}
              </div>

              {c.moderator_note && <div className="alert alert-info">Moderator izohi ({c.moderator_name || "—"}): {c.moderator_note}</div>}
              {c.handover_note && <div className="muted" style={{ fontSize: 14 }}>Topshirish izohi: {c.handover_note}</div>}

              {c.status === "pending" && (
                <div className="row">
                  <button className="btn btn-success" onClick={() => open("approve", c)}><Icon name="check" size={18} /> Tasdiqlash</button>
                  <button className="btn btn-danger" onClick={() => open("reject", c)}><Icon name="x" size={18} /> Rad etish</button>
                </div>
              )}
              {c.status === "approved" && (
                <div className="row">
                  <button className="btn btn-success" onClick={() => open("complete", c)}><Icon name="check" size={18} /> Buyum topshirildi</button>
                  <button className="btn btn-danger" onClick={() => open("revoke", c)}>Tasdiqni bekor qilish</button>
                </div>
              )}
            </article>
          );
        })}
      </QueueView>

      {modal && (
        <PromptModal
          title={m.title}
          description={m.description}
          label={m.label}
          required={m.required}
          confirmLabel={m.confirm}
          danger={m.danger}
          onSubmit={submit}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}