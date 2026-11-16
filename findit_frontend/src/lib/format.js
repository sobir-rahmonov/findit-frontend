const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktyabr", "noyabr", "dekabr"];

function toDate(iso) {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return isNaN(d) ? null : d;
}

export function formatDate(iso) {
  const d = toDate(iso);
  return d ? `${d.getDate()}-${MONTHS[d.getMonth()]}` : "";
}

export function formatDateFull(iso) {
  const d = toDate(iso);
  return d ? `${d.getDate()}-${MONTHS[d.getMonth()]}, ${d.getFullYear()}` : "";
}

export const COLORS = [
  { value: "black", label: "Qora", hex: "#1a1a1a" },
  { value: "white", label: "Oq", hex: "#f2f2f2" },
  { value: "gray", label: "Kulrang", hex: "#8a8f98" },
  { value: "red", label: "Qizil", hex: "#e5484d" },
  { value: "blue", label: "Ko'k", hex: "#3b82f6" },
  { value: "green", label: "Yashil", hex: "#30a46c" },
  { value: "yellow", label: "Sariq", hex: "#f5d90a" },
  { value: "orange", label: "To'q sariq", hex: "#f76b15" },
  { value: "purple", label: "Binafsha", hex: "#8e4ec6" },
  { value: "pink", label: "Pushti", hex: "#e93d82" },
  { value: "brown", label: "Jigarrang", hex: "#a2673d" },
  { value: "silver", label: "Kumush", hex: "#c0c4cc" },
  { value: "gold", label: "Oltin", hex: "#d4a72c" },
  { value: "other", label: "Boshqa", hex: "#5c6270" },
];

export const STATUS_LABELS = {
  pending: "Tekshiruvda",
  active: "Faol",
  handover: "Topshirilmoqda",
  closed: "Yopilgan",
  rejected: "Rad etilgan",
};

export const TYPE_LABELS = { lost: "Yo'qolgan", found: "Topilgan" };


export function formatDateTime(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${hh}:${mm}`;
}