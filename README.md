# RapidRemove

Marketing site + cinematic check/order **wizard** for RapidRemove — a service that
removes unwanted Google Business Profiles (incl. all reviews) permanently and
legally, with payment only after successful removal.

This is a 1:1 implementation of the Claude Design prototype (`RapidRemove.html`),
rebuilt in **Next.js** (App Router) with the original high-fidelity motion design
preserved.

## Stack

- **Next.js 14** (App Router) · **React 18**
- Plain CSS design system (orange `#ff8000` on warm-white), no UI framework
- Fonts: **Plus Jakarta Sans** (display) + **Hanken Grotesk** (body) via Google Fonts

## What's inside

- **Homepage** — cinematic staggered hero with live "Gratis-Check" field, trust bar,
  problem cards, 3-step how-it-works, explainer video, comparison table,
  whole-profile-vs-single-review section, trust & security (No-Cure-No-Pay + team
  card), Trustpilot social proof with count-up stats, value-framed pricing, FAQ,
  final CTA, footer, sticky mobile CTA, WhatsApp float.
- **Wizard** — the conversion core: business-name → cinematic animated map lookup
  (search sweep → zoom → pin-drop → profile cards) → feasibility check → service +
  optional protection (opt-out warning) → checkout with dissolve-delete animation →
  thank-you / status pipeline.
- **Magazine / Blog** — authority layout (global #1 positioning, press band,
  count-up authority stats, article grid with category filter, global-presence
  visualization, newsletter).
- **i18n** — 7 languages (DE, EN, ES, FR, IT, NL, PT) with a scalable language menu;
  currency switches € (EU) / $ (non-EU). Persisted in `localStorage`.

### Motion

All original signature animations are preserved: hero entrance stagger,
`IntersectionObserver` scroll-reveals, `requestAnimationFrame` count-ups, the
animated map lookup (sweep / zoom / pin-drop), the dissolve-delete on order, the
status pipeline, floating proof cards, and micro-interactions. Everything respects
`prefers-reduced-motion`.

## Project structure

```
src/
  app/
    layout.jsx        # tokens + global styles, metadata, <html lang>
    page.jsx          # renders <App/>
  components/
    App.jsx           # routing (home | wizard | blog) + language context
    Chrome.jsx        # useReveal, CountUp, language menu, Nav, Footer, sticky CTA, WhatsApp
    Home.jsx          # all homepage sections
    Wizard.jsx        # the multi-step check/order flow
    Blog.jsx          # the magazine page
    Icons.jsx         # Lucide-style inline icon set
  lib/
    pricing.js        # currency-aware prices, money(), language registry
    i18n.jsx          # DE + EN content
    i18n-locales.jsx  # ES + FR
    i18n-locales2.jsx # IT + NL + PT
    lang-context.jsx  # React context + useLang()
  styles/             # colors_and_type · app · wizard · blog (the design system)
public/assets/        # brand logos + rocket icon
```

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```
