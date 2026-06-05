# RapidRemove – Ops-Backend

Ersetzt **MailerSend + make.com**: transaktionale E-Mails (React Email, Versand
über **Microsoft 365 / Graph**), Automationen (Stripe-/OnePage-Webhooks),
sevDesk-Rechnungen, SMS, Affiliate – plus ein **Admin-Panel**. Deploy auf
**Railway** (eigenständig, getrennt von der Marketing-Site).

> Liegt als Unterordner `ops/` im RapidRemove-Repo, hat aber ein **eigenes**
> `package.json` und wird vom Next.js-Build der Website nicht angefasst.

## Status (Meilensteine)
- **M0 ✅** Gerüst + Graph-Sender + erstes Template (validiert: echte Mail über M365).
- **M1 ⏳** Alle ~16 Templates + Vorschau-Server + Auto-Flows (Stripe/OnePage).
  *Aktuell:* Vorschau-Server, Registry, Templates `Auftragsbestätigung` + `Zahlungslink`.
- M2 Admin-Panel · M3 Stripe↔sevDesk · M4 Datenhaltung · M5 SMS/Affiliate · M6 Cutover.

## Im Browser ansehen (empfohlen – kein Terminal nötig, sobald auf Railway)
- `GET /`               → Liste aller Templates
- `GET /preview/:key`   → fertige Mail im Browser (`?lang=de|en`)
- `GET /send-test?key=zahlungslink&to=du@mail.de&token=ADMIN_TOKEN` → echte Test-Mail
- `GET /health`         → Statuscheck

## Lokal
```bash
cd ops
npm install
cp .env.example .env        # M365_*, MAIL_FROM, ADMIN_TOKEN eintragen
npm start                   # Server auf http://localhost:3000

# oder ohne Server:
npm run email:render -- zahlungslink          # -> out/zahlungslink.html
npm run email:test   -- du@mail.de zahlungslink   # echte Mail
```

## Railway-Deploy
- **Root Directory:** `ops`
- **Start Command:** `npm start`  (Build: `npm install`)
- **Variables:** `M365_TENANT_ID`, `M365_CLIENT_ID`, `M365_CLIENT_SECRET`,
  `MAIL_FROM`, `ADMIN_TOKEN` (später `STRIPE_*`, `SEVDESK_*`, `DATABASE_URL`)
- `PORT` setzt Railway automatisch.

## Microsoft 365 (Graph)
Werte aus der bestehenden Azure App-Registrierung (Permission `Mail.Send`,
Admin-Consent). `M365_CLIENT_SECRET` = der **Wert** des Geheimnisses (langer
String), nicht die Geheimnis-ID.
