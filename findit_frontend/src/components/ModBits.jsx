export const pingMod = () => window.dispatchEvent(new Event("findit:mod"));

export function StatusPills({ options, value, onChange }) {
  return (
    <div className="pills">
      {options.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={value === k} className={"pill" + (value === k ? " on" : "")} onClick={() => onChange(k)}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function QueueView({ queue, emptyText, children }) {
  const { items, error, next, more, loadingMore } = queue;
  return (
    <>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {items === null && !error && (
        <div className="mylist">{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 140 }} />)}</div>
      )}
      {items && items.length === 0 && <div className="empty">{emptyText}</div>}
      <div className="mod-list">{children}</div>
      {next && (
        <div style={{ textAlign: "center" }}>
          <button className="btn btn-outline" onClick={more} disabled={loadingMore}>{loadingMore ? "Yuklanmoqda..." : "Yana ko'rsatish"}</button>
        </div>
      )}
    </>
  );
}