/* EN — google-maps-eintrag-loeschen */
const article = {
  category: "Google policy",
  meta: {
    slug: "delete-google-maps-listing",
    title: "Delete a Google Maps Listing: Own, Third-Party & Duplicate Entries (2026)",
    h1: "Delete a Google Maps Listing: Own, Third-Party & Duplicate Entries",
    description: "Delete a Google Maps listing – whether your own, a third-party, a wrong or a duplicate entry. Step-by-step guide, why the entry often stays, and how to have it removed permanently.",
    keywords: ["delete google maps listing", "remove google maps listing", "delete third party google maps listing", "delete wrong google maps entry", "remove business from google maps", "delete duplicate google listing"],
    author: "Matthias Lang",
    authorRole: "Google expert",
    date: "2026-06-04",
  },
  dek: "An outdated, wrong or duplicate listing on Google Maps can confuse customers and hurt your reputation. But removing it is trickier than many think: even if you delete everything from your account, **the listing often stays visible in Maps and in search.** This guide shows how to remove your own, third-party, wrong and duplicate Google Maps listings – and how permanent removal really works.",
  blocks: [
    { t: "note", title: "Note", text: "This article is a practical guide and not legal advice." },

    { t: "h2", id: "eigener", text: "Remove your own Google Maps listing", toc: "Your own listing" },
    { t: "p", text: "If you're the owner of the listing, you can detach it from your account:" },
    { t: "ol", items: [
      "Search Google for **“Your Business Profile”** and open the profile settings.",
      "Go via the **three-dot menu** to **“Remove business profile”**.",
      "Choose **“Remove profile content and managers”** and confirm.",
    ] },

    { t: "h2", id: "sichtbar", text: "Why the listing still stays visible", toc: "Why it stays" },
    { t: "p", text: "This is the crucial point Google deliberately obscures: removing it from your account does **not** mean the business disappears from Maps and search. It is merely detached from your account and usually marked as **“Permanently closed”**. The profile and reviews **remain**. In its terms of service, Google explicitly positions itself against the full deletion of business profiles – so a complete removal via your own account alone is practically impossible." },

    { t: "h2", id: "fremder", text: "Report a third-party or wrong listing", toc: "Third-party listing" },
    { t: "p", text: "For listings that aren't yours (e.g. a wrong or outdated entry), use the report function:" },
    { t: "ol", items: [
      "Open the listing in **Google Maps**.",
      "Click **“Suggest an edit”**.",
      "Choose **“Close or remove”**.",
      "Give the reason, e.g. **“Doesn't exist”** or **“Offensive, harmful or misleading”**.",
      "Save and wait for Google to review it.",
    ] },
    { t: "p", text: "If the suggestion is approved, the listing can be removed from search and Maps. Processing isn't guaranteed, however, and can take time." },

    { t: "h2", id: "doppelt", text: "Delete a duplicate Google listing", toc: "Duplicate listing" },
    { t: "p", text: "Duplicate listings often arise from moves, name changes or accidental multiple entries. Proceed like this:" },
    { t: "ol", items: [
      "Open the **duplicate** profile in Google Maps.",
      "Click **“Suggest an edit”** → **“Close or remove”**.",
      "Choose as the reason **“Duplicate of another place”** and save.",
    ] },
    { t: "warn", title: "Important", text: "Don't accidentally delete the **verified** listing – otherwise you'll have to re-verify it. If both listings already have reviews, don't delete them; instead have them **merged** via Google support so the reviews are preserved." },

    { t: "h2", id: "dauerhaft", text: "Permanent and complete removal", toc: "Permanent removal" },
    { t: "p", text: "If you want to remove a profile **completely and permanently** – including all reviews – from Google Maps and search, that's not possible via your own account. Here a specialist agency with technical removal helps:" },
    { t: "ul", items: [
      "**Efficient:** removal often within a maximum of 24 hours",
      "**Complete:** profile and reviews are fully removed",
      "**SEO-friendly:** your website and ranking stay untouched",
      "**Guaranteed:** if the profile reappears via third parties, it's removed for free",
    ] },
    { t: "cta", title: "Check for free whether your Maps listing can be removed.", text: "Enter your business name – we'll check in seconds whether and how fast your profile and all its reviews can be removed.", btn: "Check removability", href: "https://rapid-remove.com/", trust: ["Free analysis", "Guarantee", "No risk"] },
  ],
  faq: [
    { q: "How do I delete my own Google Maps listing?", a: "Via “Your Business Profile” → profile settings → three-dot menu → “Remove business profile” → “Remove profile content and managers”. Note: this only detaches the listing from your account, it doesn't remove it from Maps." },
    { q: "Why does my Google Maps listing stay visible after deleting?", a: "Because removing it from the account only marks the listing as “Permanently closed”. Profile and reviews remain in Maps and search. A complete removal is only possible via an agency." },
    { q: "How do I report a third-party or wrong listing?", a: "In Google Maps open the listing, “Suggest an edit” → “Close or remove”, give the reason (e.g. “Doesn't exist”) and save. Google reviews the suggestion." },
    { q: "How do I remove a duplicate Google listing?", a: "Open the duplicate in Maps, “Suggest an edit” → “Close or remove” → choose “Duplicate of another place”. If both listings have reviews, better have them merged via Google support." },
    { q: "Can I have a Google Maps listing permanently removed?", a: "Completely and permanently, including reviews, is only possible via a specialist agency, since Google doesn't provide for self-deletion. Technical removal often happens within 24 hours and with a guarantee." },
  ],
  related: [
    { label: "Delete Google Business Profile – how does it work?", url: "https://rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Remove Google reviews: costs & methods", url: "https://rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Report and remove a fake Google review", url: "https://rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Bad Google review – what to do?", url: "https://rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
