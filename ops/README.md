# RapidRemove – Ops-Backend

Ersetzt **MailerSend + make.com**: transaktionale E-Mails (React Email, Versand
über **Microsoft 365 / Graph**), Automationen (Stripe-/OnePage-Webhooks),
sevDesk-Rechnungen, SMS, Affiliate – plus ein **Admin-Panel** für manuellen
Versand. Deploy auf **Railway** (eigenständig, getrennt von der Marketing-Site).

> Liegt als Unterordner `ops/` im RapidRemove-Repo, hat aber ein **eigenes**
> `package.json` und wird vom Next.js-Build der Website nicht angefasst.

## Status (Meilensteine)
- **M0 ✅ Gerüst** – Graph-Sender (`src/mailer.ts`), React-Email-Setup,
  erstes Template `Auftragsbestätigung`, Render-/Test-Skripte. *(dieser Stand)*
- M1 E-Mails komplett · M2 Admin-Panel · M3 Stripe↔sevDesk · M4 Datenhaltung ·
  M5 SMS/Affiliate · M6 Cutover (make.com + MailerSend aus).

## Lokal ausprobieren
```bash
cd ops
npm install
cp .env.example .env      # Werte eintragen (M365_*, MAIL_FROM)

npm run email:render      # -> out/auftragsbestaetigung.html (Vorschau im Browser)
npm run email:test -- du@example.com   # echte Test-Mail über M365
```

## Microsoft 365 (Graph) einrichten
Werte aus der bestehenden **Azure App-Registrierung** (Permission `Mail.Send`,
Admin-Consent) in `.env` bzw. als Railway-Variablen:
```
M365_TENANT_ID, M365_CLIENT_ID, M365_CLIENT_SECRET, MAIL_FROM
```
Hinweis: `M365_CLIENT_SECRET` ist der **Wert** des Geheimnisses (langer String),
nicht die Geheimnis-ID (GUID).

## Railway-Deploy
- **Root Directory:** `ops`
- **Variables:** `M365_*`, `MAIL_FROM` (später Stripe/sevDesk/DATABASE_URL)
- Build/Start richten wir mit dem Server (M1) ein; aktuell ist M0 skript-/CLI-basiert.
