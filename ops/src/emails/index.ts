/* Zentrale Template-Registry — neue Vorlagen hier eintragen.
   Wird von Vorschau-Server, Render- und Test-Skript genutzt.
   Alle Templates sind zweisprachig (sample.lang = "de" | "en"). */
import * as React from "react";
import Auftragsbestaetigung, { subject as auftragSubject } from "./Auftragsbestaetigung";
import PaymentLink, { subject as paymentSubject } from "./PaymentLink";
import ZahlungsbestaetigungGutschein, { subject as zahlungSubject } from "./ZahlungsbestaetigungGutschein";
import Verifizieren, { subject as verifizierenSubject } from "./Verifizieren";
import RechteBenoetigt, { subject as rechteSubject } from "./RechteBenoetigt";
import Adresse, { subject as adresseSubject } from "./Adresse";
import NachweiseBenoetigt, { subject as nachweiseSubject } from "./NachweiseBenoetigt";
import Storno, { subject as stornoSubject } from "./Storno";
import Kundenstorno, { subject as kundenstornoSubject } from "./Kundenstorno";
import Rechtestorno, { subject as rechtestornoSubject } from "./Rechtestorno";
import Scamstorno, { subject as scamstornoSubject } from "./Scamstorno";
import Reset, { subject as resetSubject } from "./Reset";
import NichtGefunden, { subject as nichtGefundenSubject } from "./NichtGefunden";
import NeuesAbo, { subject as neuesAboSubject } from "./NeuesAbo";
import Schutzhinweis, { subject as schutzhinweisSubject } from "./Schutzhinweis";
import AboDeaktiviert, { subject as aboDeaktiviertSubject } from "./AboDeaktiviert";
import Garantiefall, { subject as garantiefallSubject } from "./Garantiefall";
import Mahnung, { subject as mahnungSubject } from "./Mahnung";
import Reaktivierung, { subject as reaktivierungSubject } from "./Reaktivierung";
import Fragebogen, { subject as fragebogenSubject } from "./Fragebogen";

export interface TemplateEntry {
  label: string;
  /** Gruppierung im Admin-Panel/Vorschau */
  group: "Bestellung" | "Mitwirkung" | "Storno" | "Schutz";
  component: React.ComponentType<any>;
  subject: (props: any) => string;
  sample: Record<string, unknown>;
}

const de = { lang: "de" as const };

export const TEMPLATES: Record<string, TemplateEntry> = {
  // ── Bestellung / Zahlung ─────────────────────────────────────────
  auftragsbestaetigung: {
    label: "Auftragsbestätigung",
    group: "Bestellung",
    component: Auftragsbestaetigung,
    subject: auftragSubject,
    sample: de,
  },
  zahlungslink: {
    label: "Zahlungslink",
    group: "Bestellung",
    component: PaymentLink,
    subject: paymentSubject,
    sample: {
      lang: "de",
      total: "668,90 € (netto)",
      expressLabel: "Beschleunigt (≤6 h) · +149 €",
      protectionLabel: "Enthält monatlichen Schutz + Überwachung",
      upgradeUrl: "https://rapid-remove.com/",
      due: "sofort",
      payUrl: "https://buy.stripe.com/test_00000000",
    },
  },
  zahlungsbestaetigung: {
    label: "Zahlung erfolgreich + Gutschein",
    group: "Bestellung",
    component: ZahlungsbestaetigungGutschein,
    subject: zahlungSubject,
    sample: de,
  },
  mahnung: {
    label: "Mahnung / Zahlungserinnerung",
    group: "Bestellung",
    component: Mahnung,
    subject: mahnungSubject,
    sample: { lang: "de", total: "519,90 €", due: "innerhalb 7 Tagen", payUrl: "https://buy.stripe.com/test_00000000" },
  },

  // ── Mitwirkung des Kunden nötig ──────────────────────────────────
  verifizieren: {
    label: "Profil verifizieren",
    group: "Mitwirkung",
    component: Verifizieren,
    subject: verifizierenSubject,
    sample: de,
  },
  "rechte-benoetigt": {
    label: "Zugriffsrechte erteilen",
    group: "Mitwirkung",
    component: RechteBenoetigt,
    subject: rechteSubject,
    sample: de,
  },
  adresse: {
    label: "Adresse hinterlegen",
    group: "Mitwirkung",
    component: Adresse,
    subject: adresseSubject,
    sample: de,
  },
  "nachweise-benoetigt": {
    label: "Nachweise benötigt",
    group: "Mitwirkung",
    component: NachweiseBenoetigt,
    subject: nachweiseSubject,
    sample: de,
  },
  "nicht-gefunden": {
    label: "Profil nicht gefunden",
    group: "Mitwirkung",
    component: NichtGefunden,
    subject: nichtGefundenSubject,
    sample: de,
  },

  // ── Storno / Änderung ────────────────────────────────────────────
  storno: {
    label: "Storno (Löschung nicht möglich)",
    group: "Storno",
    component: Storno,
    subject: stornoSubject,
    sample: de,
  },
  kundenstorno: {
    label: "Kundenstorno (auf Wunsch)",
    group: "Storno",
    component: Kundenstorno,
    subject: kundenstornoSubject,
    sample: de,
  },
  rechtestorno: {
    label: "Rechtestorno (keine Rechte)",
    group: "Storno",
    component: Rechtestorno,
    subject: rechtestornoSubject,
    sample: de,
  },
  scamstorno: {
    label: "Scamstorno (unlautere Praktiken)",
    group: "Storno",
    component: Scamstorno,
    subject: scamstornoSubject,
    sample: de,
  },
  reaktivierung: {
    label: "Auftrag wieder aktiviert",
    group: "Storno",
    component: Reaktivierung,
    subject: reaktivierungSubject,
    sample: de,
  },
  reset: {
    label: "Zurücksetzen statt Löschen",
    group: "Storno",
    component: Reset,
    subject: resetSubject,
    sample: de,
  },

  // ── Schutz / Abo ─────────────────────────────────────────────────
  "neues-abo": {
    label: "Schutz aktiviert (neues Abo)",
    group: "Schutz",
    component: NeuesAbo,
    subject: neuesAboSubject,
    sample: de,
  },
  schutzhinweis: {
    label: "Hinweis zum Schutzmodell (Upsell)",
    group: "Schutz",
    component: Schutzhinweis,
    subject: schutzhinweisSubject,
    sample: de,
  },
  "abo-deaktiviert": {
    label: "Schutz deaktiviert",
    group: "Schutz",
    component: AboDeaktiviert,
    subject: aboDeaktiviertSubject,
    sample: de,
  },
  garantiefall: {
    label: "Garantiefall (kostenfrei entfernt)",
    group: "Schutz",
    component: Garantiefall,
    subject: garantiefallSubject,
    sample: de,
  },
  fragebogen: {
    label: "Fragebogen anfordern",
    group: "Mitwirkung",
    component: Fragebogen,
    subject: fragebogenSubject,
    sample: { lang: "de", formUrl: "https://rapid-remove.com/auftrag/RR-000000" },
  },
};

export type TemplateKey = string;
