# RapidRemove – Order Flow Documentation

This document describes the order lifecycle, data model, automatic processes, and webhook notifications.

## 1. Order Types (Services)

| Service Key | Label | Description |
|-------------|-------|-------------|
| `remove` | Profil entfernen | Full Google Business Profile removal |
| `reset` | Profil + Neustart | Profile removal + fresh restart |
| `express` | Express-Löschung | Expedited profile removal |
| `reviews` | Einzelne Bewertungen löschen | Single review removals |
| `deindex` | Presse auslisten | Press delisting (internal) |
| `orm` | Reputations-Audit | Reputation audit (internal) |

## 2. Order Statuses

### Database Statuses (`orders.status`)

| Status | Description |
|--------|-------------|
| `new` | Newly created, not yet processed |
| `progress` | In progress (being worked on) |
| `done` | Completed (profile/reviews removed) |
| `storniert` | Cancelled |

### Payment Statuses (`orders.pay`)

| Pay Status | Description |
|------------|-------------|
| `pending` | Payment not yet received |
| `sent` | Invoice/payment link sent |
| `mahnung` | Reminder sent |
| `paid` | Payment received |
| `refunded` | Refunded |
| `inkasso` | Sent to collections |
| `failed` | Payment attempt failed |

### Admin Display Buckets

The admin dashboard groups orders into display buckets (defined in `src/components/admin2/model.js`):

| Bucket | Label | Condition |
|--------|-------|-----------|
| `new` | Neu | `status='new'` |
| `work` | In Bearbeitung | `status='progress'` or working reviews |
| `nopm` | Pending | Waiting for customer action (payment method, reasons, owner verification) |
| `pay` | Zahlung offen | `status='done'` with open payment |
| `inkasso` | Inkasso | Done > 30 days without payment |
| `deleted` | Gelöscht | `status='done'` and `pay='paid'` |
| `cancel` | Storniert | `status='storniert'` |

**Note:** An order can appear in multiple buckets for reviews orders (e.g., "In Bearbeitung" + "Zahlung offen" simultaneously).

## 3. Order Creation

### 3.1 Website Checkout (`POST /order`)

**Location:** `ops/src/server.ts` (lines ~380-830)

**Flow:**
1. Customer completes the wizard on the website
2. `POST /order` receives order data
3. Order ID generated: `RR-XXXXXX` (6 random digits)
4. Order inserted into database with `status='new'`, `pay='pending'`
5. Customer confirmation email sent automatically
6. Internal notification sent to team (email + push)
7. For reviews: orders forwarded to partner board if auto-forwarding enabled
8. For profiles: NOT forwarded to partner by default (handled in-house)
9. Screenshots queued (background task)

**When does an order land in 'Neu' vs 'Pending'?**
- Order is **always created with `status='new'`**
- An order **immediately shows in 'Pending'** (bucket `nopm`) if:
  - Customer needs to provide reasons for each review (`reasons.status='pending'`)
  - Payment method gate is active (`payGate.status='pending'`)
  - Owner verification needed for 4-5 star reviews (`verify.status!='ok'`)
- If none of these apply, order stays in 'Neu' bucket

### 3.2 Admin Manual Creation (`POST /admin/orders/create`)

**Location:** `ops/src/server.ts` (lines ~838-950)

Same flow as website checkout, but:
- Created by admin (phone/WhatsApp orders)
- Can skip some customer-facing steps
- Still sends confirmation if enabled

## 4. Data Stored Per Order

### Core Fields (orders table)

```
id              TEXT PRIMARY KEY    -- e.g., "RR-123456"
created_at      TIMESTAMPTZ         -- Order creation time
name            TEXT                -- Customer name
email           TEXT                -- Customer email
phone           TEXT                -- Customer phone
company         TEXT                -- Business name
country         TEXT                -- Country code (DE, AT, US, etc.)
lang            TEXT                -- Language (de, en, es, fr, it, nl, pt, ja, sv, da, no)
profile         TEXT                -- Google profile name/URL
category        TEXT                -- Business category
rating          TEXT                -- Profile rating
reviews         INTEGER             -- Number of reviews
service         TEXT                -- Order type (remove, reset, reviews, etc.)
protection      TEXT                -- Protection plan (none, monthly, lifetime, monitor)
amount          NUMERIC             -- Service amount
prot_amount     NUMERIC             -- Protection amount
status          TEXT                -- Order status (new, progress, done, storniert)
pay             TEXT                -- Payment status
done_at         TIMESTAMPTZ         -- Completion timestamp
note            TEXT                -- Admin notes
check_id        TEXT                -- Link to profile check
assignee        TEXT                -- Assigned staff member (max, matthias)
raw             JSONB               -- Full order data from checkout
form            JSONB               -- Questionnaire responses
```

### Raw JSON Fields (`orders.raw`)

Key fields stored in the `raw` JSONB column:

- `mapsUri` – Google Maps URL
- `placeId` – Google Place ID
- `addr` – Business address
- `businessStatus` – e.g., "OPEN", "CLOSED_PERMANENTLY"
- `express` – Boolean, express order
- `expressAmount` – Express surcharge
- `payPref` – Payment preference (wise, paypal, none)
- `payMethod` – auto, link, paypal, invoice
- `payGate` – Payment method gate status
- `affiliate` / `fprRef` – Affiliate tracking
- `attribution` – Marketing attribution

**For reviews orders:**
- `reviewItems[]` – Array of review items:
  - `url` – Share link to review
  - `name` – Reviewer name
  - `text` – Review text
  - `rating` – Star rating (1-5)
  - `days` – Age in days
  - `old` – Boolean, older than 4 weeks
  - `nt` – Boolean, no text
  - `sw` – Boolean, requires software deletion
  - `lp` – List price (179 or 250; orders placed before 23 Oct 2026 keep 99)
  - `x` – Boolean, express
- `reviewsAccepted[]` – Reviews confirmed by customer
- `reviewsRemoved[]` – Removed reviews (for billing)
- `reviewsPaidKeys[]` – Paid review keys
- `reasons` – Per-review reasons status

## 5. Payment Methods

### How Payment Methods Are Attached

1. **Payment Gate (`payGate`)**: For automatic billing (reviews), customer must save a payment method in the dashboard before order starts
2. **PayPal/Wise preference**: Customer can choose at checkout for -10% discount
3. **Stripe payment links**: Generated and sent for one-time payments
4. **Auto-pay**: Saved card/PayPal in customer dashboard, charged automatically per deletion

### Payment Flow

1. Order created → `pay='pending'`
2. Invoice/link sent → `pay='sent'`
3. Payment received → `pay='paid'`
4. If overdue → `pay='mahnung'` after reminders
5. After 30 days → escalates to `inkasso`

## 6. Partner Forwarding

### Reviews Orders

**Location:** `ops/src/partner.ts` → `partnerAutoSend()`

- **Automatic forwarding**: Enabled by default (`autoReviews=true`)
- Reviews appear on partner board at `/partner`
- Each review becomes a task with code (RV-0001)
- Partner sets status: new → working → removed/not_possible/software

### Profile Orders (remove/reset/express)

**Location:** `ops/src/partner.ts` → `partnerAutoSendProfile()`

- **Automatic forwarding**: Disabled by default (`autoProfiles=false`)
- **Profile orders are handled in-house**: Team requests ownership of the Google Business Profile, customer transfers rights, then Google processes the deletion
- Can be enabled via Admin → Settings, but typically kept off

**Important:** This confirms the owner's statement – profile removal orders are NOT sent to the partner; they are handled internally.

## 7. Automatic Emails

### Order Confirmation (Sent Immediately)

| Template | Trigger | Description |
|----------|---------|-------------|
| `auftragsbestaetigung` | Profile order created | Order confirmation with AGB |
| `auftragsbestaetigung-reviews` | Reviews order created | Confirmation with billing rules |
| `presse-eingang` | Press inquiry | Acknowledgment of free check |

### Processing Emails

| Template | Trigger | Description |
|----------|---------|-------------|
| `bearbeitung-gestartet-reviews` | Admin sends manually | "Processing started" for reviews |
| `verifizieren` | Profile needs verification | Request to verify profile ownership |
| `rechte-benoetigt` | Access rights needed | Request ownership transfer |
| `keine-rechte` | No rights, extra charge | Extra charge consent request |

### Payment Emails

| Template | Trigger | Description |
|----------|---------|-------------|
| `zahlungslink` | Admin sends payment link | Stripe payment link |
| `mahnung` | Overdue payment | Payment reminder (profiles) |
| `mahnung-reviews` | Overdue payment | Payment reminder (reviews, 3 stages) |
| `loeschbestaetigung-reviews` | Reviews removed | Deletion confirmation + invoice |

### Status Update Emails

| Template | Trigger | Description |
|----------|---------|-------------|
| `KundenUpdateReviews` | Partner status change | Automatic status update to customer |
| `KundenSoftwareReviews` | Software deletion needed | Software method notification |
| `profil-wiedererschienen` | Monitor detects reappearance | Profile reappeared warning |

### Cancellation Emails

| Template | Trigger | Description |
|----------|---------|-------------|
| `storno` | Order cancelled (not possible) | Cancellation notice |
| `kundenstorno` | Customer requested | Customer-initiated cancellation |
| `storno-reviews` | Some reviews cancelled | Partial reviews cancellation |

## 8. Status Transitions

```
                    ┌──────────────────┐
                    │    ORDER CREATED │
                    │   status='new'   │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌───────────┐      ┌───────────┐      ┌───────────────┐
   │ Pending   │      │ Neu       │      │ Storniert     │
   │ (waiting) │      │ (ready)   │      │ (cancelled)   │
   └─────┬─────┘      └─────┬─────┘      └───────────────┘
         │                  │
         │  Customer        │  Admin/Auto
         │  completes       │  starts work
         │  requirements    │
         ▼                  ▼
   ┌─────────────────────────────┐
   │      In Bearbeitung         │
   │      status='progress'      │
   └─────────────┬───────────────┘
                 │
                 │  Work completed
                 ▼
   ┌─────────────────────────────┐
   │         Done/Gelöscht       │
   │      status='done'          │
   └─────────────┬───────────────┘
                 │
         ┌───────┴───────┐
         ▼               ▼
   ┌───────────┐   ┌───────────┐
   │ Zahlung   │   │ Gelöscht  │
   │ offen     │   │ (paid)    │
   └───────────┘   └───────────┘
```

## 9. Webhook Notifications

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GROKBOT_ORDER_WEBHOOK_URL` | Webhook endpoint URL |
| `GROKBOT_ORDER_WEBHOOK_AUTH` | Full Authorization header value |

### Events

| Event | Trigger |
|-------|---------|
| `order.created` | New order inserted into database |

### Payload

```json
{
  "event": "order.created",
  "timestamp": "2026-10-23T12:34:56.789Z",
  "order": {
    "id": "RR-123456",
    "status": "new",
    "orderType": "profile_removal",
    "service": "remove",
    "businessName": "Example Business GmbH",
    "googleProfileUrl": "https://maps.app.goo.gl/...",
    "placeId": "ChIJ...",
    "mapsLink": "https://www.google.com/maps/place/...",
    "reviewLinks": [],
    "customer": {
      "name": "Max Mustermann",
      "email": "max@example.com",
      "country": "AT"
    },
    "amount": 450,
    "currency": "EUR",
    "createdAt": "2026-10-23T12:34:56.789Z"
  }
}
```

### Behavior

- Fire-and-forget: Does not block the order flow
- Short timeout (5 seconds)
- Errors are logged but do not affect the order
- If env vars are missing, webhook is silently skipped

---

## Observations and Notes

1. **Orders always start with `status='new'`** – the "Pending" bucket is a display-layer concept based on whether customer action is required.

2. **Profile orders vs Reviews orders have different flows:**
   - Reviews: Forwarded to partner, billed per deletion
   - Profiles: Handled in-house, billed on completion

3. **The `raw` JSONB field is the source of truth** for many order details that don't have dedicated columns.

4. **Partner forwarding for profiles is disabled by default** – this matches the stated business process where profile removals involve requesting ownership from the customer.
