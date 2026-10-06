/* Template: Storno „Einzelne Bewertungen löschen" — ganze Bestellung, Löschung nicht möglich.
   Bewusst kurz: Die Bestellung ist storniert, weil die Löschung nicht möglich ist.
   Alles Weitere bekommt der Kunde über den Partner-Workflow.
   Deutsche Fassung enthalten (Sie-Form, für manuell angelegte Aufträge aus DACH);
   übrige Sprachen im „du"-Ton wie StornoReviews. */
import * as React from "react";
import { EmailShell, P, brand, type MailLang } from "./components";

export interface StornoReviewsAllProps {
  lang?: MailLang;
  name?: string;
  orderId?: string;
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: string; signoff: string;
}

export const T: Record<string, Entry> = {
  de: {
    subject: "Ihr Auftrag zur Bewertungslöschung wurde storniert",
    preview: "Die Löschung ist nicht möglich – Ihre Bestellung wurde storniert.",
    title: "Bestellung storniert",
    greeting: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: "leider ist die Löschung nicht möglich, daher haben wir Ihre gesamte Bestellung storniert.",
    signoff: "Freundliche Grüße,",
  },
  en: {
    subject: "Your review removal order has been cancelled",
    preview: "The removal isn't possible — your order has been cancelled.",
    title: "Order cancelled",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: "unfortunately the removal isn't possible, so we have cancelled your entire order.",
    signoff: "Warm regards,",
  },
  es: {
    subject: "Tu pedido de eliminación de reseñas ha sido cancelado",
    preview: "La eliminación no es posible: hemos cancelado tu pedido.",
    title: "Pedido cancelado",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    p1: "lamentablemente la eliminación no es posible, por lo que hemos cancelado tu pedido completo.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: "Ta commande de suppression d'avis a été annulée",
    preview: "La suppression n'est pas possible — ta commande a été annulée.",
    title: "Commande annulée",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    p1: "malheureusement, la suppression n'est pas possible : nous avons donc annulé l'intégralité de ta commande.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: "Il tuo ordine di rimozione recensioni è stato annullato",
    preview: "La rimozione non è possibile: abbiamo annullato il tuo ordine.",
    title: "Ordine annullato",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: "purtroppo la rimozione non è possibile, quindi abbiamo annullato l'intero ordine.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: "Je bestelling voor reviewverwijdering is geannuleerd",
    preview: "Verwijderen is niet mogelijk — je bestelling is geannuleerd.",
    title: "Bestelling geannuleerd",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: "helaas is de verwijdering niet mogelijk, daarom hebben we je volledige bestelling geannuleerd.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: "A tua encomenda de remoção de avaliações foi cancelada",
    preview: "A remoção não é possível — cancelámos a tua encomenda.",
    title: "Encomenda cancelada",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: "infelizmente a remoção não é possível, por isso cancelámos a tua encomenda completa.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: "口コミ削除のご依頼はキャンセルされました",
    preview: "削除ができないため、ご依頼をキャンセルいたしました。",
    title: "ご依頼のキャンセル",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    p1: "誠に恐れ入りますが、削除ができないため、ご依頼全体をキャンセルいたしました。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: "Din beställning av omdömesborttagning har annullerats",
    preview: "Borttagningen är inte möjlig — din beställning har annullerats.",
    title: "Beställning annullerad",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "tyvärr är borttagningen inte möjlig, så vi har annullerat hela din beställning.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Din bestilling på fjernelse af anmeldelser er annulleret",
    preview: "Fjernelsen er ikke mulig — din bestilling er annulleret.",
    title: "Bestilling annulleret",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "desværre er fjernelsen ikke mulig, så vi har annulleret hele din bestilling.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Bestillingen din på fjerning av omtaler er annullert",
    preview: "Fjerningen er ikke mulig — bestillingen din er annullert.",
    title: "Bestilling annullert",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: "dessverre er fjerningen ikke mulig, så vi har annullert hele bestillingen din.",
    signoff: "Vennlig hilsen,",
  },
};

export function subject(p: StornoReviewsAllProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject;
}

export default function StornoReviewsAll({ lang = "en", name = "", orderId = "", _overrides }: StornoReviewsAllProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{t.p1}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
