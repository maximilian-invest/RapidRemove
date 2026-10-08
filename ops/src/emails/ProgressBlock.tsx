/* Fortschritts-Block für Bewertungs-Mails: „x von n gelöscht", Balken, offener Betrag + Bezahlen, ggf. Zwischenzahlung. */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { CtaButton, DangerBox, brand } from "./components";
import { fmtReviewMoney } from "../reviewsPricing";
import { progT, fillP, isDone, type Progress } from "./progressText";

export default function ProgressBlock({ p, lang, payUrl, showGood = true }: { p: Progress; lang?: string; payUrl: string; showGood?: boolean }) {
  const t = progT(lang);
  const n = Math.max(1, p.total);
  const seg = (k: number, color: string) => (k > 0 ? <td style={{ width: `${(k / n) * 100}%`, background: color, height: 10 }} /> : null);
  const rest = Math.max(0, n - p.removed - p.inProgress - p.waiting);
  const legend = [p.removed ? `${p.removed} ${t.removed}` : "", p.inProgress ? `${p.inProgress} ${t.inProgress}` : "", p.waiting ? `${p.waiting} ${t.waiting}` : ""].filter(Boolean).join(" · ");
  return (
    <>
      {showGood && p.removed ? <Text style={{ fontSize: 17, fontWeight: 700, color: isDone(p) ? "#15803d" : brand.ink, margin: "6px 0 10px" }}>{isDone(p) ? fillP(p.removed >= p.total ? t.doneAll : t.donePart, { r: p.removed, n: p.total }) : fillP(t.good, { r: p.removed, n: p.total })}</Text> : null}
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: "100%", borderCollapse: "separate", borderRadius: 6, overflow: "hidden", background: "#ececec" }}>
        <tbody><tr>{seg(p.removed, "#16a34a")}{seg(p.inProgress, brand.accent)}{seg(p.waiting, "#3b82f6")}{seg(rest, "#ececec")}</tr></tbody>
      </table>
      {legend ? <Text style={{ fontSize: 13, color: brand.muted, margin: "8px 0 14px" }}>{legend}</Text> : null}
      {p.charged && p.charged.amount > 0 ? (
        <Section style={{ background: "#ecfdf3", border: "1px solid #bbf7d0", borderRadius: 14, padding: "14px 18px", margin: "4px 0 14px" }}>
          <Text style={{ margin: 0, fontSize: 14, color: "#166534", lineHeight: "21px" }}>{fillP(t.autoPaid, { a: fmtReviewMoney(p.charged.amount, p.charged.cur) }).replace("{pm}", p.charged.label || "")}</Text>
          {p.charged.invoiceUrl ? <Text style={{ margin: "8px 0 0", fontSize: 13 }}><a href={p.charged.invoiceUrl} style={{ color: "#166534", fontWeight: 700 }}>{t.autoInv} →</a></Text> : null}
        </Section>
      ) : null}
      {p.due > 0 ? (
        <Section style={{ background: brand.tint, borderRadius: 14, padding: "16px 18px", margin: "4px 0 14px" }}>
          <Text style={{ margin: 0, fontSize: 14, color: brand.muted }}>{t.due}</Text>
          <Text style={{ margin: "2px 0 12px", fontSize: 26, fontWeight: 800, color: brand.ink }}>{fmtReviewMoney(p.due, p.cur)}</Text>
          <CtaButton href={payUrl} variant="pay">{t.pay}</CtaButton>
          <Text style={{ margin: "12px 0 0", fontSize: 13, color: brand.muted }}>{t.hint}</Text>
        </Section>
      ) : null}
      {p.hold && p.inProgress ? <DangerBox>{p.cardFail ? fillP(t.failHold, { k: p.inProgress }).replace("{pm}", p.cardFail) : fillP(t.hold, { k: p.inProgress })}</DangerBox> : null}
    </>
  );
}
