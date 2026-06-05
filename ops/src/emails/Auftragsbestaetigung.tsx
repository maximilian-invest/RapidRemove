/* Template: Auftragsbestätigung (DE) — 1:1 nachgebaut aus der MailerSend-Vorlage. */
import * as React from "react";
import { EmailShell, P, NoteBox } from "./components";

export interface AuftragsbestaetigungProps {
  /** optionale persönliche Anrede, sonst formell */
  anrede?: string;
}

export function subject(_p: AuftragsbestaetigungProps = {}): string {
  return "Auftragsbestätigung – RapidRemove";
}

export default function Auftragsbestaetigung({ anrede }: AuftragsbestaetigungProps = {}) {
  return (
    <EmailShell
      preview="Vielen Dank für Ihren Auftrag – wir beginnen umgehend mit der Bearbeitung."
      title="Auftragsbestätigung ✓"
    >
      <P><strong>{anrede || "Sehr geehrte Damen und Herren,"}</strong></P>
      <P>vielen Dank für Ihren Auftrag. Wir <strong>beginnen umgehend</strong> mit der Bearbeitung.</P>

      <NoteBox>
        <strong>Wichtig — Anfrage zur Inhaberschaft:</strong> Unter Umständen erhalten Sie eine E-Mail
        von Google, in welcher wir die Bearbeitungsrechte des Profils anfordern. Bitte klicken Sie in
        dieser E-Mail auf „Antworten" und übertragen Sie die Rechte. Wir erhalten dadurch keinen
        Zugriff auf persönliche Daten oder andere Google-Dienste.
      </NoteBox>

      <P muted>
        Sie hören in Kürze wieder von uns. Bei Fragen antworten Sie einfach auf diese E-Mail – wir
        sind schnell für Sie da.
      </P>
    </EmailShell>
  );
}
