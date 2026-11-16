import { STATUS_LABELS, TYPE_LABELS } from "../lib/format.js";

export function TypeChip({ type }) {
  return <span className={`chip chip-${type}`}>{TYPE_LABELS[type] || type}</span>;
}

export function StatusChip({ status }) {
  return <span className={`chip chip-${status}`}>{STATUS_LABELS[status] || status}</span>;
}