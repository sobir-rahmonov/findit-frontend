import { useState } from "react";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import useQueue from "../../hooks/useQueue.js";
import { formatDate } from "../../lib/format.js";
import PromptModal from "../../components/PromptModal.jsx";
import { QueueView } from "../../components/ModBits.jsx";

const ROLE = { user: "Foydalanuvchi", moderator: "Moderator", admin: "Administrator" };

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [blocked, setBlocked] = useState("");
  const [flash, setFlash] = useState("");
  const [blocking, setBlocking] = useState(null);

  const queue = useQueue("/admin/users/", { search, role, is_blocked: blocked });

  async function act(fn, okMsg) {
    queue.setError("");
    try {
      await fn();
      setFlash(okMsg);
      await queue.reload();
    } catch (e) {
      queue.setError(e.message);
    }
  }

  const unblock = (u) => act(() => api.post(`/admin/users/${u.id}/unblock/`), `@${u.username} blokdan chiqarildi.`);

  function changeRole(u, newRole) {
    if (!window.confirm(`@${u.username} rolini «${ROLE[newRole]}» ga o'zgartirasizmi?`)) return;
    act(() => api.post(`/admin/users/${u.id}/set-role/`, { role: newRole }), `@${u.username} roli o'zgardi.`);
  }

  return (
    <>
      <form className="row filters-row" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); }}>
        <input className="input" style={{ flex: "1 1 240px", width: "auto" }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ism, username, email yoki telefon" aria-label="Qidirish" />
        <select className="select" style={{ width: "auto" }} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Rol">
          <option value="">Barcha rollar</option>
          <option value="user">Foydalanuvchi</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Administrator</option>
        </select>
        <select className="select" style={{ width: "auto" }} value={blocked} onChange={(e) => setBlocked(e.target.value)} aria-label="Holat">
          <option value="">Hammasi</option>
          <option value="false">Faol</option>
          <option value="true">Bloklangan</option>
        </select>
        <button className="btn btn-primary" type="submit">Qidirish</button>
      </form>

      {flash && <div className="alert alert-success" role="status">{flash}</div>}
      <div className="muted">{queue.items ? `${queue.count} ta foydalanuvchi` : "Yuklanmoqda..."}</div>

      <QueueView queue={queue} emptyText="Foydalanuvchi topilmadi.">
        {queue.items && queue.items.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Foydalanuvchi</th><th>Aloqa</th><th>Rol</th><th>E'lon / da'vo</th><th>Qo'shilgan</th><th /></tr>
              </thead>
              <tbody>
                {queue.items.map((u) => {
                  const self = u.id === me.id;
                  const isAdmin = u.role === "admin";
                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.full_name}</strong>
                        <div className="dim">@{u.username}</div>
                        {u.is_blocked && <div className="chip chip-rejected" title={u.blocked_reason}>Bloklangan{u.blocked_reason ? `: ${u.blocked_reason}` : ""}</div>}
                      </td>
                      <td className="muted">{u.email || "—"}<div className="dim">{u.phone || ""}</div></td>
                      <td>
                        {isAdmin || self ? (
                          <span className="chip chip-active">{ROLE[u.role]}</span>
                        ) : (
                          <select className="select sel-sm" value={u.role} onChange={(e) => changeRole(u, e.target.value)} aria-label={`@${u.username} roli`}>
                            <option value="user">Foydalanuvchi</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        )}
                      </td>
                      <td className="muted">{u.posts_count} / {u.claims_count}</td>
                      <td className="muted">{formatDate(u.date_joined)}</td>
                      <td style={{ textAlign: "right" }}>
                        {!isAdmin && !self && (u.is_blocked
                          ? <button className="btn btn-outline btn-sm" onClick={() => unblock(u)}>Blokdan chiqarish</button>
                          : <button className="btn btn-danger btn-sm" onClick={() => setBlocking(u)}>Bloklash</button>)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </QueueView>

      {blocking && (
        <PromptModal
          title={`@${blocking.username} ni bloklash`}
          description="Foydalanuvchi darhol tizimdan chiqariladi va qayta kira olmaydi."
          label="Sabab"
          required={false}
          confirmLabel="Bloklash"
          danger
          onSubmit={async (reason) => {
            await api.post(`/admin/users/${blocking.id}/block/`, { reason });
            setFlash(`@${blocking.username} bloklandi.`);
            await queue.reload();
          }}
          onClose={() => setBlocking(null)}
        />
      )}
    </>
  );
}