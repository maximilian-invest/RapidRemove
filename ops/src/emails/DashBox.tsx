/* Kunden-Dashboard in den Bewertungs-Mails: Box mit Zugangsdaten (Auftragsbestätigung)
   bzw. „Dashboard öffnen"-Button (Status-Mails) + eigene Mail „neues Passwort". */
import * as React from "react";
import { EmailShell, P, NoteBox, CtaButton, brand, type MailLang } from "./components";

export interface DashInfo { url: string; email?: string; password?: string; existing?: boolean }

interface L { h: string; p: string; login: string; pw: string; existing: string; btn: string; resetSubj: string; resetTitle: string; resetP: string; hi: string }
export const DASH_L: Record<string, L> = {
  en: { h: "Your personal dashboard", p: "Follow every review live – status, removals and payments – in your dashboard. We'll also email you whenever something changes.", login: "Login", pw: "Password", existing: "Log in with your existing password (forgot it? You can request a new one on the login page).", btn: "Open my dashboard", resetSubj: "Your new password for the RapidRemove dashboard", resetTitle: "New password", resetP: "here is your new password for your RapidRemove dashboard:", hi: "Hi," },
  es: { h: "Tu panel personal", p: "Sigue cada reseña en directo –estado, eliminaciones y pagos– en tu panel. Además te avisamos por correo cuando cambie algo.", login: "Usuario", pw: "Contraseña", existing: "Entra con tu contraseña actual (¿la olvidaste? Puedes pedir una nueva en la página de acceso).", btn: "Abrir mi panel", resetSubj: "Tu nueva contraseña del panel de RapidRemove", resetTitle: "Nueva contraseña", resetP: "esta es tu nueva contraseña para el panel de RapidRemove:", hi: "Hola:" },
  fr: { h: "Ton tableau de bord", p: "Suis chaque avis en direct – statut, suppressions et paiements – dans ton tableau de bord. Nous t'écrivons aussi dès que quelque chose change.", login: "Identifiant", pw: "Mot de passe", existing: "Connecte-toi avec ton mot de passe actuel (oublié ? Tu peux en demander un nouveau sur la page de connexion).", btn: "Ouvrir mon tableau de bord", resetSubj: "Ton nouveau mot de passe pour le tableau de bord RapidRemove", resetTitle: "Nouveau mot de passe", resetP: "voici ton nouveau mot de passe pour ton tableau de bord RapidRemove :", hi: "Bonjour," },
  it: { h: "La tua dashboard", p: "Segui ogni recensione in tempo reale – stato, rimozioni e pagamenti – nella tua dashboard. Ti avvisiamo anche via e-mail quando cambia qualcosa.", login: "Accesso", pw: "Password", existing: "Accedi con la tua password attuale (dimenticata? Puoi richiederne una nuova nella pagina di accesso).", btn: "Apri la mia dashboard", resetSubj: "La tua nuova password per la dashboard RapidRemove", resetTitle: "Nuova password", resetP: "ecco la tua nuova password per la dashboard RapidRemove:", hi: "Ciao," },
  nl: { h: "Uw persoonlijke dashboard", p: "Volg elke review live – status, verwijderingen en betalingen – in uw dashboard. We mailen u ook zodra er iets verandert.", login: "Login", pw: "Wachtwoord", existing: "Log in met uw bestaande wachtwoord (vergeten? Op de inlogpagina kunt u een nieuw aanvragen).", btn: "Mijn dashboard openen", resetSubj: "Uw nieuwe wachtwoord voor het RapidRemove-dashboard", resetTitle: "Nieuw wachtwoord", resetP: "hier is uw nieuwe wachtwoord voor uw RapidRemove-dashboard:", hi: "Hallo," },
  pt: { h: "O teu painel pessoal", p: "Acompanha cada avaliação em tempo real – estado, remoções e pagamentos – no teu painel. Também te avisamos por e-mail sempre que algo mudar.", login: "Acesso", pw: "Palavra-passe", existing: "Entra com a tua palavra-passe atual (esqueceste-a? Podes pedir uma nova na página de acesso).", btn: "Abrir o meu painel", resetSubj: "A tua nova palavra-passe do painel RapidRemove", resetTitle: "Nova palavra-passe", resetP: "aqui está a tua nova palavra-passe para o painel RapidRemove:", hi: "Olá," },
  ja: { h: "お客様専用ダッシュボード", p: "各口コミの状況・削除・お支払いをダッシュボードでいつでも確認できます。変更があった場合はメールでもお知らせします。", login: "ログインID", pw: "パスワード", existing: "既存のパスワードでログインしてください（お忘れの場合はログイン画面から再発行できます）。", btn: "ダッシュボードを開く", resetSubj: "RapidRemoveダッシュボードの新しいパスワード", resetTitle: "新しいパスワード", resetP: "RapidRemoveダッシュボードの新しいパスワードはこちらです：", hi: "こんにちは。" },
  sv: { h: "Din personliga dashboard", p: "Följ varje omdöme live – status, borttagningar och betalningar – i din dashboard. Vi mejlar dig också så fort något ändras.", login: "Inloggning", pw: "Lösenord", existing: "Logga in med ditt befintliga lösenord (glömt det? Du kan begära ett nytt på inloggningssidan).", btn: "Öppna min dashboard", resetSubj: "Ditt nya lösenord till RapidRemove-dashboarden", resetTitle: "Nytt lösenord", resetP: "här är ditt nya lösenord till din RapidRemove-dashboard:", hi: "Hej," },
  da: { h: "Dit personlige dashboard", p: "Følg hver anmeldelse live – status, fjernelser og betalinger – i dit dashboard. Vi mailer dig også, så snart noget ændrer sig.", login: "Login", pw: "Adgangskode", existing: "Log ind med din nuværende adgangskode (glemt den? Du kan bede om en ny på login-siden).", btn: "Åbn mit dashboard", resetSubj: "Din nye adgangskode til RapidRemove-dashboardet", resetTitle: "Ny adgangskode", resetP: "her er din nye adgangskode til dit RapidRemove-dashboard:", hi: "Hej," },
  no: { h: "Ditt personlige dashbord", p: "Følg hver omtale live – status, fjerninger og betalinger – i dashbordet ditt. Vi sender deg også e-post så snart noe endrer seg.", login: "Innlogging", pw: "Passord", existing: "Logg inn med passordet du allerede har (glemt det? Du kan be om et nytt på innloggingssiden).", btn: "Åpne dashbordet mitt", resetSubj: "Ditt nye passord til RapidRemove-dashbordet", resetTitle: "Nytt passord", resetP: "her er det nye passordet ditt til RapidRemove-dashbordet:", hi: "Hei," },
};
const lOf = (lang?: string) => DASH_L[lang && lang !== "de" ? lang : "en"] || DASH_L.en;

/** Box mit Zugangsdaten (beim Anlegen) bzw. Hinweis aufs bestehende Konto + Button. */
export function DashBox({ lang, dash }: { lang?: string; dash?: DashInfo }) {
  if (!dash || !dash.url) return null;
  const l = lOf(lang);
  return (
    <NoteBox>
      <span style={{ color: brand.tintText, fontWeight: 700 }}>{l.h}</span><br />
      {l.p}
      {dash.password ? (
        <React.Fragment>
          <br /><br />{l.login}: <strong>{dash.email}</strong><br />
          {l.pw}: <strong style={{ fontFamily: "monospace", fontSize: 15 }}>{dash.password}</strong>
        </React.Fragment>
      ) : dash.existing ? <React.Fragment><br /><br />{l.existing}</React.Fragment> : null}
      <span style={{ display: "block", textAlign: "center", marginTop: 14 }}><CtaButton href={dash.url}>{l.btn}</CtaButton></span>
    </NoteBox>
  );
}

/** Nur der Button (Status-Mails). */
export function DashButton({ lang, url }: { lang?: string; url?: string }) {
  if (!url) return null;
  return <div style={{ textAlign: "center", margin: "8px 0 18px" }}><CtaButton href={url} variant="secondary">{lOf(lang).btn}</CtaButton></div>;
}

export function resetMail(lang: string, email: string, password: string, url: string): { subject: string; el: React.ReactElement } {
  const l = lOf(lang);
  const ml = (lang && lang !== "de" ? lang : "en") as MailLang;
  return {
    subject: l.resetSubj,
    el: (
      <EmailShell preview={l.resetSubj} title={l.resetTitle} lang={ml}>
        <P>{l.hi}</P>
        <P>{l.resetP}</P>
        <P>{l.login}: <strong>{email}</strong><br />{l.pw}: <strong style={{ fontFamily: "monospace", fontSize: 16 }}>{password}</strong></P>
        <div style={{ textAlign: "center", margin: "8px 0 18px" }}><CtaButton href={url}>{l.btn}</CtaButton></div>
      </EmailShell>
    ),
  };
}
