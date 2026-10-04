/* EN flagship/hub article: "Delete Google Business Profile" — the main English
   money keyword (the German flagship had no translation). Data-driven (MagArticle).

   SEO-Ausbau 4.10.2026 (GSC: 66,7K Impressionen / 90 Tage, Ø Pos. 13,4): Kurzantwort,
   Googles offizielle Schritte, Vergleichstabelle, eigene Abschnitte je Suchintention
   (what happens / start over / Google Maps / no delete option) + erweiterte FAQ.
   KERNBOTSCHAFT UNVERÄNDERT: „permanently closed" bzw. „aus dem Konto entfernen" ist
   kein Löschen — Profil und alle Bewertungen bleiben öffentlich; die vollständige
   Entfernung läuft über Googles offizielle Prozesse (RapidRemove). */
const article = {
  meta: {
    slug: "delete-google-business-profile",
    title: "How to Delete a Google Business Profile Permanently (2026)",
    h1: "How to Delete a Google Business Profile (Permanently)",
    description:
      "How to delete a Google Business Profile (formerly Google My Business): Google's official steps, why they leave the listing and all reviews online – and how to remove it for good.",
    author: "Maximilian Hölzl",
    authorRole: "Founder & reputation expert, RapidRemove",
    date: "2026-06-04",
    updated: "2026-10-04",
    // Eingebettetes Video → VideoObject im JSON-LD (Video-Rich-Results).
    video: {
      id: "B0PNEbAZWPQ",
      name: "Easy Way To Delete My Google Business Profile",
      description: "Zanet Design shows Google's official steps to remove a Google Business Profile – and why the business can still show up on Google afterwards.",
      uploadDate: "2022-11-21T07:00:10-08:00",
      duration: "PT4M35S",
    },
    keywords: [
      "delete google business profile",
      "how to delete google business profile",
      "remove google business profile",
      "delete google my business",
      "delete google business account",
      "remove business from google",
      "remove business from google maps",
      "delete google business profile permanently",
    ],
  },
  category: "Google policy",
  iconKey: "trash",
  readingMin: 13,
  dek: "“Permanently closed” is not the same as deleted – and neither is removing the profile from your account: your listing, name, address and every review stay visible on Google. This guide shows Google's official options, what each one really does, and what actually works to delete a Google Business Profile completely.",
  blocks: [
    { t: "note", title: "Note", text: "This guide is a practical overview and not legal advice. For binding advice on your situation, consult a qualified professional." },

    { t: "tip", title: "Short answer", text: "You can't simply delete a Google Business Profile. As the owner, Google only lets you **remove the profile from your account** (Business Profile settings → Remove Business Profile) or **mark the business as permanently closed**. In both cases the public listing and **all reviews stay on Google Search and Google Maps**. A complete removal of the listing – including every review – only works through Google's official removal processes. That is exactly what RapidRemove handles, with payment only after success." },

    { t: "h2", id: "why", text: "Why there is no simple “delete” button", toc: "No delete button" },
    { t: "p", text: "Search for how to delete a Google Business Profile and you quickly hit a wall. You can mark a business as **“permanently closed”** or remove it from your own account – but a clear button that says **“delete this listing and all its reviews”** does not exist for owners. That is not an oversight: Google treats the profile and its reviews as useful information for searchers and keeps control on its side. The profile describes a real place in the world – so in Google's view it doesn't belong to you, even if you manage it." },
    { t: "warn", title: "“Permanently closed” ≠ deleted", text: "Marking your business closed does **not** remove it. The listing, name, address, photos and **all reviews stay publicly visible** in Google Search and Google Maps – now with a struck-through “Permanently closed” label on top. To potential customers that often looks **worse** than before." },

    { t: "h2", id: "official-steps", text: "How to delete a Google Business Profile: Google's official steps", toc: "Official steps" },
    { t: "p", text: "In Google's own wording, the owner option is called **“Remove Business Profile”**. It exists – but it removes the profile from *your account*, not the listing from Google. Here is how it works, so you know exactly what you are (and aren't) doing." },
    { t: "h3", text: "On a computer (Google Search)" },
    { t: "ol", items: [
      "Sign in with the Google account that owns the profile and search for your business name (or “my business”).",
      "In your Business Profile, open **More** (⋮) → **Business Profile settings**.",
      "Select **Remove Business Profile** → **Remove profile content and managers**.",
      "Optionally tick **“Mark your business as permanently closed”**.",
      "Confirm with **Continue** → **Remove** → **Done**.",
    ] },
    { t: "h3", text: "In the Google Maps app" },
    { t: "p", text: "Open the Google Maps app with the owner account, go to your Business Profile and choose **More** → **Business Profile settings** → **Remove Business Profile**. The steps and the result are the same as on a computer." },
    { t: "h3", text: "Several profiles at once" },
    { t: "p", text: "If you manage multiple locations, open the **Business Profile Manager**, tick the profiles, then choose **Actions** → **Remove businesses** → **Remove**." },
    { t: "video", id: "B0PNEbAZWPQ", title: "Easy Way To Delete My Google Business Profile – Zanet Design", play: "Play video: how to delete a Google Business Profile", caption: "Prefer to watch? Zane from [Zanet Design](https://www.youtube.com/@ZanetDesign), one of the best-known Google Business Profile experts on YouTube, walks through Google's official removal steps. Watch the part at 03:48: **why your business still shows up on Google after deleting it.**" },
    { t: "warn", title: "What Google itself says happens next", text: "According to Google's own help pages, **customer reviews remain visible**, and the business **may still appear in Search and Maps**. Only *your* content is deleted: posts, photos you uploaded and your replies to reviews. Only the **primary owner** can do this, and new owners have to wait **7 days**. In short: the official option ends *your* management of the profile – it does not delete the profile." },

    { t: "h2", id: "options", text: "Delete, close, remove or disable: what each option really does", toc: "All options compared" },
    { t: "p", text: "People search for “delete my Google business account”, “close Google business”, “disable Google Business Profile” or “remove Google listing” – but on Google's side these are very different actions. This is what each one does to the public listing and its reviews:" },
    { t: "table", head: ["Option", "Where", "Public listing", "Reviews"], rows: [
      ["Remove Business Profile (from your account)", "Business Profile settings", "Stays online, now unmanaged", "Stay visible"],
      ["Mark as permanently closed", "Edit profile → opening status", "Stays online with a “Permanently closed” label", "Stay visible"],
      ["Mark as temporarily closed", "Edit profile → opening status", "Stays online, “Temporarily closed”", "Stay visible"],
      ["Delete your Google account", "Google account settings", "Stays online, becomes unclaimed", "Stay visible"],
      ["Suggest an edit → “Close or remove” (anyone)", "Google Maps / Search", "Google decides – frequently rejected", "Stay visible unless removed"],
      ["Full profile removal (RapidRemove)", "Google's official removal processes", "Removed from Search and Maps", "All removed with it"],
    ] },
    { t: "p", text: "One more source of confusion: **Google My Business** is simply the old name of **Google Business Profile**. Whether you call it your Google business account, page, listing or profile – it is the same entry, and the same rules apply." },

    { t: "h2", id: "what-happens", text: "What happens if you delete your Google Business account?", toc: "What happens after deleting" },
    { t: "p", text: "Many owners expect the listing to vanish once they remove it from their account. Here is what actually happens:" },
    { t: "ul", items: [
      "**Your access ends:** you and all managers lose control of the profile. To manage it again, it has to be claimed and verified from scratch.",
      "**Your content is gone:** posts, the photos you uploaded and your replies to reviews are permanently deleted and can't be restored.",
      "**The listing stays:** name, address, category and opening hours usually remain visible in Google Search and Google Maps.",
      "**The reviews stay:** every customer review – including fake or unfair ones – remains public, now **without your replies** next to them.",
      "**Anyone can edit it:** an unmanaged profile can be changed by users and by Google itself, and you no longer get notified.",
    ] },
    { t: "p", text: "That is why removing the profile from your account often makes things worse: the negative reviews are still there, but your side of the story is gone." },

    { t: "h2", id: "start-over", text: "Can I delete my Google Business Profile and start over?", toc: "Start over with a new profile" },
    { t: "p", text: "Not by simply creating a new one. If the old listing still exists – and after “Remove Business Profile” it does – Google sees a **second profile for the same business at the same address**. Duplicates are usually merged back into the old listing (reviews included) or the new profile gets suspended. Either way, the old reviews come back to haunt you." },
    { t: "p", text: "A real fresh start works in two steps: first the **old profile is removed completely**, including all reviews; then you create and verify a **clean new profile** if you want one. RapidRemove handles the first step – fixed price, payable only after success – and your website and search rankings stay untouched." },

    { t: "h2", id: "google-maps", text: "How to remove a business from Google Maps", toc: "Remove from Google Maps" },
    { t: "p", text: "On Google Maps, anyone – owner or not – can ask Google to close or remove a place:" },
    { t: "ol", items: [
      "Open the place in Google Maps or Google Search.",
      "Choose **Suggest an edit** → **Close or remove**.",
      "Pick a reason, for example permanently closed, doesn't exist, duplicate, or spam.",
      "Submit – Google reviews the suggestion and decides on its own.",
    ] },
    { t: "p", text: "For real, existing businesses these suggestions are usually rejected or turned into a “Permanently closed” label – the listing and its reviews remain. More on own, third-party and duplicate listings: [delete a Google Maps listing](/en/magazine/delete-google-maps-listing/) and [remove your company from Google](/en/magazine/remove-company-from-google/)." },

    { t: "h2", id: "no-delete-option", text: "Why you don't see a delete option", toc: "No delete option?" },
    { t: "p", text: "If “Remove Business Profile” is missing in your settings, it is almost always one of these reasons:" },
    { t: "ul", items: [
      "**You are a manager, not the primary owner.** Only the primary owner can remove profile content and managers.",
      "**You became owner recently.** New owners have to wait 7 days before the option becomes available.",
      "**The profile isn't verified or claimed by you.** Then it belongs to no one – or to another Google account.",
      "**You are signed in with the wrong Google account.** Many businesses have several; check which one owns the profile.",
    ] },
    { t: "p", text: "And even when you find the button, remember the result: it removes the profile from your account, not from Google." },

    { t: "h2", id: "how", text: "How a full profile removal actually works", toc: "How removal works" },
    { t: "p", text: "The only reliable way to make a profile and its reviews disappear is a **complete removal of the Business Profile** through Google's official processes – not deleting reviews one by one. When the whole profile is removed, **every review disappears with it**, including fake ones. It is the difference between treating symptoms and removing the cause." },
    { t: "p", text: "This is exactly what RapidRemove does. The key advantages:" },
    { t: "ul", items: [
      "**Speed:** profile removal typically in 24–48 hours instead of months",
      "**Complete:** the entire profile, including **all** reviews, in one go",
      "**Predictable:** a fixed price, payable **only after success** – no open hourly rates",
      "**No risk:** guarantee – if the profile reappears through third parties, it is removed again free of charge",
      "**SEO-friendly:** your website and rankings stay intact; a clean new profile is optional",
      "**Discreet:** no correspondence with reviewers, no Streisand risk",
    ] },
    { t: "warn", title: "Important", text: "Full removal deletes the **entire profile**, not a single review. If you only want one or a few reviews gone while keeping the profile, RapidRemove offers that too: [removal of individual reviews](/en/remove-single-reviews/) – $179 per removed review up to 4 weeks old (approx. 90 % success chance), +$50 for older ones (approx. 50 %), and you only pay for reviews that are actually removed." },

    { t: "cta", title: "See whether your profile can be removed – free.", text: "Enter your business name and see in seconds whether and how fast your profile and all its reviews can be removed.", btn: "Check removability", href: "https://www.rapid-remove.com/en/check-profile", trust: ["Free analysis", "Incl. guarantee", "No risk"] },

    { t: "h2", id: "single-vs-profile", text: "Single reviews vs. the whole profile", toc: "Reviews vs. profile" },
    { t: "p", text: "Many owners start by trying to **report** individual reviews. That is slow and uncertain: Google rejects many reports automatically, each review has to be justified separately, and new ones keep appearing. If your goal is to clear one or a few unfair reviews while keeping the profile, you don't have to go it alone: with our [single-review removal](/en/remove-single-reviews/) you tick the reviews that should go and pay only for those actually removed (details: [Google review removal service](/en/magazine/google-review-removal-service/)). All options compared: [have a Google review removed](/en/magazine/remove-google-reviews/). If the profile is damaged overall and you want a genuine fresh start, full profile removal is the more direct route." },

    { t: "h2", id: "cost", text: "What it costs", toc: "What it costs" },
    { t: "p", text: "Prices vary widely by provider type:" },
    { t: "table", head: ["Provider type", "Price range", "Success"], rows: [
      ["Cheap services", "$20 – 55 per review", "Highly variable"],
      ["Overseas services", "$55 – 110 per review", "Unclear"],
      ["Specialist lawyers (single review)", "$110 – 175 per review", "~90%, but slow"],
      ["Single-review removal (RapidRemove)", "$179 per removed review (+$50 if older than 4 weeks)", "~90% (≤ 4 weeks) / ~50% (older) – pay only if removed"],
      ["Profile removal (RapidRemove)", "Fixed price, payable after success", "All reviews gone – pay only on success"],
    ] },

    { t: "h2", id: "herkunft", text: "Who created this profile in the first place?", toc: "Where profiles come from" },
    { t: "p", text: "Most business owners who contact us never created their profile themselves — and are honestly surprised it exists at all. That isn't the exception; it's the rule. A Google Business Profile is rarely set up actively by the owner. Far more often, someone else adds it, or Google generates it completely automatically. To understand why such a listing is so hard to get rid of later, it helps to know how it got there in the first place. There are essentially three ways." },
    { t: "anim", caption: "Three ways a business profile comes into existence — usually without the owner lifting a finger." },
    { t: "h3", text: "Way 1: Someone adds the place by hand" },
    { t: "p", text: "Any Google user can tap an address or an empty spot in the Maps app and choose “Add a missing place.” That lets anyone list a business without having anything to do with it — customers, former employees, competitors, or particularly active Maps users (Local Guides)." },
    { t: "p", text: "It isn't entirely unchecked, though. Before a reported place goes live, an automatic review runs in the background:" },
    { t: "ul", items: [
      "**Location:** Is the user actually near the place they want to add? This stops someone in Berlin from inventing a café in Munich for a laugh.",
      "**Duplicate check:** Is there already a similar name or the same category at that coordinate or right next door?",
      "**Web cross-check:** Google searches for the name in parallel to see whether the business shows up online at all.",
    ] },
    { t: "p", text: "If the picture is consistent, the pin goes live — visible to everyone as an **unclaimed profile**." },
    { t: "h3", text: "Way 2: Google creates the profile itself from web data" },
    { t: "p", text: "This is the route few people expect: Google creates profiles in large numbers on its own — without the owner's involvement or consent. The reason is simple. Google wants to map the real world as completely as possible and doesn't wait for a new business to step forward." },
    { t: "p", text: "To do that, Google's crawlers continuously scan the web for so-called **NAP data** — Name, Address, Phone. From these fragments the system assembles a profile, triggered for example by:" },
    { t: "ul", items: [
      "**Structured data on the website:** If a company's site embeds the standardized **LocalBusiness** markup in its source code (machine-readable details per Schema.org), Google reads the address, phone number and opening hours cleanly and directly.",
      "**Digital footprints across the web:** Google combines details from Facebook pages, Instagram profiles, mentions in local media and entries in online phone directories.",
      "**Consistency matching:** When the same business with the same address shows up repeatedly and consistently — on its own website, on Facebook and in a local blog, say — Google automatically creates a new Maps listing from it.",
    ] },
    { t: "p", text: "Most owners only notice once they suddenly spot the “Claim this business” button on the map." },
    { t: "h3", text: "Way 3: Bulk import from official registries" },
    { t: "p", text: "The third route is often underestimated: Google ingests data at scale from official sources and from data aggregators it has agreements with." },
    { t: "ul", items: [
      "**Commercial and trade registries:** As soon as a business is registered with the trade office or in the commercial register, those details flow to Google at regular intervals — usually via intermediary databases.",
      "**Directories:** Google reconciles its maps with the Yellow Pages and the phone-book registries of each country. A new entry there can automatically trigger a new pin on Maps.",
    ] },
    { t: "p", text: "That's how a profile can appear shortly after you register your business — without you ever having gone to Google yourself." },
    { t: "p", text: "**Why this matters:** However the profile came about, the consequence is the same: once it exists, it collects reviews and shows up in Search and Maps. You don't have to have created it or manage it to be affected by it — which is exactly why simply ignoring it won't do. You still have to remove it actively." },

    { t: "cta", title: "Ready to remove your profile for good?", text: "Run the free removability check – in seconds, no obligation.", btn: "Start free check", href: "https://www.rapid-remove.com/en/check-profile", trust: ["Free analysis", "Incl. guarantee", "No risk"] },
  ],
  faq: [
    { q: "Can I delete my Google Business Profile myself?", a: "You can mark it “permanently closed” or remove it from your account, but neither deletes the public listing – it stays visible in Search and Maps with all its reviews. A complete removal goes through Google's official processes." },
    { q: "How do I delete my Google Business account permanently?", a: "In your Business Profile go to More → Business Profile settings → Remove Business Profile → Remove profile content and managers. This permanently ends your management and deletes your posts, photos and review replies – but the public listing and its reviews usually stay on Google. To delete the listing itself, it has to be removed through Google's official removal processes." },
    { q: "Is “permanently closed” the same as deleted?", a: "No. The listing, name, address and all reviews remain public; only a struck-through “Permanently closed” label is added. It often looks worse than before." },
    { q: "What happens if I delete my Google Business Profile?", a: "You lose access, and your posts, photos and replies to reviews are deleted. The listing itself, its reviews and its details usually stay visible in Google Search and Maps – and anyone can now suggest edits to it." },
    { q: "Can I delete my Google Business Profile and start over?", a: "Only if the old profile is removed completely first. A new profile for the same business at the same address is treated as a duplicate and is usually merged back into the old one – reviews included – or suspended." },
    { q: "How do I remove my business from Google Maps?", a: "Anyone can choose “Suggest an edit” → “Close or remove” on the place in Google Maps. Google decides on its own and, for real businesses, usually keeps the listing or only marks it as closed. A complete removal of the listing and its reviews goes through Google's official removal processes." },
    { q: "Why don't I see a delete option in my Business Profile?", a: "Usually because you are a manager rather than the primary owner, you became owner less than 7 days ago, the profile isn't verified under your account, or you are signed in with a different Google account." },
    { q: "Is Google My Business the same as Google Business Profile?", a: "Yes. Google My Business is the old name of Google Business Profile. Google business account, page, listing or profile all refer to the same entry." },
    { q: "How long does a full profile removal take?", a: "Typically 24–48 hours via professional removal, compared with the months a single-review legal route can take." },
    { q: "Will my website or rankings be affected?", a: "No. Removing the Business Profile does not touch your website, your Google account or your search rankings. A clean new profile can be set up afterwards if you wish." },
    { q: "Does removal include fake reviews?", a: "Yes. Because the entire profile is removed, every review disappears with it – including fake or unjustified ones." },
    { q: "What does it cost?", a: "RapidRemove works on a fixed price, payable only after success. Lawyers and most single-review providers charge per review, often upfront and without a guaranteed result. If you only need individual reviews removed, RapidRemove's [single-review removal](/en/remove-single-reviews/) costs $179 per removed review (+$50 if older than 4 weeks), with a volume discount from 3 reviews – charged only on success." },
  ],
};
export default article;
