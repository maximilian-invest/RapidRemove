"use client";
import React from "react";
import { Icon as BaseIcon } from "@/components/Icons";
import { AdminIcon } from "./AdminIcons";
import { SubsDashboard } from "./AdminSubs";
import { asset } from "@/lib/base";
import { sendAdminEmail, fetchAdminData, fetchStripe, fetchTemplates, sendPayLink, fetchEvents, sendTemplate } from "@/lib/admin-api";
import { SERVICES, STATUS_FLOW, TEMPLATES, COMPANY, money, crmExtras } from "@/lib/admin-data";
const AI = AdminIcon;
const Icon = { ...BaseIcon, ...AdminIcon };
/* RapidRemove Admin — Hauptanwendung (Dashboard, Bestellungen, E-Mail, Rechnungen) */


/* ---------- shared bits ---------- */
function StatusBadge({ status }) {
  const map = {
    new: ["st-new", "Neu"], progress: ["st-progress", "In Bearbeitung"], done: ["st-done", "Gelöscht"], storniert: ["st-refunded", "Storniert"],
  };
  const [cls, label] = map[status] || ["st-pending", status];
  return <span className={"badge-st " + cls}><span className="d"></span>{label}</span>;
}
function CheckBadge({ status }) {
  const map = {
    neu: ["st-new", "Neu geprüft"], kontaktiert: ["st-progress", "Kontaktiert"], konvertiert: ["st-done", "Beauftragt"], "kein-bedarf": ["st-pending", "Kein Bedarf"],
  };
  const [cls, label] = map[status] || ["st-pending", status];
  return <span className={"badge-st " + cls}><span className="d"></span>{label}</span>;
}
function PayBadge({ pay }) {
  const map = {
    paid: ["paid", Icon.checkCircle, "Bezahlt"], pending: ["pending", Icon.clock, "Ausstehend"], failed: ["failed", Icon.alert, "Fehlgeschlagen"], refunded: ["failed", AI.refund, "Erstattet"],
  };
  const [cls, I, label] = map[pay] || ["pending", Icon.clock, pay];
  return <span className={"pay-badge " + cls}><I />{label}</span>;
}
function initials(name) { return name.split(" ").filter(Boolean).slice(-2).map((s) => s[0]).join("").toUpperCase(); }
function fillVars(text, o) {
  const inv = "RE-" + o.id.replace("RR-", "");
  return text
    .replace(/\{\{name\}\}/g, o.name).replace(/\{\{order_id\}\}/g, o.id)
    .replace(/\{\{service\}\}/g, SERVICES[o.service].name).replace(/\{\{profile\}\}/g, o.profile)
    .replace(/\{\{amount\}\}/g, money(o.amount, o.country)).replace(/\{\{invoice_id\}\}/g, inv);
}

/* ---------- Sidebar ---------- */
function Sidebar({ view, setView, counts, open, live }) {
  const items = [
    ["dashboard", AI.grid, "Übersicht"],
    ["orders", AI.inbox, "Bestellungen", counts.new],
    ["subs", AI.euro, "Abos & Umsatz"],
    ["templates", Icon.mail, "E-Mail-Vorlagen"],
    ["customers", AI.users, "Kunden"],
  ];
  return (
    <aside className={"side" + (open ? " open" : "")}>
      <div className="side-logo">
        <img src={asset("/assets/rapidremove-logo-white.png")} alt="RapidRemove" />
        <span className="env">{live ? "Live" : "Demo"}</span>
      </div>
      <div className="side-sec">Betrieb</div>
      {items.map(([id, I, label, badge]) => (
        <button key={id} className={"side-link" + (view === id ? " on" : "")} onClick={() => setView(id)}>
          <I /> {label} {badge ? <span className="badge">{badge}</span> : null}
        </button>
      ))}
      <div className="side-sec">System</div>
      <button className={"side-link" + (view === "settings" ? " on" : "")} onClick={() => setView("settings")}>
        <AI.settings /> Einstellungen
      </button>
      <div className="side-foot">
        <div className="ava">MK</div>
        <div>
          <div className="nm">Matthias K.</div>
          <div className="rl">Inhaber · Admin</div>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Topbar ---------- */
function Topbar({ title, onBurger, query, setQuery }) {
  return (
    <div className="topbar">
      <button className="icon-btn burger" onClick={onBurger}><Icon.menu /></button>
      <h1>{title}</h1>
      <div className="search">
        <Icon.search />
        <input placeholder="Bestellung, Kunde oder E-Mail suchen…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="tb-right">
        <button className="icon-btn"><AI.bell /><span className="dot"></span></button>
        <button className="btn btn-pri"><AI.plus /> Neue Bestellung</button>
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ orders, checks, openOrder, openCheck }) {
  const newCount = orders.filter((o) => o.status === "new").length;
  const progressCount = orders.filter((o) => o.status === "progress").length;
  const revenue = orders.filter((o) => o.pay === "paid").reduce((s, o) => s + o.amount, 0);
  const newChecks = checks.filter((c) => c.status === "neu").length;
  const kpis = [
    { ic: AI.inbox, label: "Neue Bestellungen", val: newCount, d: "+3 heute", up: true },
    { ic: Icon.search, label: "Profile geprüft", val: checks.length, d: newChecks + " neu, unbearbeitet", up: true },
    { ic: Icon.clock, label: "In Bearbeitung", val: progressCount, d: "Ø 19 h Laufzeit", up: true },
    { ic: AI.euro, label: "Umsatz (bezahlt)", val: money(revenue, "DE"), d: "+12,4 % ggü. Vorwoche", up: true },
    { ic: AI.trendUp, label: "Prüfung → Auftrag", val: (checks.length ? Math.round(checks.filter((c) => c.status === "konvertiert").length / checks.length * 100) : 0) + " %", d: "Konversionsrate", up: true },
  ];
  return (
    <div className="content">
      <div className="kpis">
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className="kt"><span className="ic"><k.ic /></span>{k.label}</div>
            <div className="kv">{k.val}</div>
            <div className={"kd " + (k.up ? "up" : "down")}>{k.up ? <AI.trendUp /> : <AI.trendDown />}{k.d}</div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h2>Alle Bestellungen</h2>
            <div className="ph-right"><span className="muted" style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 700 }}>{orders.length} gesamt</span></div>
          </div>
          <div className="tbl-scroll">
            <table className="tbl">
              <thead><tr><th>Auftrag</th><th>Kunde</th><th>Leistung</th><th>Status</th><th>Betrag</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} onClick={() => openOrder(o)}>
                    <td><span className="oid">{o.id}</span><div className="muted">{o.created.split("·")[1]}</div></td>
                    <td><div className="cust">{o.name}<div className="sub">{o.company}</div></div></td>
                    <td>{SERVICES[o.service].name}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td><span className="amt">{o.amount ? money(o.amount, o.country) : "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Pipeline heute</h2></div>
          <div style={{ padding: "20px 22px" }}>
            {STATUS_FLOW.map((s) => {
              const n = orders.filter((o) => o.status === s.id).length;
              const pct = Math.round((n / orders.length) * 100);
              return (
                <div key={s.id} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13.5, fontWeight: 700 }}>
                    <span>{s.label}</span><span style={{ fontFamily: "var(--font-display)" }}>{n}</span>
                  </div>
                  <div style={{ height: 8, background: "var(--neutral-100)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: s.id === "done" ? "var(--success)" : s.id === "progress" ? "var(--warning)" : "var(--primary)", borderRadius: 4 }}></div>
                  </div>
                </div>
              );
            })}
            <div className="stripe-box" style={{ marginTop: 22 }}>
              <span className="sb-logo">stripe</span>
              <div style={{ fontSize: 12.5, color: "var(--fg-2)", fontWeight: 700 }}>Live verbunden</div>
              <span className="sb-status"><span className="badge-st st-done"><span className="d"></span>Aktiv</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Geprüfte Profile (Leads aus dem kostenlosen Prüf-Tool) */}
      <div className="panel" style={{ marginTop: 22 }}>
        <div className="panel-head">
          <h2><Icon.search style={{ width: 17, height: 17, verticalAlign: "-3px", marginRight: 7, color: "var(--primary)" }} />Geprüfte Profile</h2>
          <div className="ph-right">
            <span className="muted" style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 700 }}>{checks.length} Prüfungen · {checks.filter((c) => c.status === "neu").length} unbearbeitet</span>
          </div>
        </div>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead><tr><th>Prüfung</th><th>Google-Profil</th><th>Bewertung</th><th>Auffällig</th><th>Empfehlung</th><th>Status</th></tr></thead>
            <tbody>
              {checks.map((c) => {
                const linked = c.orderId ? orders.find((o) => o.id === c.orderId) : null;
                return (
                  <tr key={c.id} onClick={() => linked ? openCheck(linked) : null} style={{ cursor: linked ? "pointer" : "default" }}>
                    <td><span className="oid">{c.id}</span><div className="muted">{c.created.split("·")[1]}</div></td>
                    <td><div className="cust">{c.profile}<div className="sub">{c.name !== "—" ? c.name : c.email}</div></div></td>
                    <td><span className="amt" style={{ fontFamily: "var(--font-display)" }}>{c.rating}★</span><div className="muted">{c.reviews} Bew.</div></td>
                    <td><span className={"flag-pill " + (c.flagged >= 10 ? "hi" : c.flagged >= 4 ? "mid" : "lo")}>{c.flagged + " verdächtig"}</span></td>
                    <td>{SERVICES[c.recommend].name}</td>
                    <td>
                      <CheckBadge status={c.status} />
                      {c.orderId ? <div className="muted" style={{ marginTop: 3 }}>{c.orderId}</div> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Orders list ---------- */
function Orders({ orders, openOrder, query }) {
  const [filter, setFilter] = React.useState("all");
  const filters = [
    ["all", "Alle", orders.length],
    ["new", "Neu", orders.filter((o) => o.status === "new").length],
    ["progress", "In Bearbeitung", orders.filter((o) => o.status === "progress").length],
    ["done", "Gelöscht", orders.filter((o) => o.status === "done").length],
    ["pending", "Zahlung offen", orders.filter((o) => o.pay === "pending" || o.pay === "failed").length],
  ];
  let list = orders;
  if (filter === "pending") list = orders.filter((o) => o.pay === "pending" || o.pay === "failed");
  else if (filter !== "all") list = orders.filter((o) => o.status === filter);
  if (query.trim()) {
    const q = query.toLowerCase();
    list = list.filter((o) => (o.name + o.email + o.id + o.company).toLowerCase().includes(q));
  }
  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <div className="chips">
            {filters.map(([id, label, n]) => (
              <button key={id} className={"chipf" + (filter === id ? " on" : "")} onClick={() => setFilter(id)}>
                {label} <span className="ct">{n}</span>
              </button>
            ))}
          </div>
          <div className="ph-right"><button className="btn btn-sec btn-sm"><AI.download /> Export</button></div>
        </div>
        {list.length ? (
          <table className="tbl">
            <thead><tr><th>Auftrag</th><th>Kunde</th><th>Leistung</th><th>Zahlung</th><th>Status</th><th>Betrag</th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} onClick={() => openOrder(o)}>
                  <td><span className="oid">{o.id}</span><div className="muted">{o.created}</div></td>
                  <td><div className="cust">{o.name}<div className="sub">{o.email}</div></div></td>
                  <td>{SERVICES[o.service].name}{o.protection ? <div className="muted">+ Schutz</div> : null}</td>
                  <td><PayBadge pay={o.pay} /></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><span className="amt">{o.amount ? money(o.amount, o.country) : "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty"><AI.inbox /><p>Keine Bestellungen in diesem Filter.</p></div>
        )}
      </div>
    </div>
  );
}

/* ---------- Order drawer ---------- */
function OrderDrawer({ order, onClose, onStatus, onCompose, onPayLink, onOpenFull, toast }) {
  if (!order) return <React.Fragment><div className="drawer-scrim"></div><div className="drawer"></div></React.Fragment>;
  const o = order;
  const curIdx = STATUS_FLOW.findIndex((s) => s.id === o.status);
  const total = o.amount + (o.protection && o.protAmount ? o.protAmount : 0);
  return (
    <React.Fragment>
      <div className="drawer-scrim open" onClick={onClose}></div>
      <div className="drawer open">
        <div className="drawer-top">
          <div>
            <div className="dt-id">{o.id}</div>
            <div className="dt-sub">{o.created} · {o.country}</div>
          </div>
          <button className="btn btn-sec btn-sm" style={{ marginLeft: "auto" }} onClick={() => onOpenFull(o)}><Icon.user /> Volle Kundenakte</button>
          <button className="drawer-close" onClick={onClose}><Icon.x /></button>
        </div>
        <div className="drawer-body">
          {/* status pipeline */}
          <div className="dsec">
            <h3><Icon.zap /> Status aktualisieren <span className="right"><StatusBadge status={o.status} /></span></h3>
            <div className="dpipe">
              {STATUS_FLOW.map((s, i) => {
                const cls = i < curIdx ? "done" : i === curIdx ? "active" : "";
                return (
                  <div className={"dpipe-step " + cls} key={s.id} onClick={() => onStatus(o, s.id)}>
                    {i < STATUS_FLOW.length - 1 && <div className="dpipe-rail"></div>}
                    <div className="dpipe-dot">{i < curIdx ? <Icon.check /> : i === curIdx ? <Icon.clock /> : i + 1}</div>
                    <div className="dpipe-body">
                      <div className="pt">{s.label}{i === curIdx && <span className="now">JETZT</span>}</div>
                      <div className="pd">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {curIdx < STATUS_FLOW.length - 1 && (
                <button className="btn btn-pri btn-sm" onClick={() => onStatus(o, STATUS_FLOW[curIdx + 1].id)}>
                  <Icon.arrowRight /> Auf „{STATUS_FLOW[curIdx + 1].label}" setzen
                </button>
              )}
              <button className="btn btn-sec btn-sm" onClick={() => onCompose(o, TEMPLATES.find((t) => t.id === (o.status === "done" ? "done" : "progress")))}>
                <Icon.mail /> Status-Mail
              </button>
            </div>
          </div>

          {/* customer */}
          <div className="dsec">
            <h3><Icon.user /> Kunde</h3>
            <div className="cust-head">
              <div className="ca">{initials(o.name)}</div>
              <div><div className="cn">{o.name}</div><div className="cm">{o.company}</div></div>
            </div>
            <div className="drow"><span className="dl">E-Mail</span><span className="dv">{o.email}</span></div>
            <div className="drow"><span className="dl">Telefon</span><span className="dv">{o.phone}</span></div>
            <div className="cust-acts">
              <button className="btn btn-sec btn-sm" onClick={() => onCompose(o, TEMPLATES[0])}><Icon.mail /> E-Mail</button>
              <a className="btn btn-sec btn-sm" href={"tel:" + o.phone.replace(/\s/g, "")}><Icon.phone /> Anrufen</a>
              <a className="btn btn-sec btn-sm" href="#"><Icon.whatsapp /> WhatsApp</a>
            </div>
          </div>

          {/* profile / service */}
          <div className="dsec">
            <h3><Icon.building /> Profil & Leistung</h3>
            <div className="drow"><span className="dl">Google-Profil</span><span className="dv">{o.profile}</span></div>
            <div className="drow"><span className="dl">Bewertungen</span><span className="dv">{o.rating}★ · {o.reviews} Stück</span></div>
            <div className="drow"><span className="dl">Leistung</span><span className="dv">{SERVICES[o.service].name}</span></div>
            {o.protection && <div className="drow"><span className="dl">Schutz</span><span className="dv">{o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Monitoring" : "Monatlich"}</span></div>}
            <div className="drow"><span className="dl">Notiz</span><span className="dv" style={{ fontWeight: 600, color: "var(--fg-2)", maxWidth: 280 }}>{o.note}</span></div>
          </div>

          {/* payment / stripe */}
          <div className="dsec">
            <h3><Icon.lock /> Zahlung <span className="right"><PayBadge pay={o.pay} /></span></h3>
            <div className="stripe-box" style={{ marginBottom: 14 }}>
              <span className="sb-logo">stripe</span>
              <span className="sb-card"><AI.creditCard /> <span className="dots">•••• 4242</span></span>
              <span className="sb-status">{o.pay === "paid" ? <span className="badge-st st-paid"><span className="d" style={{ background: "var(--success)" }}></span>Erfasst</span> : o.pay === "failed" ? <span className="badge-st st-refunded"><span className="d"></span>Abgelehnt</span> : <span className="badge-st st-pending"><span className="d"></span>Reserviert</span>}</span>
            </div>
            <div className="drow"><span className="dl">Leistung</span><span className="dv">{o.amount ? money(o.amount, o.country) : "kostenlose Prüfung"}</span></div>
            {o.protection && o.protAmount ? <div className="drow"><span className="dl">Schutz</span><span className="dv">{money(o.protAmount, o.country)}{o.protection !== "lifetime" ? " /Mon." : ""}</span></div> : null}
            <div className="drow"><span className="dl" style={{ fontWeight: 800, color: "var(--fg)" }}>Gesamt</span><span className="dv" style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--primary)" }}>{o.amount ? money(total, o.country) : "—"}</span></div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {o.pay !== "paid" && o.amount ? <button className="btn btn-pri btn-sm" onClick={() => onPayLink(o)}><AI.send /> Zahlungslink senden</button> : null}
              {o.pay === "pending" && o.amount ? <button className="btn btn-sec btn-sm" onClick={() => toast("Stripe-Zahlung erfasst ✓")}><Icon.lock /> Zahlung erfassen</button> : null}
              {o.pay === "paid" ? <button className="btn btn-ghost btn-sm" onClick={() => toast("Rückerstattung über Stripe eingeleitet")}><AI.refund /> Erstatten</button> : null}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---------- Email composer ---------- */
function EmailComposer({ data, onClose, toast }) {
  const { order, template } = data || {};
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  React.useEffect(() => {
    if (template && order) { setSubject(fillVars(template.subject, order)); setBody(fillVars(template.body, order)); }
  }, [template, order]);
  if (!data) return <div className="modal-scrim"></div>;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.mail size={19} style={{ color: "var(--primary)" }} /></span>
          <div>
            <h3>E-Mail an {order.name}</h3>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{template ? template.name : "Neue Nachricht"} · {order.email}</div>
          </div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div className="fld"><label>Betreff</label><input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="fld"><label>Nachricht</label><textarea value={body} onChange={(e) => setBody(e.target.value)}></textarea></div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--fg-2)", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Platzhalter einfügen</label>
            <div className="var-row">
              {["{{name}}", "{{order_id}}", "{{profile}}", "{{amount}}", "{{invoice_id}}"].map((v) => (
                <span key={v} className="var-chip" onClick={() => setBody((b) => b + " " + v)}>{v}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 700, marginRight: "auto", display: "flex", alignItems: "center", gap: 6 }}><Icon.lock size={14} /> Versand über RapidRemove-Mailserver</span>
          <button className="btn btn-sec" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-pri" onClick={async () => { try { await sendAdminEmail({ to: order.email, subject, text: body, orderId: order.id, label: template ? template.name : "E-Mail" }); onClose(); toast("E-Mail an " + order.name + " gesendet ✓"); } catch (e) { toast("Senden fehlgeschlagen: " + e.message); } }}><AI.send /> Senden</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Templates (echte ops-Vorlagen + Vorschau) ---------- */
function Templates() {
  const [tpls, setTpls] = React.useState(null);
  const [err, setErr] = React.useState("");
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try { const list = await fetchTemplates(); if (alive) setTpls(list || []); }
      catch (e) { if (alive) setErr(e.message || "Fehler"); }
    })();
    return () => { alive = false; };
  }, []);
  const opsBase = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
  return (
    <div className="content">
      <div className="panel" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
        <div className="panel-head" style={{ padding: "0 2px 18px", borderBottom: "none" }}>
          <h2>E-Mail-Vorlagen</h2>
          <div className="ph-right muted" style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 700 }}>{tpls ? tpls.length + " echte Vorlagen" : "lädt…"}</div>
        </div>
        {err ? <div className="empty"><Icon.mail /><p>Vorlagen nicht ladbar: {err}</p></div> : null}
        {tpls && !tpls.length && !err ? <div className="empty"><Icon.mail /><p>Keine Vorlagen gefunden.</p></div> : null}
        <div className="tpl-grid">
          {(tpls || []).map((t) => (
            <div className="tpl-card" key={t.key}>
              <div className="tc-top">
                <span className="tc-ic"><Icon.mail size={19} /></span>
                <div><div className="tc-name">{t.label}</div><div className="tc-tag">{t.group}</div></div>
              </div>
              <div className="tc-subj">{t.subject}</div>
              <div className="tc-foot">
                {opsBase
                  ? <React.Fragment><a href={opsBase + "/preview/" + t.key} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}><Icon.eye /> Vorschau DE</a> · <a href={opsBase + "/preview/" + t.key + "?lang=en"} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>EN</a></React.Fragment>
                  : <span>Vorschau (ops-URL fehlt)</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Invoice view ---------- */
function InvoiceView({ order, toast }) {
  const o = order || ORDERS.find((x) => x.pay === "paid");
  const inv = "RE-" + o.id.replace("RR-", "");
  const items = [{ name: SERVICES[o.service].name, desc: o.profile, amount: o.amount }];
  if (o.protection && o.protAmount) items.push({ name: "Reputations-Schutz", desc: o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Monitoring (mtl.)" : "Monatlich", amount: o.protAmount });
  const net = items.reduce((s, i) => s + i.amount, 0);
  const vat = Math.round(net * 0.2 * 100) / 100;
  return (
    <div className="content">
      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, margin: 0 }}>Rechnung {inv}</h2>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-sec btn-sm" onClick={() => toast("PDF wird erstellt…")}><AI.download /> PDF</button>
          <button className="btn btn-pri btn-sm" onClick={() => toast("Rechnung an " + o.name + " gesendet ✓")}><AI.send /> An Kunde senden</button>
        </div>
      </div>
      <div className="inv-paper">
        <div className="inv-top">
          <img src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" />
          <div className="inv-meta"><b>Rechnung {inv}</b>Datum: {o.created.split("·")[0]}<br />Fällig: nach Erfolg</div>
        </div>
        <div className="inv-parties">
          <div><div className="lbl">Von</div>{COMPANY.name}<br />{COMPANY.street}<br />{COMPANY.city}<br />UID: {COMPANY.vat}</div>
          <div><div className="lbl">An</div>{o.name}<br />{o.company}<br />{o.email}</div>
        </div>
        <table className="inv-table">
          <thead><tr><th>Position</th><th>Betrag</th></tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}><td><div className="it-name">{it.name}</div><div className="it-desc">{it.desc}</div></td><td>{money(it.amount, o.country)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="inv-tot">
          <div className="tr"><span>Netto</span><span>{money(net, o.country)}</span></div>
          <div className="tr"><span>USt. 20 %</span><span>{money(vat, o.country)}</span></div>
          <div className="tr grand"><span>Gesamt</span><span className="amt">{money(net + vat, o.country)}</span></div>
        </div>
        <div className="stripe-box" style={{ marginTop: 24 }}>
          <span className="sb-logo">stripe</span>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg-2)" }}>Zahlung per sicherem Link · {o.pay === "paid" ? "bezahlt" : "ausstehend"}</div>
          <span className="sb-status">{o.pay === "paid" ? <span className="badge-st st-paid"><span className="d" style={{ background: "var(--success)" }}></span>Bezahlt</span> : <span className="badge-st st-pending"><span className="d"></span>Offen</span>}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Customers (echte Stripe-Kunden) ---------- */
function Customers({ customers, query }) {
  let list = customers || [];
  if (query.trim()) { const q = query.toLowerCase(); list = list.filter((c) => ((c.name || "") + (c.email || "")).toLowerCase().includes(q)); }
  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head"><h2>Kunden</h2><div className="ph-right muted" style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 700 }}>{list.length} aus Stripe</div></div>
        {list.length ? (
          <table className="tbl">
            <thead><tr><th>Kunde</th><th>E-Mail</th><th>Kunde seit</th><th>Stripe-ID</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id || c.email}>
                  <td><div className="cust" style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="ca" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--orange-100)", color: "var(--orange-800)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{initials(c.name || c.email || "?")}</span><div>{c.name || "—"}</div></div></td>
                  <td>{c.email || "—"}</td>
                  <td>{c.date || "—"}</td>
                  <td><span className="oid" style={{ fontSize: 12 }}>{c.id}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty"><AI.users /><p>Keine Stripe-Kunden geladen — ist der STRIPE_SECRET_KEY gesetzt?</p></div>
        )}
      </div>
    </div>
  );
}

/* ---------- Settings (light) ---------- */
function Settings() {
  return (
    <div className="content">
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><h2>Integrationen</h2></div>
          <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            {[["stripe", "Stripe", "Zahlungen & Auszahlungen", true], ["mail", "Mailserver", "Transaktions-E-Mails", true], ["trustpilot", "Trustpilot", "Bewertungs-Einladungen", true], ["whatsapp", "WhatsApp Business", "Direkter Kundenkontakt", false]].map(([id, name, desc, on]) => (
              <div key={id} className="stripe-box">
                <div><div style={{ fontWeight: 800, fontSize: 14 }}>{name}</div><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{desc}</div></div>
                <span className="sb-status">{on ? <span className="badge-st st-done"><span className="d"></span>Verbunden</span> : <button className="btn btn-sec btn-sm">Verbinden</button>}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Firmendaten</h2></div>
          <div style={{ padding: 22 }}>
            <div className="drow"><span className="dl">Firma</span><span className="dv">{COMPANY.name}</span></div>
            <div className="drow"><span className="dl">Adresse</span><span className="dv">{COMPANY.street}, {COMPANY.city}</span></div>
            <div className="drow"><span className="dl">UID</span><span className="dv">{COMPANY.vat}</span></div>
            <div className="drow"><span className="dl">E-Mail</span><span className="dv">{COMPANY.email}</span></div>
            <div className="drow"><span className="dl">IBAN</span><span className="dv">{COMPANY.iban}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Invoice modal (opened from an order) ---------- */
function InvoiceModal({ order, onClose, onCompose, toast }) {
  if (!order) return <div className="modal-scrim"></div>;
  const o = order;
  const inv = "RE-" + o.id.replace("RR-", "");
  const items = [{ name: SERVICES[o.service].name, desc: o.profile, amount: o.amount }];
  if (o.protection && o.protAmount) items.push({ name: "Reputations-Schutz", desc: o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Monitoring (mtl.)" : "Monatlich", amount: o.protAmount });
  const net = items.reduce((s, i) => s + i.amount, 0);
  const vat = Math.round(net * 0.2 * 100) / 100;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.fileText size={19} style={{ color: "var(--primary)" }} /></span>
          <div>
            <h3>Rechnung {inv}</h3>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{o.id} · {o.name}</div>
          </div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div className="inv-paper" style={{ border: "none", padding: 0 }}>
            <div className="inv-top">
              <img src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" />
              <div className="inv-meta"><b>Rechnung {inv}</b>Datum: {o.created.split("·")[0]}<br />Fällig: nach Erfolg</div>
            </div>
            <div className="inv-parties">
              <div><div className="lbl">Von</div>{COMPANY.name}<br />{COMPANY.street}<br />{COMPANY.city}<br />UID: {COMPANY.vat}</div>
              <div><div className="lbl">An</div>{o.name}<br />{o.company}<br />{o.email}</div>
            </div>
            <table className="inv-table">
              <thead><tr><th>Position</th><th>Betrag</th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}><td><div className="it-name">{it.name}</div><div className="it-desc">{it.desc}</div></td><td>{money(it.amount, o.country)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="inv-tot">
              <div className="tr"><span>Netto</span><span>{money(net, o.country)}</span></div>
              <div className="tr"><span>USt. 20 %</span><span>{money(vat, o.country)}</span></div>
              <div className="tr grand"><span>Gesamt</span><span className="amt">{money(net + vat, o.country)}</span></div>
            </div>
            <div className="stripe-box" style={{ marginTop: 22 }}>
              <span className="sb-logo">stripe</span>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg-2)" }}>Zahlung per sicherem Link · {o.pay === "paid" ? "bezahlt" : "ausstehend"}</div>
              <span className="sb-status">{o.pay === "paid" ? <span className="badge-st st-paid"><span className="d" style={{ background: "var(--success)" }}></span>Bezahlt</span> : <span className="badge-st st-pending"><span className="d"></span>Offen</span>}</span>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 700, marginRight: "auto", display: "flex", alignItems: "center", gap: 6 }}><Icon.lock size={14} /> Stripe-Zahllink inklusive</span>
          <button className="btn btn-sec" onClick={() => toast("PDF wird erstellt…")}><AI.download /> PDF</button>
          <button className="btn btn-pri" onClick={() => { onClose(); onCompose(o, TEMPLATES.find((t) => t.id === "invoice")); }}><AI.send /> Rechnung + Stripe-Link senden</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Customer detail (full CRM record) ---------- */
function CustomerDetail({ order, onBack, onStatus, onCompose, onInvoice, onSms, onPayLink, onStorno, toast }) {
  const o = order;
  const ex = crmExtras(o);
  const [notes, setNotes] = React.useState(o.note || "");
  const [tab, setTab] = React.useState("activity");
  const [events, setEvents] = React.useState(null);
  React.useEffect(() => {
    let alive = true;
    fetchEvents(o.id).then((ev) => { if (alive) setEvents(ev); }).catch(() => {});
    return () => { alive = false; };
  }, [o.id]);
  const curIdx = STATUS_FLOW.findIndex((s) => s.id === o.status);
  const total = o.amount + (o.protection && o.protAmount ? o.protAmount : 0);
  return (
    <div className="content">
      <button className="cd-back" onClick={onBack}><Icon.arrowLeft /> Zurück zu Bestellungen</button>
      <div className="cd-hero">
        <div className="cd-ava">{initials(o.name)}</div>
        <div>
          <div className="cd-id">{o.name} <StatusBadge status={o.status} /> <PayBadge pay={o.pay} /></div>
          <div className="cd-sub">{o.company} · {o.id}</div>
          <div className="cd-meta-row">
            <span className="m"><Icon.mail /> {o.email}</span>
            <span className="m"><Icon.phone /> {o.phone}</span>
            <span className="m"><Icon.globe /> {o.country}</span>
          </div>
        </div>
        <div className="cd-acts">
          <button className="btn btn-sec btn-sm" onClick={() => onCompose(o, TEMPLATES[0])}><Icon.mail /> E-Mail</button>
          <a className="btn btn-sec btn-sm" href={"tel:" + o.phone.replace(/\s/g, "")}><Icon.phone /> Anrufen</a>
          <a className="btn btn-sec btn-sm" href="#"><Icon.whatsapp /> WhatsApp</a>
          <button className="btn btn-pri btn-sm" onClick={() => onPayLink(o)}><AI.creditCard /> Zahlungslink senden</button>
        </div>
      </div>

      <div className="cd-grid">
        {/* MAIN COLUMN */}
        <div className="cd-col">
          {/* actions */}
          <div className="panel">
            <div className="panel-head"><h2>Aktionen</h2></div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div className="act-grp-l">Zahlung</div>
                <div className="act-btns">
                  <button className="btn btn-pri btn-sm" onClick={() => onPayLink(o)}><AI.send /> Zahlungslink senden</button>
                  <button className="btn btn-sec btn-sm" onClick={async () => { try { const tot = o.amount + (o.protection && o.protAmount ? o.protAmount : 0); await sendPayLink({ to: o.email, name: o.name, orderId: o.id, currency: o.country === "US" ? "usd" : "eur", service: o.service, protection: o.protection || "none", serviceAmount: o.amount || 0, protAmount: (o.protection && o.protAmount) ? o.protAmount : 0, protType: o.protection || "", total: tot, protectionLabel: o.protection ? ((o.protection === "lifetime" ? "Lebenslanger Schutz" : o.protection === "monitor" ? "Schutz + Monitoring" : "Monatlicher Schutz") + (o.protAmount ? " – " + money(o.protAmount, o.country) + (o.protection !== "lifetime" ? "/Mon." : "") : "")) : "", template: "mahnung" }); toast("Mahnung an " + o.name + " gesendet \u2713"); } catch (e) { toast("Mahnung fehlgeschlagen: " + e.message); } }}><Icon.mail /> Mahnung senden</button>
                  {o.pay !== "paid" && o.amount ? <button className="btn btn-sec btn-sm" onClick={() => toast("Stripe-Zahlung erfasst ✓")}><Icon.lock /> Zahlung erfassen</button> : null}
                  {o.pay === "paid" ? <button className="btn btn-sec btn-sm" onClick={() => toast("Rückerstattung eingeleitet")}><AI.refund /> Erstatten</button> : null}
                </div>
              </div>
              <div>
                <div className="act-grp-l">Kommunikation</div>
                <div className="act-btns">
                  <button className="btn btn-sec btn-sm" onClick={() => onSms(o)}><Icon.message /> SMS senden</button>
                  <button className="btn btn-sec btn-sm" onClick={() => onCompose(o, TEMPLATES[0])}><Icon.mail /> E-Mail (frei)</button>
                  <a className="btn btn-sec btn-sm" href="#"><Icon.whatsapp /> WhatsApp</a>
                </div>
              </div>
              <div>
                <div className="act-grp-l">Vorgangs-Mails (echte Vorlagen)</div>
                <div className="act-btns">
                  {[["rechte-benoetigt", "Zugriffsrechte", Icon.lock], ["adresse", "Adresse", Icon.mapPin], ["verifizieren", "Verifizieren", Icon.shieldCheck], ["nachweise-benoetigt", "Nachweise", Icon.fileText], ["nicht-gefunden", "Nicht gefunden", Icon.search], ["garantiefall", "Garantiefall", Icon.refresh]].map(([key, label, Ic]) => (
                    <button key={key} className="btn btn-sec btn-sm" onClick={async () => { if (typeof window !== "undefined" && !window.confirm(label + "-Mail an " + o.name + " senden?")) return; try { await sendTemplate({ key, to: o.email, orderId: o.id }); toast(label + " an " + o.name + " gesendet \u2713"); } catch (e) { toast("Senden fehlgeschlagen: " + e.message); } }}><Ic size={15} /> {label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="act-grp-l">Verwaltung</div>
                <div className="act-btns">
                  {o.status !== "storniert" ? <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm("Bestellung " + o.id + " wirklich stornieren?")) onStorno(o); }}><Icon.ban /> Bestellung stornieren</button> : <span className="badge-st st-refunded"><span className="d"></span>Storniert</span>}
                </div>
              </div>
            </div>
          </div>

          {/* status pipeline */}
          <div className="panel">
            <div className="panel-head"><h2>Status</h2><div className="ph-right">
              {curIdx < STATUS_FLOW.length - 1 && <button className="btn btn-pri btn-sm" onClick={() => onStatus(o, STATUS_FLOW[curIdx + 1].id)}><Icon.arrowRight /> {STATUS_FLOW[curIdx + 1].label}</button>}
            </div></div>
            <div style={{ padding: "18px 22px" }}>
              <div className="dpipe">
                {STATUS_FLOW.map((s, i) => {
                  const cls = i < curIdx ? "done" : i === curIdx ? "active" : "";
                  return (
                    <div className={"dpipe-step " + cls} key={s.id} onClick={() => onStatus(o, s.id)}>
                      {i < STATUS_FLOW.length - 1 && <div className="dpipe-rail"></div>}
                      <div className="dpipe-dot">{i < curIdx ? <Icon.check /> : i === curIdx ? <Icon.clock /> : i + 1}</div>
                      <div className="dpipe-body"><div className="pt">{s.label}{i === curIdx && <span className="now">JETZT</span>}</div><div className="pd">{s.desc}</div></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* tabs: activity / order / notes */}
          <div className="panel">
            <div className="panel-head" style={{ paddingBottom: 0, borderBottom: "none" }}>
              <div className="cd-tabs">
                {[["activity", "Verlauf"], ["order", "Bestelldetails"], ["notes", "Notizen"]].map(([id, label]) => (
                  <button key={id} className={"cd-tab" + (tab === id ? " on" : "")} onClick={() => setTab(id)}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: "20px 22px" }}>
              {tab === "activity" && (
                <div className="act">
                  {(events || []).length ? (events || []).map((a, i) => (
                    <div className="act-item" key={i}>
                      <div className="act-rail"></div>
                      <div className={"act-ic " + a.ic}>{a.ic === "mail" ? <Icon.mail /> : a.ic === "pay" ? <Icon.card /> : a.ic === "status" ? <Icon.zap /> : <Icon.fileText />}</div>
                      <div className="act-body"><div className="at">{a.t}</div><div className="ad">{a.d}</div><div className="atime">{a.time}</div></div>
                    </div>
                  )) : <div style={{ color: "var(--fg-muted)", fontWeight: 600, fontSize: 13.5, padding: 8 }}>{events === null ? "Lädt…" : "Noch keine Aktivität erfasst."}</div>}
                </div>
              )}
              {tab === "order" && (
                <div>
                  <div className="drow"><span className="dl">Google-Profil</span><span className="dv">{o.profile}</span></div>
                  <div className="drow"><span className="dl">Bewertungen</span><span className="dv">{o.rating}★ · {o.reviews} Stück</span></div>
                  <div className="drow"><span className="dl">Leistung</span><span className="dv">{SERVICES[o.service].name}</span></div>
                  {o.protection && <div className="drow"><span className="dl">Schutz</span><span className="dv">{o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Monitoring" : "Monatlich"}</span></div>}
                  <div className="drow"><span className="dl">Bestelldatum</span><span className="dv">{o.created}</span></div>
                  <div className="drow"><span className="dl" style={{ fontWeight: 800, color: "var(--fg)" }}>Auftragswert</span><span className="dv" style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--primary)" }}>{o.amount ? money(total, o.country) : "kostenlose Prüfung"}</span></div>
                </div>
              )}
              {tab === "notes" && (
                <div>
                  <textarea className="notes-area" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interne Notiz zum Kunden…"></textarea>
                  <button className="btn btn-sec btn-sm" style={{ marginTop: 10 }} onClick={() => toast("Notiz gespeichert")}><Icon.check /> Notiz speichern</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="cd-col">
          {/* billing / stripe */}
          <div className="dsec">
            <h3><Icon.lock /> Abrechnung <span className="right"><PayBadge pay={o.pay} /></span></h3>
            <div className="stripe-box" style={{ marginBottom: 12 }}>
              <span className="sb-logo">stripe</span>
              <span className="sb-card"><AI.creditCard /> <span className="dots">•••• 4242</span></span>
              <span className="sb-status">{o.pay === "paid" ? <span className="badge-st st-paid"><span className="d" style={{ background: "var(--success)" }}></span>Erfasst</span> : o.pay === "failed" ? <span className="badge-st st-refunded"><span className="d"></span>Abgelehnt</span> : <span className="badge-st st-pending"><span className="d"></span>Reserviert</span>}</span>
            </div>
            <div className="drow"><span className="dl">Rechnungsbetrag</span><span className="dv">{o.amount ? money(o.amount, o.country) : "—"}</span></div>
            {o.protection && o.protAmount ? <div className="drow"><span className="dl">Schutz</span><span className="dv">{money(o.protAmount, o.country)}{o.protection !== "lifetime" ? " /Mon." : ""}</span></div> : null}
            <div style={{ display: "flex", gap: 8, marginTop: 13, flexWrap: "wrap" }}>
              {o.pay !== "paid" && o.amount ? <button className="btn btn-pri btn-sm" onClick={() => onPayLink(o)}><AI.send /> Stripe-Link senden</button> : null}
              {o.pay === "pending" && o.amount ? <button className="btn btn-sec btn-sm" onClick={() => toast("Stripe-Zahlung erfasst ✓")}><Icon.lock /> Erfassen</button> : null}
              {o.pay === "paid" ? <button className="btn btn-ghost btn-sm" onClick={() => toast("Rückerstattung eingeleitet")}><AI.refund /> Erstatten</button> : null}
            </div>
            <div style={{ marginTop: 14, borderTop: "1px solid var(--hairline)", paddingTop: 6 }}>
              {ex.payHist.map((p, i) => (
                <div className="payh" key={i}>
                  <span className={"ph-ic " + p.s}>{p.s === "ok" ? <Icon.check /> : p.s === "fail" ? <Icon.x /> : <Icon.clock />}</span>
                  <div><div style={{ fontWeight: 700 }}>{p.t}</div><div className="ph-meta">{p.meta}</div></div>
                  <span className="ph-amt">{p.amt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* files */}
          <div className="dsec">
            <h3><Icon.fileText /> Dateien <span className="right"><button className="btn btn-ghost btn-sm" onClick={() => toast("Datei-Upload…")}><AI.plus /> Hinzufügen</button></span></h3>
            {ex.files.map((f, i) => (
              <div className="file-row" key={i}>
                <span className="fic"><Icon.fileText /></span>{f.n}
                <span className="fsz">{f.sz}</span>
                <span className="fdl" onClick={() => toast("Download…")}><AI.download /></span>
              </div>
            ))}
          </div>

          {/* quick email templates */}
          <div className="dsec">
            <h3><Icon.mail /> Schnell-Mail</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TEMPLATES.slice(0, 4).map((t) => (
                <button key={t.id} className="btn btn-sec btn-sm" style={{ justifyContent: "flex-start" }} onClick={() => onCompose(o, t)}>
                  {(Icon[t.icon] || AI[t.icon] || Icon.mail)({ size: 15 })} {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- SMS modal ---------- */
function SmsModal({ order, onClose, toast }) {
  const [text, setText] = React.useState("");
  React.useEffect(() => { if (order) setText("Hallo " + order.name.split(" ")[0] + ", kurze Info zu Ihrer Bestellung " + order.id + ": "); }, [order]);
  if (!order) return <div className="modal-scrim"></div>;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.message size={19} style={{ color: "var(--primary)" }} /></span>
          <div><h3>SMS an {order.name}</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{order.phone}</div></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div className="fld"><label>Nachricht ({text.length}/160)</label><textarea maxLength={160} style={{ minHeight: 100 }} value={text} onChange={(e) => setText(e.target.value)}></textarea></div>
        </div>
        <div className="modal-foot">
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 700, marginRight: "auto" }}>Versand per SMS-Gateway</span>
          <button className="btn btn-sec" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-pri" onClick={() => { onClose(); toast("SMS an " + order.name + " gesendet ✓"); }}><AI.send /> Senden</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Payment-link modal (Stripe — Betrag automatisch erkannt) ---------- */
function PayLinkModal({ order, onClose, toast }) {
  const [prot, setProt] = React.useState("none");
  React.useEffect(() => { if (order) setProt(order.protection || "none"); }, [order]);
  if (!order) return <div className="modal-scrim"></div>;
  const PROT_PRICE = { none: 0, monthly: 24.9, monitor: 69.9, lifetime: 990 };
  const PROT_LABEL = { none: "Kein Schutz", monthly: "Monatlich", monitor: "Monitoring", lifetime: "Lebenslang" };
  const svc = SERVICES[order.service];
  const protAmount = PROT_PRICE[prot] || 0;
  const recurring = prot === "monthly" || prot === "monitor";
  const total = (order.amount || 0) + protAmount;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><AI.creditCard size={19} style={{ color: "var(--primary)" }} /></span>
          <div><h3>Zahlungslink senden</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{order.id} · bestehender Stripe-Link</div></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div style={{ background: "var(--neutral-50)", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
              <span style={{ fontSize: 13, color: "var(--fg-2)", fontWeight: 700 }}>{svc ? svc.name : order.service}</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{order.amount ? money(order.amount, order.country) : "—"}</span>
            </div>
            {prot !== "none" ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderTop: "1px solid var(--hairline)" }}>
                <span style={{ fontSize: 13, color: "var(--fg-2)", fontWeight: 700 }}>Schutz ({PROT_LABEL[prot]})</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{money(protAmount, order.country)}{recurring ? " /Mon." : ""}</span>
              </div>
            ) : null}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 2px", borderTop: "1px solid var(--hairline)", marginTop: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>Gesamt</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--primary)" }}>{order.amount ? money(total, order.country) : "kostenlose Prüfung"}</span>
            </div>
          </div>
          {/* Zahlungslink ändern: Schutz / Abo wählen */}
          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--fg-2)", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Zahlungslink anpassen — Schutz / Abo</label>
            <div className="chips" style={{ flexWrap: "wrap" }}>
              {["none", "monthly", "monitor", "lifetime"].map((k) => (
                <button key={k} className={"chipf" + (prot === k ? " on" : "")} onClick={() => setProt(k)}>
                  {PROT_LABEL[k]}{k !== "none" ? " · " + money(PROT_PRICE[k], order.country) + (k === "lifetime" ? "" : "/Mon.") : ""}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-muted)", fontWeight: 600, marginTop: 9, lineHeight: 1.5 }}>
              {recurring ? "Monatliches Abo — es wird der bestehende Stripe-Abo-Link verschickt." : prot === "lifetime" ? "Einmalig lebenslang — bestehender Einmal-Link." : "Nur Löschung, kein Schutz — bestehender Einmal-Link."}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 700, marginRight: "auto", display: "flex", alignItems: "center", gap: 6 }}><Icon.lock size={14} /> Bestehender Link aus Stripe</span>
          <button className="btn btn-sec" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-pri" onClick={async () => { try { await sendPayLink({ to: order.email, name: order.name, orderId: order.id, currency: order.country === "US" ? "usd" : "eur", service: order.service, protection: prot, serviceAmount: order.amount || 0, protAmount: protAmount, protType: prot === "none" ? "" : prot, total: total, protectionLabel: prot !== "none" ? (PROT_LABEL[prot] + " – " + money(protAmount, order.country) + (recurring ? "/Mon." : "")) : "" }); onClose(); toast("Zahlungslink (" + PROT_LABEL[prot] + ") an " + order.name + " gesendet ✓"); } catch (e) { toast("Zahlungslink fehlgeschlagen: " + e.message); } }}><AI.send /> Zahlungslink senden</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Root ---------- */
const TITLES = { dashboard: "Übersicht", orders: "Bestellungen", subs: "Abos & Umsatz", templates: "E-Mail-Vorlagen", customers: "Kunden", settings: "Einstellungen" };

function AdminApp() {
  const [orders, setOrders] = React.useState([]);
  const [checks, setChecks] = React.useState([]);
  const [live, setLive] = React.useState(false);
  const [stripeCustomers, setStripeCustomers] = React.useState([]);
  const [view, setView] = React.useState("dashboard");
  const [active, setActive] = React.useState(null); // order in drawer
  const [compose, setCompose] = React.useState(null); // {order, template}
  const [invoiceModal, setInvoiceModal] = React.useState(null);
  const [detail, setDetail] = React.useState(null); // full customer record
  const [smsOrder, setSmsOrder] = React.useState(null);
  const [payLinkOrder, setPayLinkOrder] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [sideOpen, setSideOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState(null);
  const toast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2600); };

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchAdminData();
        if (alive && data) { setOrders(data.orders || []); setChecks(data.checks || []); setLive(!!data.db); }
      } catch (e) { /* ohne Backend bleibt es leer — keine Demo-Daten */ }
      try {
        const s = await fetchStripe();
        if (alive && s && s.connected) setStripeCustomers(s.customersList || []);
      } catch (e) { /* Stripe optional */ }
    })();
    return () => { alive = false; };
  }, []);

  const counts = { new: orders.filter((o) => o.status === "new").length };
  const openOrder = (o) => setActive(o);
  const openDetail = (o) => { setDetail(o); setActive(null); window.scrollTo({ top: 0 }); };
  const setStatus = (o, id) => {
    const upd = (x) => x && x.id === o.id ? { ...x, status: id, pay: id === "done" && x.pay === "pending" ? "paid" : x.pay } : x;
    setOrders((list) => list.map(upd));
    setActive(upd);
    setDetail(upd);
    toast("Status „" + STATUS_FLOW.find((s) => s.id === id).label + "“ gesetzt");
  };
  const goInvoice = (o) => { setInvoiceModal(o); };
  const doStorno = (o) => {
    setOrders((list) => list.map((x) => x.id === o.id ? { ...x, status: "storniert", pay: "refunded" } : x));
    setDetail((d) => d && d.id === o.id ? { ...d, status: "storniert", pay: "refunded" } : d);
    toast("Bestellung " + o.id + " storniert");
  };

  let body;
  if (detail) body = <CustomerDetail order={detail} onBack={() => setDetail(null)} onStatus={setStatus} onCompose={(o, t) => setCompose({ order: o, template: t })} onInvoice={(o) => setInvoiceModal(o)} onSms={(o) => setSmsOrder(o)} onPayLink={(o) => setPayLinkOrder(o)} onStorno={doStorno} toast={toast} />;
  else if (view === "dashboard") body = <Dashboard orders={orders} checks={checks} openOrder={openDetail} openCheck={openDetail} />;
  else if (view === "orders") body = <Orders orders={orders} openOrder={openDetail} query={query} />;
  else if (view === "subs") body = <SubsDashboard toast={toast} />;
  else if (view === "templates") body = <Templates />;
  else if (view === "customers") body = <Customers customers={stripeCustomers} query={query} />;
  else body = <Settings />;

  return (
    <div className="adm">
      <Sidebar view={view} setView={(v) => { setView(v); setDetail(null); setSideOpen(false); }} counts={counts} open={sideOpen} live={live} />
      <div className="main">
        <Topbar title={TITLES[view]} onBurger={() => setSideOpen((o) => !o)} query={query} setQuery={setQuery} />
        {body}
      </div>
      <OrderDrawer order={active} onClose={() => setActive(null)} onStatus={setStatus} onOpenFull={openDetail}
        onCompose={(o, t) => setCompose({ order: o, template: t })} onPayLink={(o) => setPayLinkOrder(o)} toast={toast} />
      <EmailComposer data={compose} onClose={() => setCompose(null)} toast={toast} />
      <InvoiceModal order={invoiceModal} onClose={() => setInvoiceModal(null)} onCompose={(o, t) => setCompose({ order: o, template: t })} toast={toast} />
      <SmsModal order={smsOrder} onClose={() => setSmsOrder(null)} toast={toast} />
      <PayLinkModal order={payLinkOrder} onClose={() => setPayLinkOrder(null)} toast={toast} />
      <div className={"toast" + (toastMsg ? " show" : "")}><Icon.checkCircle />{toastMsg}</div>
    </div>
  );
}

export { AdminApp };
