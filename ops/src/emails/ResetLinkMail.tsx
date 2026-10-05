/* „Passwort zurücksetzen" (Kunden-Dashboard): sicherer Link (60 Min., einmalig) statt Passwort per Mail. */
import * as React from "react";
import { EmailShell, P, CtaButton, type MailLang } from "./components";

const T: Record<string, { subj: string; title: string; hi: string; p: string; btn: string; exp: string; ign: string }> = {
  en: { subj: "Set a new password – RapidRemove", title: "Set a new password", hi: "Hi,", p: "we received a request to set a new password for your RapidRemove dashboard. Tap the button to choose a new one.", btn: "Set new password", exp: "The link is valid for 60 minutes and can only be used once.", ign: "Didn't request this? Just ignore this email – your password stays the same." },
  de: { subj: "Neues Passwort festlegen – RapidRemove", title: "Neues Passwort festlegen", hi: "Hallo,", p: "wir haben eine Anfrage erhalten, ein neues Passwort für Ihr RapidRemove-Dashboard festzulegen. Tippen Sie auf den Button, um ein neues zu wählen.", btn: "Neues Passwort festlegen", exp: "Der Link ist 60 Minuten gültig und kann nur einmal verwendet werden.", ign: "Sie haben das nicht angefordert? Dann ignorieren Sie diese E-Mail einfach – Ihr Passwort bleibt unverändert." },
  es: { subj: "Crea una nueva contraseña – RapidRemove", title: "Crea una nueva contraseña", hi: "Hola:", p: "hemos recibido una solicitud para crear una nueva contraseña para tu panel de RapidRemove. Toca el botón para elegir una nueva.", btn: "Crear nueva contraseña", exp: "El enlace es válido durante 60 minutos y solo se puede usar una vez.", ign: "¿No lo has solicitado tú? Ignora este correo: tu contraseña no cambia." },
  fr: { subj: "Choisis un nouveau mot de passe – RapidRemove", title: "Choisis un nouveau mot de passe", hi: "Bonjour,", p: "nous avons reçu une demande pour définir un nouveau mot de passe pour ton tableau de bord RapidRemove. Touche le bouton pour en choisir un nouveau.", btn: "Choisir un nouveau mot de passe", exp: "Le lien est valable 60 minutes et ne peut être utilisé qu'une seule fois.", ign: "Ce n'est pas toi ? Ignore simplement cet e-mail – ton mot de passe ne change pas." },
  it: { subj: "Imposta una nuova password – RapidRemove", title: "Imposta una nuova password", hi: "Ciao,", p: "abbiamo ricevuto una richiesta di impostare una nuova password per la tua dashboard RapidRemove. Tocca il pulsante per sceglierne una nuova.", btn: "Imposta nuova password", exp: "Il link è valido 60 minuti e può essere usato una sola volta.", ign: "Non l'hai richiesto tu? Ignora questa e-mail: la tua password resta invariata." },
  nl: { subj: "Nieuw wachtwoord instellen – RapidRemove", title: "Nieuw wachtwoord instellen", hi: "Hallo,", p: "we hebben een verzoek ontvangen om een nieuw wachtwoord in te stellen voor uw RapidRemove-dashboard. Tik op de knop om een nieuw wachtwoord te kiezen.", btn: "Nieuw wachtwoord instellen", exp: "De link is 60 minuten geldig en kan maar één keer worden gebruikt.", ign: "Niet aangevraagd? Negeer deze e-mail dan gewoon – uw wachtwoord blijft hetzelfde." },
  pt: { subj: "Define uma nova palavra-passe – RapidRemove", title: "Define uma nova palavra-passe", hi: "Olá,", p: "recebemos um pedido para definir uma nova palavra-passe para o teu painel RapidRemove. Toca no botão para escolheres uma nova.", btn: "Definir nova palavra-passe", exp: "O link é válido durante 60 minutos e só pode ser usado uma vez.", ign: "Não foste tu? Ignora este e-mail – a tua palavra-passe mantém-se." },
  ja: { subj: "新しいパスワードの設定 – RapidRemove", title: "新しいパスワードの設定", hi: "こんにちは。", p: "RapidRemove ダッシュボードの新しいパスワード設定のリクエストを受け付けました。下のボタンから新しいパスワードを設定してください。", btn: "新しいパスワードを設定", exp: "このリンクの有効期限は60分で、1回のみ使用できます。", ign: "お心当たりがない場合は、このメールを無視してください。パスワードは変更されません。" },
  sv: { subj: "Välj ett nytt lösenord – RapidRemove", title: "Välj ett nytt lösenord", hi: "Hej,", p: "vi har fått en begäran om att välja ett nytt lösenord för din RapidRemove-dashboard. Tryck på knappen för att välja ett nytt.", btn: "Välj nytt lösenord", exp: "Länken gäller i 60 minuter och kan bara användas en gång.", ign: "Var det inte du? Ignorera bara mejlet – ditt lösenord förblir detsamma." },
  da: { subj: "Vælg en ny adgangskode – RapidRemove", title: "Vælg en ny adgangskode", hi: "Hej,", p: "vi har modtaget en anmodning om at vælge en ny adgangskode til dit RapidRemove-dashboard. Tryk på knappen for at vælge en ny.", btn: "Vælg ny adgangskode", exp: "Linket er gyldigt i 60 minutter og kan kun bruges én gang.", ign: "Var det ikke dig? Så ignorer bare denne e-mail – din adgangskode forbliver den samme." },
  no: { subj: "Velg et nytt passord – RapidRemove", title: "Velg et nytt passord", hi: "Hei,", p: "vi har mottatt en forespørsel om å velge et nytt passord for RapidRemove-dashbordet ditt. Trykk på knappen for å velge et nytt.", btn: "Velg nytt passord", exp: "Lenken er gyldig i 60 minutter og kan bare brukes én gang.", ign: "Var det ikke deg? Bare ignorer denne e-posten – passordet ditt forblir det samme." },
};

export function resetLinkMail(lang: string, url: string): { subject: string; el: React.ReactElement } {
  const l = T[lang] ? lang : "en";
  const t = T[l];
  return {
    subject: t.subj,
    el: (
      <EmailShell preview={t.subj} title={t.title} lang={l as MailLang}>
        <P>{t.hi}</P>
        <P>{t.p}</P>
        <div style={{ textAlign: "center", margin: "8px 0 18px" }}><CtaButton href={url}>{t.btn}</CtaButton></div>
        <P muted>{t.exp}</P>
        <P muted>{t.ign}</P>
      </EmailShell>
    ),
  };
}
