/** Tasks nach Kunde (Profilname) gruppieren; Kunden mit den neuesten Aufgaben zuerst. */
export function groupByCustomer(tasks, fallback) {
  const m = new Map();
  for (const t of tasks) {
    const k = (t.customer || "").trim() || fallback;
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(t);
  }
  const last = (arr) => Math.max(...arr.map((t) => new Date(t.created || 0).getTime()));
  return [...m.entries()].sort((a, b) => last(b[1]) - last(a[1]));
}
