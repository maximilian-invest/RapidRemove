/* Zentrale Template-Registry — neue Vorlagen hier eintragen.
   Wird von Vorschau-Server, Render- und Test-Skript genutzt. */
import * as React from "react";
import Auftragsbestaetigung, { subject as auftragSubject } from "./Auftragsbestaetigung";
import PaymentLink, { subject as paymentSubject } from "./PaymentLink";

export interface TemplateEntry {
  label: string;
  component: React.ComponentType<any>;
  subject: (props: any) => string;
  sample: Record<string, unknown>;
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  auftragsbestaetigung: {
    label: "Auftragsbestätigung",
    component: Auftragsbestaetigung,
    subject: auftragSubject,
    sample: {},
  },
  zahlungslink: {
    label: "Zahlungslink",
    component: PaymentLink,
    subject: paymentSubject,
    sample: {
      lang: "de",
      total: "519,90 € (netto)",
      protectionLabel: "Enthält monatlichen Schutz + Überwachung",
      upgradeUrl: "https://rapid-remove.com/",
      due: "sofort",
      payUrl: "https://buy.stripe.com/test_00000000",
    },
  },
};

export type TemplateKey = string;
