/* Template: Rückgewinnung / Win-back — für Prüfungs-Leads, die NICHT beauftragt haben.
   Wird manuell aus „Geprüfte Profile" im Admin gesendet.
   BEWUSST OHNE Branding (kein EmailShell, kein Logo, keine Farb-Box): schlichter
   Text-Look wie eine persönlich geschriebene 1:1-Mail — das erhöht die Antwortrate
   deutlich und senkt die Spam-Wahrscheinlichkeit. Neutral formuliert („das Profil
   wurde geprüft"), weil bei früh abgebrochenen Prüfungen nicht sicher ist, dass der
   Empfänger selbst geprüft hat. Fragt nach dem Grund (Preis/Leistung/anderes) und
   bietet ein individuelles Angebot an — OHNE feste Rabatthöhe (wird individuell in
   der Antwort verhandelt, steht nirgends öffentlich). Höfliche Opt-out-Zeile klein
   im Fuß (wichtig bei unaufgeforderter B2B-Kontaktaufnahme). 11 Sprachen, de = Sie.
   {company} wird beim Rendern durch den Profil-/Firmennamen ersetzt. */
import * as React from "react";
import { Body, Container, Head, Html, Text } from "@react-email/components";
import { type MailLang } from "./components";

export interface RueckgewinnungProps {
  lang?: MailLang;
  /** Unternehmens-/Profilname aus der Prüfung — ersetzt {company} in den Texten. */
  company?: string;
  /** Absender-Name in der Signatur (persönliche Note). */
  senderName?: string;
  /** Im Admin bearbeitete Text-Overrides (überschreiben die Default-Texte pro Feld). */
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: string;
  /** Neutrale, landesübliche Anrede — KEINE Namens-Einsetzung (das „Name"-Feld einer
   *  Prüfung ist fast immer der Firmenname, „Guten Tag Candy Shop," wäre peinlich). */
  greeting: string;
  /** Fallback für {company}, wenn kein Firmenname vorliegt. */
  noCompany: string;
  p1: string; p2: string; offer: string; close: string; optOut: string; signoff: string;
}

export const T: Record<string, Entry> = {
  de: {
    subject: "Ihr Google-Unternehmensprofil – dürfen wir nachfragen?",
    greeting: "Sehr geehrte Damen und Herren,",
    noCompany: "Ihr Google-Unternehmensprofil",
    p1: "vor Kurzem wurde auf unserer Plattform geprüft, ob sich {company} dauerhaft von Google entfernen lässt – die Prüfung war positiv, ein Auftrag wurde jedoch nicht erteilt.",
    p2: "Mich interessiert ehrlich: Woran lag es? Am Preis, am Leistungsumfang – oder an etwas anderem?",
    offer: "Wenn Sie grundsätzlich Interesse haben, erstelle ich Ihnen gern ein individuelles Angebot, das zu Ihrer Situation passt.",
    close: "Antworten Sie einfach kurz auf diese E-Mail – ich melde mich umgehend.",
    optOut: "Kein Interesse? Eine kurze Antwort genügt und Sie hören nicht wieder von uns.",
    signoff: "Freundliche Grüße",
  },
  en: {
    subject: "Your Google Business Profile – may I ask a quick question?",
    greeting: "Dear Sir or Madam,",
    noCompany: "your Google Business Profile",
    p1: "a short while ago, {company} was checked on our platform to see whether it can be permanently removed from Google – the check was positive, but no order was placed.",
    p2: "I’m genuinely curious: what was the reason? The price, the scope of the service – or something else?",
    offer: "If you’re still interested in principle, I’d be happy to put together an individual offer that fits your situation.",
    close: "Just reply briefly to this email – I’ll get back to you right away.",
    optOut: "Not interested? A short reply is enough and you won’t hear from us again.",
    signoff: "Best regards",
  },
  es: {
    subject: "Su perfil de empresa de Google: ¿puedo hacerle una pregunta?",
    greeting: "Estimados señores:",
    noCompany: "su perfil de empresa de Google",
    p1: "hace poco se comprobó en nuestra plataforma si {company} puede eliminarse de Google de forma permanente. La comprobación fue positiva, pero no se realizó ningún pedido.",
    p2: "Me interesa saberlo con sinceridad: ¿cuál fue el motivo? ¿El precio, el alcance del servicio… u otra cosa?",
    offer: "Si en principio sigue interesado, con mucho gusto le preparo una oferta individual adaptada a su situación.",
    close: "Responda brevemente a este correo y me pondré en contacto de inmediato.",
    optOut: "¿No le interesa? Basta una breve respuesta y no volverá a saber de nosotros.",
    signoff: "Un cordial saludo",
  },
  fr: {
    subject: "Votre fiche d’établissement Google – puis-je vous poser une question ?",
    greeting: "Madame, Monsieur,",
    noCompany: "votre fiche d’établissement Google",
    p1: "il y a peu, il a été vérifié sur notre plateforme si {company} peut être définitivement supprimée de Google – la vérification était positive, mais aucune commande n’a été passée.",
    p2: "J’aimerais sincèrement comprendre : quelle en était la raison ? Le prix, l’étendue de la prestation – ou autre chose ?",
    offer: "Si vous êtes toujours intéressé sur le principe, je vous prépare volontiers une offre individuelle adaptée à votre situation.",
    close: "Répondez simplement en quelques mots à cet e-mail – je reviens vers vous immédiatement.",
    optOut: "Pas intéressé ? Une courte réponse suffit et vous n’entendrez plus parler de nous.",
    signoff: "Cordialement",
  },
  it: {
    subject: "Il suo profilo aziendale Google – posso farle una domanda?",
    greeting: "Gentili Signore e Signori,",
    noCompany: "il suo profilo aziendale Google",
    p1: "poco tempo fa è stato verificato sulla nostra piattaforma se {company} può essere rimosso definitivamente da Google – la verifica ha avuto esito positivo, ma non è stato effettuato alcun ordine.",
    p2: "Mi interessa sinceramente: qual è stato il motivo? Il prezzo, l’ambito del servizio – o qualcos’altro?",
    offer: "Se in linea di principio è ancora interessato, le preparo volentieri un’offerta individuale adatta alla sua situazione.",
    close: "Risponda semplicemente a questa e-mail – la ricontatterò subito.",
    optOut: "Non è interessato? Basta una breve risposta e non la contatteremo più.",
    signoff: "Cordiali saluti",
  },
  nl: {
    subject: "Uw Google-bedrijfsprofiel – mag ik iets vragen?",
    greeting: "Geachte heer/mevrouw,",
    noCompany: "uw Google-bedrijfsprofiel",
    p1: "onlangs is op ons platform gecontroleerd of {company} permanent van Google verwijderd kan worden – de controle was positief, maar er is geen opdracht geplaatst.",
    p2: "Ik ben oprecht benieuwd: waar lag het aan? De prijs, de omvang van de dienst – of iets anders?",
    offer: "Als u in principe nog interesse heeft, stel ik graag een individueel aanbod samen dat bij uw situatie past.",
    close: "Reageer gewoon kort op deze e-mail – ik neem direct contact met u op.",
    optOut: "Geen interesse? Een kort antwoord volstaat en u hoort niets meer van ons.",
    signoff: "Met vriendelijke groet",
  },
  pt: {
    subject: "O seu perfil de empresa no Google – posso fazer uma pergunta?",
    greeting: "Exmos. Senhores,",
    noCompany: "o seu perfil de empresa no Google",
    p1: "há pouco tempo foi verificado na nossa plataforma se {company} pode ser removido permanentemente do Google – a verificação foi positiva, mas não foi feita nenhuma encomenda.",
    p2: "Interessa-me sinceramente saber: qual foi o motivo? O preço, o âmbito do serviço – ou outra coisa?",
    offer: "Se, em princípio, ainda tiver interesse, terei todo o gosto em preparar uma oferta individual adequada à sua situação.",
    close: "Basta responder brevemente a este e-mail – entrarei em contacto de imediato.",
    optOut: "Sem interesse? Uma breve resposta é suficiente e não voltará a ouvir de nós.",
    signoff: "Com os melhores cumprimentos",
  },
  ja: {
    subject: "貴社のGoogleビジネスプロフィールについて – 一つお伺いしてもよろしいですか?",
    greeting: "ご担当者様",
    noCompany: "貴社のGoogleビジネスプロフィール",
    p1: "先日、当社のプラットフォームで{company}がGoogleから完全に削除できるかどうかの確認が行われました。確認結果は「削除可能」でしたが、ご依頼には至りませんでした。",
    p2: "率直にお伺いしたいのですが、理由は何だったのでしょうか。価格でしょうか、サービス内容でしょうか、それとも別の理由でしょうか。",
    offer: "もしご関心がおありでしたら、御社の状況に合わせた個別のご提案を喜んでご用意いたします。",
    close: "このメールに一言ご返信いただければ、すぐにご連絡いたします。",
    optOut: "ご興味がない場合は、一言ご返信いただければ、以後ご連絡はいたしません。",
    signoff: "どうぞよろしくお願いいたします",
  },
  sv: {
    subject: "Din Google Företagsprofil – får jag ställa en snabb fråga?",
    greeting: "Hej,",
    noCompany: "din Google Företagsprofil",
    p1: "nyligen kontrollerades det på vår plattform om {company} kan tas bort permanent från Google – kontrollen var positiv, men ingen beställning gjordes.",
    p2: "Jag är uppriktigt nyfiken: vad berodde det på? Priset, tjänstens omfattning – eller något annat?",
    offer: "Om du i grunden fortfarande är intresserad tar jag gärna fram ett individuellt erbjudande som passar din situation.",
    close: "Svara bara kort på det här mejlet – jag hör av mig direkt.",
    optOut: "Inte intresserad? Ett kort svar räcker så hör du inte av oss igen.",
    signoff: "Vänliga hälsningar",
  },
  da: {
    subject: "Din Google Virksomhedsprofil – må jeg stille et hurtigt spørgsmål?",
    greeting: "Hej,",
    noCompany: "din Google Virksomhedsprofil",
    p1: "for nylig blev det tjekket på vores platform, om {company} kan fjernes permanent fra Google – tjekket var positivt, men der blev ikke afgivet nogen ordre.",
    p2: "Jeg er oprigtigt nysgerrig: hvad var årsagen? Prisen, ydelsens omfang – eller noget andet?",
    offer: "Hvis du grundlæggende stadig er interesseret, laver jeg gerne et individuelt tilbud, der passer til din situation.",
    close: "Svar blot kort på denne mail – så vender jeg straks tilbage.",
    optOut: "Ingen interesse? Et kort svar er nok, så hører du ikke fra os igen.",
    signoff: "Venlig hilsen",
  },
  no: {
    subject: "Din Google bedriftsprofil – kan jeg stille et raskt spørsmål?",
    greeting: "Hei,",
    noCompany: "din Google bedriftsprofil",
    p1: "nylig ble det sjekket på plattformen vår om {company} kan fjernes permanent fra Google – sjekken var positiv, men ingen bestilling ble lagt inn.",
    p2: "Jeg er oppriktig nysgjerrig: hva var grunnen? Prisen, tjenestens omfang – eller noe annet?",
    offer: "Hvis du i utgangspunktet fortsatt er interessert, lager jeg gjerne et individuelt tilbud som passer din situasjon.",
    close: "Bare svar kort på denne e-posten – jeg tar kontakt med en gang.",
    optOut: "Ikke interessert? Et kort svar er nok, så hører du ikke fra oss igjen.",
    signoff: "Vennlig hilsen",
  },
};

export function subject(p: RueckgewinnungProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Rueckgewinnung({ lang = "de", company = "", senderName = "Maximilian Hölzl", _overrides }: RueckgewinnungProps = {}) {
  const t = { ...(T[lang] || T.de), ...(_overrides || {}) } as Entry;
  const co = (company || "").trim() || t.noCompany;
  const fill = (s: string) => (s || "").replace(/\{company\}/g, co);
  // Schlichter 1:1-Mail-Look: Systemschrift, linksbündig, keine Karten/Farben/Logos.
  const p = { margin: "0 0 14px", fontSize: 14.5, lineHeight: "1.65", color: "#222222", fontFamily: "Arial, Helvetica, sans-serif" } as const;
  return (
    <Html lang={lang}>
      <Head />
      <Body style={{ margin: 0, background: "#ffffff", padding: "24px 20px" }}>
        <Container style={{ maxWidth: 560, margin: "0" }}>
          <Text style={p}>{t.greeting}</Text>
          <Text style={p}>{fill(t.p1)}</Text>
          <Text style={p}>{fill(t.p2)}</Text>
          <Text style={p}>{fill(t.offer)}</Text>
          <Text style={p}>{fill(t.close)}</Text>
          <Text style={{ ...p, marginBottom: 0 }}>{t.signoff}</Text>
          <Text style={{ ...p, margin: "4px 0 0", fontWeight: 700 }}>{senderName}</Text>
          <Text style={{ ...p, margin: "2px 0 0", fontSize: 12.5, color: "#777777" }}>RapidRemove · rapid-remove.com</Text>
          <Text style={{ ...p, margin: "22px 0 0", fontSize: 11.5, color: "#9a9a9a" }}>
            Simple Solution. OG · Salzgasse 2, 5400 Hallein, Österreich<br />
            {fill(t.optOut)}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
