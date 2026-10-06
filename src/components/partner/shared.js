/* Partner board — shared constants and helpers (desktop + mobile views). */
import { CircleDashed, Loader, CheckCircle2, Ban, Cpu } from "lucide-react";

export const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const STATUS = {
  new: { l: "Not started", I: CircleDashed, d: "Not started yet" },
  working: { l: "Working", I: Loader, d: "You started on it" },
  removed: { l: "Removed", I: CheckCircle2, d: "Review is gone" },
  notpossible: { l: "Not possible", I: Ban, d: "Can’t be removed" },
  software: { l: "Software only", I: Cpu, d: "Needs the software" },
};
export const MARKS = ["working", "removed", "notpossible", "software"];
export const TABS = [
  ["todo", "To do", (t) => t.status === "new" || t.status === "working"],
  ["removed", "Removed", (t) => t.status === "removed"],
  ["closed", "Not possible", (t) => t.status === "notpossible" || t.status === "software"],
  ["all", "All", () => true],
];
/** „Removed" only from „Working" (enforced server-side as well). */
export const canRemove = (t) => !!t && t.status === "working";

export const toUi = (s) => (s === "not_possible" ? "notpossible" : s || "new");
export const toApi = (s) => (s === "notpossible" ? "not_possible" : s);
export const usd = (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
export const ago = (ms) => {
  if (!ms) return "";
  const m = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
};
/** Working duration: „just now", „12 min", „3 h 20 min", „1 d 4 h". */
export const since = (ms) => {
  const m = Math.max(0, Math.floor((Date.now() - ms) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return m + " min";
  const hh = Math.floor(m / 60), mm = m % 60;
  if (hh < 24) return hh + " h" + (mm ? " " + mm + " min" : "");
  const d = Math.floor(hh / 24);
  return d + " d " + (hh % 24) + " h";
};
export const pillLabel = (t) => {
  if (t.status === "removed" && t.paid) return "Paid";
  if (t.status === "software" && t.sw === "declined") return "Software · Customer declined deletion";
  if (t.status === "software") return "Software · waiting for customer";
  if (t.status === "working" && t.sw === "paid") return "Software · customer paid – start now";
  if (t.status === "working" && t.workingSince) return "Working · " + since(t.workingSince);
  return (STATUS[t.status] || STATUS.new).l;
};

export function norm(t) {
  const who = (t.reviewer || "").trim();
  const text = (t.text || "").trim();
  return {
    id: t.id, code: t.code, cust: (t.customer || "").trim() || "Other", url: t.url || "",
    who: t.kind === "profile" ? "Google profile" : who || (text ? "Reviewer" : "Google review"), text, shot: t.shot || null,
    price: Number(t.price || 0), old: t.kind === "old", nt: t.kind === "nt", status: toUi(t.status), paid: !!t.paid,
    note: t.note || "", created: t.created ? new Date(t.created).getTime() : 0, touched: !!t.touched,
    workingSince: t.workingSince ? new Date(t.workingSince).getTime() : null,
    sw: t.sw || null, // 'pending' = waiting for the customer · 'paid' = customer prepaid, start now
  };
}

export async function call(path, body, keepalive) {
  const res = await fetch(OPS + "/partner/" + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: !!keepalive });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || "HTTP " + res.status);
  return j;
}
