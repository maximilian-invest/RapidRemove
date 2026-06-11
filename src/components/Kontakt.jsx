"use client";
/* RapidRemove — Kontakt-Seite (portiert aus dem Design-Handoff Kontakt.html/.jsx).
   Eigenständige Hülle wie Article/Legal: LangContext aus rr_lang, echte URLs.
   Formular sendet an das ops-Backend (/contact); WhatsApp-Kanal → Tidio-Live-Chat. */
import React from "react";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat, useReveal, openChat } from "@/components/Chrome";
import { LangContext, useLang } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath, magazinePath } from "@/lib/locales-meta";
import { submitContact } from "@/lib/order";

const KONTAKT_COPY = {
  de: {
    eyebrow: "Kontakt", h1: "Sprechen Sie mit uns.",
    lead: "Ob Frage zur Löschung, laufender Auftrag oder Partnerschaft – wir antworten persönlich, in der Regel innerhalb weniger Stunden.",
    formH: "Nachricht senden", formSub: "Beschreiben Sie kurz Ihr Anliegen – ein Spezialist aus unserem Team meldet sich bei Ihnen.",
    f: { name: "Ihr Name", namePh: "Max Mustermann", email: "E-Mail", emailPh: "max@firma.de", topic: "Thema", msg: "Ihre Nachricht", msgPh: "Worum geht es? Gern auch mit Link zum Google-Profil." },
    topics: ["Google-Profil löschen lassen", "Bewertungen & Reputation", "Frage zu laufendem Auftrag", "Partner werden", "Sonstiges"],
    privacy: "DSGVO-konform & vertraulich. Ihre Angaben werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.",
    send: "Nachricht senden", sending: "Wird gesendet …",
    sentH: "Vielen Dank! Ihre Nachricht ist bei uns.", sentP: "Wir melden uns in der Regel innerhalb weniger Stunden – an Werktagen oft schneller.", sentBtn: "Weitere Nachricht senden",
    errP: "Senden fehlgeschlagen. Bitte direkt per E-Mail an helpdesk@rapid-remove.com.",
    chH: "Direkter Draht",
    channels: [
      { ic: "message", t: "Live-Chat", d: "Schnellste Antwort – oft in wenigen Minuten.", chat: true },
      { ic: "mail", t: "E-Mail", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Erreichbar Mo–Fr, 9:00–17:00 Uhr.", " Anfragen außerhalb beantworten wir am nächsten Werktag."],
    coH: "Unser Standort", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Österreich"], coUid: "UID: ATU72401536",
    badges: ["DSGVO-konform", "Server in der EU", "Antwort meist < 24 h"],
    ctaTitle: "Oder starten Sie direkt – mit dem Gratis-Check.", ctaBtn: "Kostenlos prüfen",
  },
  en: {
    eyebrow: "Contact", h1: "Talk to us.",
    lead: "A question about removal, an ongoing case or a partnership – we reply personally, usually within a few hours.",
    formH: "Send a message", formSub: "Briefly describe your request – a specialist from our team will get back to you.",
    f: { name: "Your name", namePh: "John Smith", email: "Email", emailPh: "john@company.com", topic: "Topic", msg: "Your message", msgPh: "What is it about? Feel free to include the link to the Google profile." },
    topics: ["Remove a Google profile", "Reviews & reputation", "Question about an ongoing case", "Become a partner", "Other"],
    privacy: "GDPR-compliant & confidential. Your details are used exclusively to handle your request.",
    send: "Send message", sending: "Sending …",
    sentH: "Thank you! We've received your message.", sentP: "We usually reply within a few hours – often faster on business days.", sentBtn: "Send another message",
    errP: "Sending failed. Please email us directly at helpdesk@rapid-remove.com.",
    chH: "Direct contact",
    channels: [
      { ic: "message", t: "Live chat", d: "Fastest reply – often within minutes.", chat: true },
      { ic: "mail", t: "Email", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Available Mon–Fri, 9:00–17:00 (CET).", " Requests outside these hours are answered the next business day."],
    coH: "Our office", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Austria"], coUid: "VAT ID: ATU72401536",
    badges: ["GDPR-compliant", "EU servers", "Reply usually < 24 h"],
    ctaTitle: "Or start right away – with the free check.", ctaBtn: "Check for free",
  },
  es: {
    eyebrow: "Contacto", h1: "Hable con nosotros.",
    lead: "Una duda sobre la eliminación, un encargo en curso o una colaboración: respondemos en persona, normalmente en pocas horas.",
    formH: "Enviar un mensaje", formSub: "Describa brevemente su solicitud: un especialista de nuestro equipo se pondrá en contacto.",
    f: { name: "Su nombre", namePh: "Juan Pérez", email: "Correo electrónico", emailPh: "juan@empresa.com", topic: "Tema", msg: "Su mensaje", msgPh: "¿De qué se trata? Puede incluir el enlace al perfil de Google." },
    topics: ["Eliminar un perfil de Google", "Reseñas y reputación", "Consulta sobre un encargo en curso", "Ser socio", "Otro"],
    privacy: "Conforme al RGPD y confidencial. Sus datos se usan únicamente para tramitar su solicitud.",
    send: "Enviar mensaje", sending: "Enviando …",
    sentH: "¡Gracias! Hemos recibido su mensaje.", sentP: "Normalmente respondemos en pocas horas, a menudo más rápido en días laborables.", sentBtn: "Enviar otro mensaje",
    errP: "Error al enviar. Escríbanos directamente a helpdesk@rapid-remove.com.",
    chH: "Contacto directo",
    channels: [
      { ic: "message", t: "Chat en vivo", d: "Respuesta más rápida, a menudo en minutos.", chat: true },
      { ic: "mail", t: "Correo electrónico", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Disponible L–V, 9:00–17:00 (CET).", " Las consultas fuera de horario se responden el siguiente día laborable."],
    coH: "Nuestra oficina", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Austria"], coUid: "CIF: ATU72401536",
    badges: ["Conforme al RGPD", "Servidores en la UE", "Respuesta < 24 h"],
    ctaTitle: "O empiece ya, con el análisis gratuito.", ctaBtn: "Comprobar gratis",
  },
  fr: {
    eyebrow: "Contact", h1: "Parlez-nous.",
    lead: "Une question sur la suppression, un dossier en cours ou un partenariat : nous répondons personnellement, généralement en quelques heures.",
    formH: "Envoyer un message", formSub: "Décrivez brièvement votre demande : un spécialiste de notre équipe vous recontactera.",
    f: { name: "Votre nom", namePh: "Jean Dupont", email: "E-mail", emailPh: "jean@entreprise.fr", topic: "Sujet", msg: "Votre message", msgPh: "De quoi s'agit-il ? N'hésitez pas à inclure le lien vers la fiche Google." },
    topics: ["Supprimer une fiche Google", "Avis & réputation", "Question sur un dossier en cours", "Devenir partenaire", "Autre"],
    privacy: "Conforme au RGPD et confidentiel. Vos données servent uniquement à traiter votre demande.",
    send: "Envoyer le message", sending: "Envoi …",
    sentH: "Merci ! Nous avons bien reçu votre message.", sentP: "Nous répondons généralement en quelques heures, souvent plus vite en jours ouvrés.", sentBtn: "Envoyer un autre message",
    errP: "Échec de l'envoi. Écrivez-nous directement à helpdesk@rapid-remove.com.",
    chH: "Contact direct",
    channels: [
      { ic: "message", t: "Chat en direct", d: "Réponse la plus rapide, souvent en quelques minutes.", chat: true },
      { ic: "mail", t: "E-mail", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Disponible lun–ven, 9h00–17h00 (CET).", " Les demandes hors de ces horaires sont traitées le jour ouvré suivant."],
    coH: "Notre bureau", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Autriche"], coUid: "N° TVA : ATU72401536",
    badges: ["Conforme au RGPD", "Serveurs dans l'UE", "Réponse < 24 h"],
    ctaTitle: "Ou commencez tout de suite, avec le contrôle gratuit.", ctaBtn: "Vérifier gratuitement",
  },
  it: {
    eyebrow: "Contatti", h1: "Parli con noi.",
    lead: "Una domanda sulla rimozione, un incarico in corso o una collaborazione: rispondiamo personalmente, di solito in poche ore.",
    formH: "Invia un messaggio", formSub: "Descriva brevemente la sua richiesta: un nostro specialista la ricontatterà.",
    f: { name: "Il suo nome", namePh: "Mario Rossi", email: "E-mail", emailPh: "mario@azienda.it", topic: "Argomento", msg: "Il suo messaggio", msgPh: "Di cosa si tratta? Può includere il link al profilo Google." },
    topics: ["Eliminare un profilo Google", "Recensioni e reputazione", "Domanda su un incarico in corso", "Diventare partner", "Altro"],
    privacy: "Conforme al GDPR e riservato. I suoi dati sono usati esclusivamente per gestire la richiesta.",
    send: "Invia messaggio", sending: "Invio …",
    sentH: "Grazie! Abbiamo ricevuto il suo messaggio.", sentP: "Di solito rispondiamo in poche ore, spesso più rapidamente nei giorni feriali.", sentBtn: "Invia un altro messaggio",
    errP: "Invio non riuscito. Ci scriva direttamente a helpdesk@rapid-remove.com.",
    chH: "Contatto diretto",
    channels: [
      { ic: "message", t: "Chat dal vivo", d: "Risposta più rapida, spesso in pochi minuti.", chat: true },
      { ic: "mail", t: "E-mail", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Disponibile lun–ven, 9:00–17:00 (CET).", " Le richieste fuori orario ricevono risposta il giorno lavorativo successivo."],
    coH: "La nostra sede", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Austria"], coUid: "P. IVA: ATU72401536",
    badges: ["Conforme al GDPR", "Server nell'UE", "Risposta < 24 h"],
    ctaTitle: "Oppure inizi subito, con la verifica gratuita.", ctaBtn: "Verifica gratis",
  },
  nl: {
    eyebrow: "Contact", h1: "Praat met ons.",
    lead: "Een vraag over verwijdering, een lopende opdracht of een partnerschap – we reageren persoonlijk, meestal binnen enkele uren.",
    formH: "Bericht sturen", formSub: "Beschrijf kort uw vraag – een specialist uit ons team neemt contact met u op.",
    f: { name: "Uw naam", namePh: "Jan Jansen", email: "E-mail", emailPh: "jan@bedrijf.nl", topic: "Onderwerp", msg: "Uw bericht", msgPh: "Waar gaat het om? Voeg gerust de link naar het Google-profiel toe." },
    topics: ["Google-profiel laten verwijderen", "Reviews & reputatie", "Vraag over een lopende opdracht", "Partner worden", "Overig"],
    privacy: "AVG-conform & vertrouwelijk. Uw gegevens worden uitsluitend gebruikt om uw verzoek te behandelen.",
    send: "Bericht sturen", sending: "Versturen …",
    sentH: "Bedankt! We hebben uw bericht ontvangen.", sentP: "We reageren meestal binnen enkele uren – op werkdagen vaak sneller.", sentBtn: "Nog een bericht sturen",
    errP: "Verzenden mislukt. Mail ons rechtstreeks via helpdesk@rapid-remove.com.",
    chH: "Direct contact",
    channels: [
      { ic: "message", t: "Livechat", d: "Snelste antwoord – vaak binnen enkele minuten.", chat: true },
      { ic: "mail", t: "E-mail", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Bereikbaar ma–vr, 9:00–17:00 uur (CET).", " Verzoeken daarbuiten beantwoorden we de volgende werkdag."],
    coH: "Onze locatie", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Oostenrijk"], coUid: "Btw-nr.: ATU72401536",
    badges: ["AVG-conform", "Servers in de EU", "Antwoord < 24 u"],
    ctaTitle: "Of begin meteen – met de gratis check.", ctaBtn: "Gratis checken",
  },
  pt: {
    eyebrow: "Contacto", h1: "Fale connosco.",
    lead: "Uma dúvida sobre a remoção, um pedido em curso ou uma parceria – respondemos pessoalmente, normalmente em poucas horas.",
    formH: "Enviar mensagem", formSub: "Descreva brevemente o seu pedido – um especialista da nossa equipa entrará em contacto.",
    f: { name: "O seu nome", namePh: "João Silva", email: "E-mail", emailPh: "joao@empresa.pt", topic: "Assunto", msg: "A sua mensagem", msgPh: "Do que se trata? Pode incluir o link para o perfil do Google." },
    topics: ["Remover um perfil do Google", "Avaliações e reputação", "Dúvida sobre um pedido em curso", "Tornar-se parceiro", "Outro"],
    privacy: "Conforme ao RGPD e confidencial. Os seus dados são usados exclusivamente para tratar o seu pedido.",
    send: "Enviar mensagem", sending: "A enviar …",
    sentH: "Obrigado! Recebemos a sua mensagem.", sentP: "Normalmente respondemos em poucas horas – muitas vezes mais rápido em dias úteis.", sentBtn: "Enviar outra mensagem",
    errP: "Falha no envio. Escreva-nos diretamente para helpdesk@rapid-remove.com.",
    chH: "Contacto direto",
    channels: [
      { ic: "message", t: "Chat ao vivo", d: "Resposta mais rápida, muitas vezes em minutos.", chat: true },
      { ic: "mail", t: "E-mail", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Disponível seg–sex, 9:00–17:00 (CET).", " Os pedidos fora deste horário são respondidos no dia útil seguinte."],
    coH: "O nosso escritório", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Áustria"], coUid: "NIF: ATU72401536",
    badges: ["Conforme ao RGPD", "Servidores na UE", "Resposta < 24 h"],
    ctaTitle: "Ou comece já – com a verificação gratuita.", ctaBtn: "Verificar grátis",
  },
  ja: {
    eyebrow: "お問い合わせ", h1: "お気軽にご連絡ください。",
    lead: "削除に関するご質問、進行中の案件、提携のご相談など、通常は数時間以内に担当者が直接ご返信します。",
    formH: "メッセージを送る", formSub: "ご用件を簡単にご記入ください。担当のスペシャリストからご連絡します。",
    f: { name: "お名前", namePh: "山田 太郎", email: "メール", emailPh: "taro@example.com", topic: "ご用件", msg: "メッセージ", msgPh: "どのようなご用件ですか？ Googleプロフィールのリンクも歓迎します。" },
    topics: ["Googleプロフィールの削除", "クチコミ・評判", "進行中の案件について", "パートナーになる", "その他"],
    privacy: "GDPR準拠・秘密厳守。ご記入内容はお問い合わせ対応のみに使用します。",
    send: "メッセージを送る", sending: "送信中 …",
    sentH: "ありがとうございます。メッセージを受け取りました。", sentP: "通常は数時間以内に、営業日ならより早くご返信します。", sentBtn: "別のメッセージを送る",
    errP: "送信に失敗しました。helpdesk@rapid-remove.com まで直接メールでご連絡ください。",
    chH: "直接のご連絡",
    channels: [
      { ic: "message", t: "ライブチャット", d: "最速の返信 ― 多くは数分以内。", chat: true },
      { ic: "mail", t: "メール", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["受付：月〜金 9:00〜17:00（中央ヨーロッパ時間）。", " 時間外のお問い合わせは翌営業日にご返信します。"],
    coH: "所在地", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, オーストリア"], coUid: "UID: ATU72401536",
    badges: ["GDPR準拠", "EUのサーバー", "返信は通常24時間以内"],
    ctaTitle: "または今すぐ無料チェックを。", ctaBtn: "無料でチェック",
  },
  sv: {
    eyebrow: "Kontakt", h1: "Prata med oss.",
    lead: "En fråga om borttagning, ett pågående ärende eller ett samarbete – vi svarar personligen, oftast inom några timmar.",
    formH: "Skicka ett meddelande", formSub: "Beskriv kort ditt ärende – en specialist i vårt team återkommer till dig.",
    f: { name: "Ditt namn", namePh: "Anna Andersson", email: "E-post", emailPh: "anna@foretag.se", topic: "Ämne", msg: "Ditt meddelande", msgPh: "Vad gäller det? Inkludera gärna länken till Google-profilen." },
    topics: ["Ta bort en Google-profil", "Omdömen & rykte", "Fråga om ett pågående ärende", "Bli partner", "Övrigt"],
    privacy: "GDPR-förenligt & konfidentiellt. Dina uppgifter används endast för att hantera din förfrågan.",
    send: "Skicka meddelande", sending: "Skickar …",
    sentH: "Tack! Vi har fått ditt meddelande.", sentP: "Vi svarar oftast inom några timmar – ofta snabbare på vardagar.", sentBtn: "Skicka ett till meddelande",
    errP: "Det gick inte att skicka. Mejla oss direkt på helpdesk@rapid-remove.com.",
    chH: "Direktkontakt",
    channels: [
      { ic: "message", t: "Livechatt", d: "Snabbast svar – ofta inom några minuter.", chat: true },
      { ic: "mail", t: "E-post", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Tillgängliga mån–fre, 9:00–17:00 (CET).", " Förfrågningar utanför dessa tider besvaras nästa vardag."],
    coH: "Vårt kontor", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Österrike"], coUid: "Momsnr: ATU72401536",
    badges: ["GDPR-förenligt", "Servrar i EU", "Svar < 24 h"],
    ctaTitle: "Eller börja direkt – med gratiskollen.", ctaBtn: "Kolla gratis",
  },
  da: {
    eyebrow: "Kontakt", h1: "Tal med os.",
    lead: "Et spørgsmål om fjernelse, en igangværende sag eller et partnerskab – vi svarer personligt, normalt inden for få timer.",
    formH: "Send en besked", formSub: "Beskriv kort dit ærinde – en specialist fra vores team vender tilbage til dig.",
    f: { name: "Dit navn", namePh: "Anders Hansen", email: "E-mail", emailPh: "anders@firma.dk", topic: "Emne", msg: "Din besked", msgPh: "Hvad drejer det sig om? Inkludér gerne linket til Google-profilen." },
    topics: ["Fjern en Google-profil", "Anmeldelser & omdømme", "Spørgsmål om en igangværende sag", "Bliv partner", "Andet"],
    privacy: "GDPR-overholdelse & fortroligt. Dine oplysninger bruges udelukkende til at behandle din henvendelse.",
    send: "Send besked", sending: "Sender …",
    sentH: "Tak! Vi har modtaget din besked.", sentP: "Vi svarer normalt inden for få timer – ofte hurtigere på hverdage.", sentBtn: "Send en ny besked",
    errP: "Afsendelse mislykkedes. Skriv direkte til helpdesk@rapid-remove.com.",
    chH: "Direkte kontakt",
    channels: [
      { ic: "message", t: "Livechat", d: "Hurtigste svar – ofte inden for få minutter.", chat: true },
      { ic: "mail", t: "E-mail", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Tilgængelige man–fre, 9:00–17:00 (CET).", " Henvendelser uden for dette tidsrum besvares næste hverdag."],
    coH: "Vores kontor", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Østrig"], coUid: "Momsnr.: ATU72401536",
    badges: ["GDPR-overholdelse", "Servere i EU", "Svar < 24 t"],
    ctaTitle: "Eller start med det samme – med gratis-tjekket.", ctaBtn: "Tjek gratis",
  },
  no: {
    eyebrow: "Kontakt", h1: "Snakk med oss.",
    lead: "Et spørsmål om fjerning, en pågående sak eller et samarbeid – vi svarer personlig, vanligvis innen få timer.",
    formH: "Send en melding", formSub: "Beskriv kort henvendelsen din – en spesialist fra teamet vårt tar kontakt.",
    f: { name: "Navnet ditt", namePh: "Ola Nordmann", email: "E-post", emailPh: "ola@firma.no", topic: "Emne", msg: "Meldingen din", msgPh: "Hva gjelder det? Legg gjerne ved lenken til Google-profilen." },
    topics: ["Fjern en Google-profil", "Omtaler & omdømme", "Spørsmål om en pågående sak", "Bli partner", "Annet"],
    privacy: "GDPR-samsvar & konfidensielt. Opplysningene dine brukes kun til å behandle henvendelsen din.",
    send: "Send melding", sending: "Sender …",
    sentH: "Takk! Vi har mottatt meldingen din.", sentP: "Vi svarer vanligvis innen få timer – ofte raskere på virkedager.", sentBtn: "Send en ny melding",
    errP: "Sending mislyktes. Send oss en e-post direkte til helpdesk@rapid-remove.com.",
    chH: "Direkte kontakt",
    channels: [
      { ic: "message", t: "Live-chat", d: "Raskest svar – ofte innen få minutter.", chat: true },
      { ic: "mail", t: "E-post", d: "helpdesk@rapid-remove.com", href: "mailto:helpdesk@rapid-remove.com" },
    ],
    hours: ["Tilgjengelig man–fre, 9:00–17:00 (CET).", " Henvendelser utenom dette besvares neste virkedag."],
    coH: "Kontoret vårt", co: ["Simple Solution. OG", "Salzgasse 2", "5400 Hallein, Østerrike"], coUid: "Mva-nr.: ATU72401536",
    badges: ["GDPR-samsvar", "Servere i EU", "Svar < 24 t"],
    ctaTitle: "Eller start med en gang – med gratis-sjekken.", ctaBtn: "Sjekk gratis",
  },
};

function KontaktBody({ onStart, onBlog, onAbout }) {
  const { t, lang } = useLang();
  const k = KONTAKT_COPY[lang] || KONTAKT_COPY.en;
  const [state, setState] = React.useState("idle"); // idle | sending | sent | error
  const [form, setForm] = React.useState({ name: "", email: "", topic: "", message: "" });
  useReveal();
  React.useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const r = await submitContact({ ...form, topic: form.topic || k.topics[0], lang });
      if (r && r.skipped) { setState("sent"); return; } // kein ops-Backend (Demo) → optimistisch
      setState(r && r.ok ? "sent" : "error");
    } catch (err) { setState("error"); }
  };
  const reset = () => { setForm({ name: "", email: "", topic: "", message: "" }); setState("idle"); };

  return (
    <div className="kontakt">
      <Nav onNav={(id) => onBlog && onBlog(id)} onStart={onStart} onBlog={onBlog} onAbout={onAbout}
        onOrm={() => (window.location.href = asset("/reputation-verdraengen/"))} onDeindex={() => (window.location.href = asset("/presse-auslisten/"))} active="" />

      <section className="kt-hero">
        <div className="hero-glow"></div>
        <div className="container">
          <div className="kt-eyebrow reveal"><Icon.message size={15} /> {k.eyebrow}</div>
          <h1 className="reveal d1">{k.h1}</h1>
          <p className="kt-lead reveal d2">{k.lead}</p>
        </div>
      </section>

      <section className="kt-main">
        <div className="container kt-grid">
          <div className="kt-card reveal">
            {state === "sent" ? (
              <div className="kt-sent">
                <div className="ic"><Icon.checkCircle /></div>
                <h3>{k.sentH}</h3>
                <p>{k.sentP}</p>
                <button className="btn btn-ghost" onClick={reset}>{k.sentBtn}</button>
              </div>
            ) : (
              <React.Fragment>
                <h2>{k.formH}</h2>
                <p className="kt-sub">{k.formSub}</p>
                <form className="kt-form" onSubmit={submit}>
                  <div className="kt-row">
                    <div className="kt-field">
                      <label htmlFor="kt-name">{k.f.name}</label>
                      <input id="kt-name" className="kt-in" type="text" placeholder={k.f.namePh} value={form.name} onChange={set("name")} required />
                    </div>
                    <div className="kt-field">
                      <label htmlFor="kt-email">{k.f.email}</label>
                      <input id="kt-email" className="kt-in" type="email" placeholder={k.f.emailPh} value={form.email} onChange={set("email")} required />
                    </div>
                  </div>
                  <div className="kt-field">
                    <label htmlFor="kt-topic">{k.f.topic}</label>
                    <div className="kt-select">
                      <select id="kt-topic" className="kt-in" value={form.topic || k.topics[0]} onChange={set("topic")}>
                        {k.topics.map((tp, i) => <option key={i} value={tp}>{tp}</option>)}
                      </select>
                      <Icon.chevronDown />
                    </div>
                  </div>
                  <div className="kt-field">
                    <label htmlFor="kt-msg">{k.f.msg}</label>
                    <textarea id="kt-msg" className="kt-in" placeholder={k.f.msgPh} value={form.message} onChange={set("message")} required />
                  </div>
                  {state === "error" && <div className="kt-err"><Icon.alert size={15} /> <span>{k.errP}</span></div>}
                  <div className="kt-privacy"><Icon.lock /> <span>{k.privacy}</span></div>
                  <button className="btn btn-primary btn-block" type="submit" disabled={state === "sending"}>
                    <Icon.mail size={18} /> {state === "sending" ? k.sending : k.send}
                  </button>
                </form>
              </React.Fragment>
            )}
          </div>

          <div className="kt-side">
            <div className="kt-panel reveal d1">
              <h3 className="kt-ph"><Icon.message size={18} /> {k.chH}</h3>
              <div className="kt-chs">
                {k.channels.map((c, i) => {
                  const I = Icon[c.ic] || Icon.mail;
                  const ext = c.href && c.href.indexOf("http") === 0;
                  const onClick = c.chat ? (e) => { e.preventDefault(); openChat(); } : undefined;
                  return (
                    <a className="kt-ch" key={i} href={c.href || "#chat"} onClick={onClick} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}>
                      <span className="cic"><I size={20} /></span>
                      <span className="cbody">
                        <span className="ct">{c.t}</span>
                        <span className="cd" style={{ display: "block" }}>{c.d}</span>
                      </span>
                      <span className="arr"><Icon.arrowRight size={17} /></span>
                    </a>
                  );
                })}
              </div>
              <div className="kt-hours"><Icon.clock /> <span><b>{k.hours[0]}</b>{k.hours[1]}</span></div>
            </div>

            <div className="kt-panel soft kt-office reveal d2">
              <h3><Icon.mapPin size={18} /> {k.coH}</h3>
              <p className="addr"><b>{k.co[0]}</b><br />{k.co[1]}<br />{k.co[2]}</p>
              <div className="uid">{k.coUid}</div>
              <div className="kt-badges">
                {k.badges.map((b, i) => <span className="b" key={i}><Icon.check /> {b}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="cta-band reveal">
            <div className="glow"></div>
            <h2>{k.ctaTitle}</h2>
            <div style={{ position: "relative", marginTop: 8 }}>
              <button className="btn btn-white lg" onClick={onStart}><Icon.search size={19} /> {k.ctaBtn} <Icon.arrowRight size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      <Footer onStart={onStart} onBlog={onBlog} onAbout={onAbout} />
      <WhatsAppFloat />
    </div>
  );
}

export default function Kontakt() {
  const [lang, setLangState] = React.useState("de");
  React.useEffect(() => { try { const s = localStorage.getItem("rr_lang"); if (s && I18N[s]) setLangState(s); } catch (e) {} }, []);
  const setLang = (l) => { try { localStorage.setItem("rr_lang", l); } catch (e) {} window.location.href = asset(localePath(l)); };
  const t = I18N[lang] || I18N.de;
  const nav = (p) => { window.location.href = asset(p); };
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <KontaktBody
        onStart={() => nav("/?start=1")}
        onBlog={() => nav(magazinePath(lang))}
        onAbout={() => nav("/ueber-uns/")}
      />
    </LangContext.Provider>
  );
}
