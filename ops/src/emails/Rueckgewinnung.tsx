/* Template: Rückgewinnung / Win-back — für Prüfungs-Leads, die NICHT beauftragt haben.
   Wird manuell aus „Geprüfte Profile" im Admin gesendet. Bewusst NEUTRAL formuliert
   („das Profil wurde geprüft"), weil bei früh abgebrochenen Prüfungen nicht sicher ist,
   dass der Empfänger selbst geprüft hat. Fragt nach dem Grund (Preis/Leistung/anderes)
   und bietet ein individuelles Angebot an — OHNE feste Rabatthöhe (die wird individuell
   in der Antwort verhandelt und steht nirgends öffentlich). Mit höflicher Opt-out-Zeile
   (wichtig bei unaufgeforderter B2B-Kontaktaufnahme). Alle 11 Sprachen, de = Sie-Form.
   {company} wird beim Rendern durch den Profil-/Firmennamen ersetzt. */
import * as React from "react";
import { EmailShell, P, NoteBox, brand, type MailLang } from "./components";

export interface RueckgewinnungProps {
  lang?: MailLang;
  /** Name des Ansprechpartners (falls bekannt) für die persönliche Anrede. */
  name?: string;
  /** Unternehmens-/Profilname aus der Prüfung — ersetzt {company} in den Texten. */
  company?: string;
  /** Im Admin bearbeitete Text-Overrides (überschreiben die Default-Texte pro Feld). */
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: string; preview: string; title: string;
  greeting: (n: string) => string;
  /** Fallback für {company}, wenn kein Firmenname vorliegt. */
  noCompany: string;
  p1: string; p2: string; offer: string; close: string; optOut: string; signoff: string;
}

export const T: Record<string, Entry> = {
  de: {
    subject: "Ihr Google-Unternehmensprofil – dürfen wir nachfragen?",
    preview: "Das Profil wurde auf Löschbarkeit geprüft – gern erstellen wir ein individuelles Angebot.",
    title: "Dürfen wir kurz nachfragen?",
    greeting: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    noCompany: "Ihr Google-Unternehmensprofil",
    p1: "vor Kurzem wurde auf unserer Plattform geprüft, ob sich {company} dauerhaft von Google entfernen lässt – die Prüfung war positiv, ein Auftrag wurde jedoch nicht erteilt.",
    p2: "Uns interessiert ehrlich: Woran lag es? Am Preis, am Leistungsumfang – oder an etwas anderem?",
    offer: "Wenn Sie grundsätzlich Interesse haben, erstellen wir Ihnen gern ein individuelles Angebot, das zu Ihrer Situation passt.",
    close: "Antworten Sie einfach kurz auf diese E-Mail – wir melden uns umgehend.",
    optOut: "Kein Interesse? Eine kurze Antwort genügt und Sie hören nicht wieder von uns.",
    signoff: "Freundliche Grüße",
  },
  en: {
    subject: "Your Google Business Profile – may we ask a quick question?",
    preview: "The profile was checked for removability – we’d be happy to make you an individual offer.",
    title: "May we ask a quick question?",
    greeting: (n) => (n ? `Hello ${n},` : "Hello,"),
    noCompany: "your Google Business Profile",
    p1: "a short while ago, {company} was checked on our platform to see whether it can be permanently removed from Google – the check was positive, but no order was placed.",
    p2: "We’re genuinely curious: what was the reason? The price, the scope of the service – or something else?",
    offer: "If you’re still interested in principle, we’d be happy to put together an individual offer that fits your situation.",
    close: "Just reply briefly to this email – we’ll get back to you right away.",
    optOut: "Not interested? A short reply is enough and you won’t hear from us again.",
    signoff: "Best regards",
  },
  es: {
    subject: "Su perfil de empresa de Google: ¿podemos hacerle una pregunta?",
    preview: "El perfil fue verificado para su eliminación; con gusto le hacemos una oferta individual.",
    title: "¿Podemos hacerle una breve pregunta?",
    greeting: (n) => (n ? `Buenos días ${n}:` : "Buenos días:"),
    noCompany: "su perfil de empresa de Google",
    p1: "hace poco se comprobó en nuestra plataforma si {company} puede eliminarse de Google de forma permanente. La comprobación fue positiva, pero no se realizó ningún pedido.",
    p2: "Nos interesa saberlo con sinceridad: ¿cuál fue el motivo? ¿El precio, el alcance del servicio… u otra cosa?",
    offer: "Si en principio sigue interesado, con mucho gusto le preparamos una oferta individual adaptada a su situación.",
    close: "Responda brevemente a este correo y nos pondremos en contacto de inmediato.",
    optOut: "¿No le interesa? Basta una breve respuesta y no volverá a saber de nosotros.",
    signoff: "Un cordial saludo",
  },
  fr: {
    subject: "Votre fiche d’établissement Google – pouvons-nous vous poser une question ?",
    preview: "La fiche a été vérifiée pour suppression – nous vous proposons volontiers une offre individuelle.",
    title: "Pouvons-nous vous poser une question ?",
    greeting: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    noCompany: "votre fiche d’établissement Google",
    p1: "il y a peu, il a été vérifié sur notre plateforme si {company} peut être définitivement supprimée de Google – la vérification était positive, mais aucune commande n’a été passée.",
    p2: "Nous aimerions sincèrement comprendre : quelle en était la raison ? Le prix, l’étendue de la prestation – ou autre chose ?",
    offer: "Si vous êtes toujours intéressé sur le principe, nous vous préparons volontiers une offre individuelle adaptée à votre situation.",
    close: "Répondez simplement en quelques mots à cet e-mail – nous revenons vers vous immédiatement.",
    optOut: "Pas intéressé ? Une courte réponse suffit et vous n’entendrez plus parler de nous.",
    signoff: "Cordialement",
  },
  it: {
    subject: "Il suo profilo aziendale Google – possiamo farle una domanda?",
    preview: "Il profilo è stato verificato per la rimozione – le prepariamo volentieri un’offerta individuale.",
    title: "Possiamo farle una breve domanda?",
    greeting: (n) => (n ? `Buongiorno ${n},` : "Buongiorno,"),
    noCompany: "il suo profilo aziendale Google",
    p1: "poco tempo fa è stato verificato sulla nostra piattaforma se {company} può essere rimosso definitivamente da Google – la verifica ha avuto esito positivo, ma non è stato effettuato alcun ordine.",
    p2: "Ci interessa sinceramente: qual è stato il motivo? Il prezzo, l’ambito del servizio – o qualcos’altro?",
    offer: "Se in linea di principio è ancora interessato, le prepariamo volentieri un’offerta individuale adatta alla sua situazione.",
    close: "Risponda semplicemente a questa e-mail – la ricontatteremo subito.",
    optOut: "Non è interessato? Basta una breve risposta e non la contatteremo più.",
    signoff: "Cordiali saluti",
  },
  nl: {
    subject: "Uw Google-bedrijfsprofiel – mogen we iets vragen?",
    preview: "Het profiel is gecontroleerd op verwijderbaarheid – we maken graag een individueel aanbod.",
    title: "Mogen we kort iets vragen?",
    greeting: (n) => (n ? `Goedendag ${n},` : "Goedendag,"),
    noCompany: "uw Google-bedrijfsprofiel",
    p1: "onlangs is op ons platform gecontroleerd of {company} permanent van Google verwijderd kan worden – de controle was positief, maar er is geen opdracht geplaatst.",
    p2: "We zijn oprecht benieuwd: waar lag het aan? De prijs, de omvang van de dienst – of iets anders?",
    offer: "Als u in principe nog interesse heeft, stellen we graag een individueel aanbod samen dat bij uw situatie past.",
    close: "Reageer gewoon kort op deze e-mail – we nemen direct contact met u op.",
    optOut: "Geen interesse? Een kort antwoord volstaat en u hoort niets meer van ons.",
    signoff: "Met vriendelijke groet",
  },
  pt: {
    subject: "O seu perfil de empresa no Google – podemos fazer uma pergunta?",
    preview: "O perfil foi verificado para remoção – teremos todo o gosto em fazer uma oferta individual.",
    title: "Podemos fazer uma breve pergunta?",
    greeting: (n) => (n ? `Bom dia ${n},` : "Bom dia,"),
    noCompany: "o seu perfil de empresa no Google",
    p1: "há pouco tempo foi verificado na nossa plataforma se {company} pode ser removido permanentemente do Google – a verificação foi positiva, mas não foi feita nenhuma encomenda.",
    p2: "Interessa-nos sinceramente saber: qual foi o motivo? O preço, o âmbito do serviço – ou outra coisa?",
    offer: "Se, em princípio, ainda tiver interesse, teremos todo o gosto em preparar uma oferta individual adequada à sua situação.",
    close: "Basta responder brevemente a este e-mail – entraremos em contacto de imediato.",
    optOut: "Sem interesse? Uma breve resposta é suficiente e não voltará a ouvir de nós.",
    signoff: "Com os melhores cumprimentos",
  },
  ja: {
    subject: "貴社のGoogleビジネスプロフィールについて – 一つお伺いしてもよろしいですか?",
    preview: "プロフィールの削除可否が確認されました。個別のご提案をご用意いたします。",
    title: "一つお伺いしてもよろしいですか?",
    greeting: (n) => (n ? `${n}様` : "ご担当者様"),
    noCompany: "貴社のGoogleビジネスプロフィール",
    p1: "先日、当社のプラットフォームで{company}がGoogleから完全に削除できるかどうかの確認が行われました。確認結果は「削除可能」でしたが、ご依頼には至りませんでした。",
    p2: "率直にお伺いしたいのですが、理由は何だったのでしょうか。価格でしょうか、サービス内容でしょうか、それとも別の理由でしょうか。",
    offer: "もしご関心がおありでしたら、御社の状況に合わせた個別のご提案を喜んでご用意いたします。",
    close: "このメールに一言ご返信いただければ、すぐにご連絡いたします。",
    optOut: "ご興味がない場合は、一言ご返信いただければ、以後ご連絡はいたしません。",
    signoff: "どうぞよろしくお願いいたします",
  },
  sv: {
    subject: "Din Google Företagsprofil – får vi ställa en snabb fråga?",
    preview: "Profilen har kontrollerats för borttagning – vi tar gärna fram ett individuellt erbjudande.",
    title: "Får vi ställa en snabb fråga?",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    noCompany: "din Google Företagsprofil",
    p1: "nyligen kontrollerades det på vår plattform om {company} kan tas bort permanent från Google – kontrollen var positiv, men ingen beställning gjordes.",
    p2: "Vi är uppriktigt nyfikna: vad berodde det på? Priset, tjänstens omfattning – eller något annat?",
    offer: "Om du i grunden fortfarande är intresserad tar vi gärna fram ett individuellt erbjudande som passar din situation.",
    close: "Svara bara kort på det här mejlet – vi hör av oss direkt.",
    optOut: "Inte intresserad? Ett kort svar räcker så hör du inte av oss igen.",
    signoff: "Vänliga hälsningar",
  },
  da: {
    subject: "Din Google Virksomhedsprofil – må vi stille et hurtigt spørgsmål?",
    preview: "Profilen er blevet tjekket for sletning – vi laver gerne et individuelt tilbud.",
    title: "Må vi stille et hurtigt spørgsmål?",
    greeting: (n) => (n ? `Goddag ${n},` : "Goddag,"),
    noCompany: "din Google Virksomhedsprofil",
    p1: "for nylig blev det tjekket på vores platform, om {company} kan fjernes permanent fra Google – tjekket var positivt, men der blev ikke afgivet nogen ordre.",
    p2: "Vi er oprigtigt nysgerrige: hvad var årsagen? Prisen, ydelsens omfang – eller noget andet?",
    offer: "Hvis du grundlæggende stadig er interesseret, laver vi gerne et individuelt tilbud, der passer til din situation.",
    close: "Svar blot kort på denne mail – så vender vi straks tilbage.",
    optOut: "Ingen interesse? Et kort svar er nok, så hører du ikke fra os igen.",
    signoff: "Venlig hilsen",
  },
  no: {
    subject: "Din Google bedriftsprofil – kan vi stille et raskt spørsmål?",
    preview: "Profilen er sjekket for sletting – vi lager gjerne et individuelt tilbud.",
    title: "Kan vi stille et raskt spørsmål?",
    greeting: (n) => (n ? `God dag ${n},` : "God dag,"),
    noCompany: "din Google bedriftsprofil",
    p1: "nylig ble det sjekket på plattformen vår om {company} kan fjernes permanent fra Google – sjekken var positiv, men ingen bestilling ble lagt inn.",
    p2: "Vi er oppriktig nysgjerrige: hva var grunnen? Prisen, tjenestens omfang – eller noe annet?",
    offer: "Hvis du i utgangspunktet fortsatt er interessert, lager vi gjerne et individuelt tilbud som passer din situasjon.",
    close: "Bare svar kort på denne e-posten – vi tar kontakt med en gang.",
    optOut: "Ikke interessert? Et kort svar er nok, så hører du ikke fra oss igjen.",
    signoff: "Vennlig hilsen",
  },
};

export function subject(p: RueckgewinnungProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Rueckgewinnung({ lang = "de", name = "", company = "", _overrides }: RueckgewinnungProps = {}) {
  const t = { ...(T[lang] || T.de), ...(_overrides || {}) } as Entry;
  const who = (name || "").trim();
  const co = (company || "").trim() || t.noCompany;
  const fill = (s: string) => (s || "").replace(/\{company\}/g, co);
  return (
    <EmailShell preview={fill(t.preview)} title={t.title} lang={lang}>
      <P><strong>{t.greeting(who)}</strong></P>
      <P>{fill(t.p1)}</P>
      <P>{fill(t.p2)}</P>

      <NoteBox>
        <strong style={{ color: brand.tintText }}>{fill(t.offer)}</strong>
      </NoteBox>

      <P>{fill(t.close)}</P>
      <P muted>{fill(t.optOut)}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
