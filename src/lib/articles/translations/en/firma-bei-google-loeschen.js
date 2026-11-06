/* EN — firma-bei-google-loeschen ("Remove your business from Google").

   SEO rebuild 6.11.2026 for Google USA, mirroring the rebuilt German article:
   short answer, Google's official steps, Google Business account ≠ Business Profile ≠
   listing, "permanently closed", previous owner's / someone else's business, special
   cases (closed, sold, moved, renamed, retired), start fresh, comparison table,
   "have it removed" + limits, extended FAQ.
   Target cluster (GSC USA): remove (my) business from google · delete business from
   google · delete / remove / close / cancel google business account · delete google
   business page · close google my business · remove company from google.
   Distinct from the EN hub (delete-google-business-profile) — link to it with the
   anchor "delete a Google Business Profile".

   WORDING: owner's binding wording rules apply (duration only "usually about 24 hours
   after the ownership transfer" + verification note, removal "on behalf of the owner,
   through the procedures Google provides", prices excl. VAT, no single "*" in text —
   inline() renders *x* as italics).

   related: resolveRelated() (catalog.js) resolves German article keys (flagship key =
   FLAGSHIP_SLUG) to the localized /en/magazine/<slug> path. */
const article = {
  category: "Google policy",
  meta: {
    slug: "remove-company-from-google",
    title: "How to Remove Your Business from Google (2026 Guide)",
    h1: "How to Remove Your Business from Google: Delete or Close Your Google Business Account, Page & Listing (2026)",
    description:
      "Google has no delete button for your business. Official steps to remove, delete or close your Google Business account – and how the listing goes for good.",
    keywords: [
      "remove business from google",
      "how to remove business from google",
      "how to remove a business from google",
      "how do i remove my business from google",
      "how to remove my business from google",
      "how to delete business on google",
      "how to delete business from google",
      "how do i delete my business from google",
      "delete business from google",
      "how to delete google business account",
      "how to delete a google business account",
      "how do i delete my google business account",
      "delete my google business account",
      "delete google business account",
      "remove google business account",
      "close google business account",
      "how to close a google business account",
      "how to close google business account",
      "how to close google my business",
      "how to cancel google business account",
      "delete google business page",
      "how to delete a google business page",
      "remove company from google",
    ],
    author: "Maximilian Hölzl",
    authorRole: "Google Expert",
    date: "2026-06-04",
    updated: "2026-11-06",
  },
  dek: "“Remove my business from Google” sounds like a one-click job – but Google has no delete button. Here are Google's official steps to remove, delete or close your Google Business account, what stays visible afterwards, why deleting your Google account doesn't delete your business listing – and how to have the listing removed completely.",
  blocks: [
    { t: "tip", title: "Short answer", text: "Google has **no button that deletes your business**. As the owner, you can only remove your own access (**“Remove profile content and managers”**) or mark the business **“permanently closed”**. Either way, **the listing and all its reviews stay visible** on Google Search and Google Maps. **Deleting your Google account or your Google Business account doesn't delete the listing either** – it just leaves it unclaimed. Complete removal of the listing, including every review, is handled by RapidRemove **on behalf of the owner, through the procedures Google provides** – and you pay only after the listing has been removed." },
    { t: "note", title: "Note", text: "This article is a practical overview, not legal advice." },

    { t: "h2", id: "official-steps", text: "How to remove your business from Google: the official steps", toc: "Official steps" },
    { t: "p", text: "When people say “remove my business from Google”, “delete my business on Google” or “delete my Google business page”, they almost always mean their **Google Business Profile** (formerly **Google My Business**): the listing with your name, address, hours, photos and reviews. Google calls the owner option **“Remove Business Profile”**. Here's how to find it:" },
    { t: "h3", text: "On a computer (Google Search)" },
    { t: "ol", items: [
      "Sign in with the Google account that owns the profile and search for your business name.",
      "In your Business Profile, click **⋮ More** → **Business Profile settings**.",
      "Choose **Remove Business Profile** → **Remove profile content and managers**.",
      "Optionally tick the box to mark your business as permanently closed.",
      "Confirm with **Continue** → **Remove**.",
    ] },
    { t: "h3", text: "In the Google Maps app" },
    { t: "p", text: "Open the Google Maps app with the owner account, go to your Business Profile and tap **More** → **Business Profile settings** → **Remove Business Profile**. The steps and the result are the same as on a computer." },
    { t: "h3", text: "Multiple locations and business groups" },
    { t: "p", text: "If you manage several locations, open the **Business Profile Manager**, tick the locations, then choose **Actions** → **Remove businesses** → **Remove**. If your locations sit in a **business group** (formerly “location group”), deleting the group itself removes no listing – each location has to be removed or transferred on its own." },
    { t: "warn", title: "What actually happens afterwards", text: "According to Google's own help pages, **reviews remain visible** and the business **may still appear in Search and Maps**. Only **your** content is deleted: posts, photos you uploaded and your replies to reviews. In short: you lose control of the profile – the listing stays." },
    { t: "ul", items: [
      "**Your access ends:** you and all managers lose control. To manage the profile again, it has to be claimed and verified from scratch.",
      "**The listing stays:** name, address, category and hours usually remain on Google.",
      "**The reviews stay:** including unfair or fake ones – now **without your replies** next to them.",
      "**Anyone can edit it:** an unclaimed listing can be changed by users and by Google, and you no longer get notified.",
    ] },
    { t: "h3", text: "Can't find “Remove Business Profile”?" },
    { t: "p", text: "Then you are usually a **manager instead of the primary owner**, you became the owner only recently (Google makes new owners wait about 7 days), you're signed in with the **wrong Google account** – or you never claimed the profile. All reasons and fixes are in our guide on how to [delete a Google Business Profile](/en/magazine/delete-google-business-profile)." },

    { t: "cta", title: "Can your business listing be removed completely?", text: "Enter your business name – we find your Google listing and check for free whether complete removal, including all reviews, is possible.", btn: "Start free check", href: "/en/check-profile", trust: ["Free check", "No passwords needed", "Pay only after removal"] },

    { t: "h2", id: "account-vs-listing", text: "Google Business account vs. Business Profile vs. listing", toc: "Account vs. listing" },
    { t: "p", text: "People who search “delete my Google Business account”, “cancel my Google Business account” or “remove my Google Business account” often mean three different things – and this is where most of the confusion comes from:" },
    { t: "ul", items: [
      "**The Google account** is an ordinary Google account (often a business Gmail address) that you use to manage the profile. There is no separate “Google Business account” with its own delete button.",
      "**The Business Profile** is the management side: owners and managers, posts, photos you uploaded, your replies to reviews. This is what “Remove Business Profile” ends.",
      "**The listing** is the public entry on Google Search and Google Maps. It exists independently of your account – Google treats it as information about a real place.",
    ] },
    { t: "warn", title: "Deleted your Google account – business still on Google?", text: "Yes, that's normal. **When you delete your Google account, your business listing stays online** – with all its reviews. It's just **unclaimed** from then on: you have no access anymore, and anyone can request ownership or suggest edits." },
    { t: "p", text: "The same applies to **Google Workspace** (formerly G Suite): cancel Workspace and your email, Drive and so on stop – your Business Profile is not affected. If the profile is tied to a Workspace address, you lose access to it, not the public listing. Closing your **Google Ads** or **Local Services Ads** account stops your ads; your free listing on Search and Maps stays exactly as it is." },
    { t: "h3", text: "The right order of steps" },
    { t: "ol", items: [
      "**Decide what happens to the listing first:** remove it, mark it closed, or transfer it to a buyer or successor.",
      "**Sort out owners and managers:** transfer primary ownership or remove other users, so nobody is left with access you didn't intend.",
      "**Close linked services:** Google Ads, Local Services Ads, Workspace – if you no longer need them.",
      "**Delete the Google account last** (Google Account → Data & privacy → Delete your Google Account) – and only if you really want Gmail, Drive and everything else gone too.",
    ] },
    { t: "tip", title: "Why the order matters", text: "If you delete the Google account first, you lose access to a listing that is still online – and getting control back means claiming and verifying it all over again." },

    { t: "h2", id: "close", text: "How to close your Google Business account or page", toc: "Close your business" },
    { t: "p", text: "Many owners “close” their Google business page and expect it to disappear. In your Business Profile, go to **Edit profile** → **Hours** (opening status) → **Permanently closed** → **Save**. Here's what that does – and doesn't do:" },
    { t: "ul", items: [
      "**Permanently closed:** the listing stays with name, address, photos and **all reviews**, now with a “Permanently closed” label that customers see in Search and Maps.",
      "**Temporarily closed:** meant for breaks only (renovation, vacation, seasonal business). Customers see “Temporarily closed”; visibility barely changes.",
      "**No deletion date:** according to Google, a closed listing is shown **less often over time** – Google gives no fixed deadline after which it disappears.",
      "**Brand searches:** anyone searching for your business name often still finds the closed listing – frequently for years.",
    ] },
    { t: "p", text: "For owners this means: the reviews stay attached to your business name and show up whenever someone looks you up – even if you've long moved on to something else." },

    { t: "h2", id: "previous-owner", text: "How to remove a previous owner's or someone else's business", toc: "Previous owner's business" },
    { t: "p", text: "If your address still shows the previous tenant's business, a listing someone else created, or an old company that was dissolved long ago, you can ask Google to remove it – anyone can, no ownership needed:" },
    { t: "ol", items: [
      "Open the listing in Google Maps or Google Search.",
      "Choose **Suggest an edit** → **Close or remove**.",
      "Pick the matching reason, e.g. permanently closed, doesn't exist, moved, duplicate or spam.",
      "Submit – Google reviews the suggestion and **decides on its own**.",
    ] },
    { t: "p", text: "For real businesses that once existed, such a suggestion is often only turned into a “Permanently closed” label; the listing and reviews remain. If the old business is **yours**, claim ownership first and then decide what happens to it. If it's a duplicate of your current business, have the two merged rather than deleting in a hurry. More on own, third-party and duplicate listings: how to [remove a business from Google Maps](/en/magazine/delete-google-maps-listing)." },
    { t: "warn", title: "No competitors' listings", text: "We don't remove listings of other, existing businesses – not even on request. RapidRemove works exclusively on behalf of the respective owner." },

    { t: "h2", id: "situations", text: "Business closed, sold, moved, renamed or retired: what to do", toc: "Closed, sold, moved & more" },
    { t: "p", text: "Whether you should remove your business from Google depends on why it no longer exists in its current form:" },
    { t: "h3", text: "Closed, bankrupt or retired" },
    { t: "p", text: "This is where most owners really want the listing gone – especially when reviews would otherwise stay attached to their name. “Permanently closed” is the free minimum, but the listing stays visible. If you want a clean break, have the listing removed completely, reviews included." },
    { t: "h3", text: "Sold or handed over" },
    { t: "p", text: "Then **don't delete** – **transfer ownership to the buyer**: add the buyer as an owner, make them primary owner, then remove yourself. The listing and its reviews belong to the location and are often worth real money to the new owner. Removal only makes sense if both sides deliberately want a fresh start." },
    { t: "h3", text: "Moved to a new address" },
    { t: "p", text: "Change the **address in your existing profile** instead of deleting it. Google may ask you to verify again; your reviews move with you. A second profile at the new address can trigger a duplicate that Google merges or suspends." },
    { t: "h3", text: "Renamed or new business entity" },
    { t: "p", text: "A new name, or switching from sole proprietorship to an LLC or corporation, is no reason to delete: **update the name in your profile** and re-verify if asked – reviews and visibility stay. If the rebrand is meant to be a fresh start without the old reviews, starting over is the right route (see below)." },

    { t: "h2", id: "start-over", text: "Delete or start fresh?", toc: "Delete or start fresh" },
    { t: "p", text: "Simply creating a second profile doesn't work while the old listing exists: Google detects **two profiles for the same business at the same address** and usually merges them back together – old reviews included – or suspends the new one. A real fresh start therefore needs the old listing removed completely first. After that, you have two options:" },
    { t: "ul", items: [
      "**Create it yourself:** after the removal (from $495 excl. VAT), wait **at least 48 hours**, then create and verify a new Business Profile yourself.",
      "**Fresh start package:** removal plus a newly created profile for **from $950 excl. VAT** – you start over with a clean listing and **0 reviews**.",
    ] },
    { t: "warn", title: "To be honest", text: "Your **good reviews and photos** disappear along with the old listing. If you have mostly positive reviews and just one or two outliers, think carefully about whether a complete restart is the right move." },

    { t: "h2", id: "comparison", text: "Every option compared", toc: "Comparison" },
    { t: "p", text: "“Remove business from Google”, “close Google business account”, “delete Google account” – on Google's side these are very different actions. Here's what each one does to the public listing:" },
    { t: "table", head: ["Option", "Listing still visible?", "Reviews", "Effort"], rows: [
      ["Remove Business Profile (profile content and managers)", "Yes, now unmanaged", "Stay visible", "A few minutes"],
      ["Mark as “permanently closed”", "Yes, with a “Permanently closed” label", "Stay visible", "A few minutes"],
      ["Mark as “temporarily closed”", "Yes, with a “Temporarily closed” label", "Stay visible", "A few minutes"],
      ["Delete your Google account / Google Business account", "Yes, listing becomes unclaimed", "Stay visible", "A few minutes, access gone afterwards"],
      ["Cancel Google Workspace or Google Ads", "Yes, unchanged", "Stay visible", "Low"],
      ["Suggest an edit → Close or remove", "Google decides, usually yes", "Usually stay visible", "Low, outcome uncertain"],
      ["**Complete removal with RapidRemove**", "**No – removed from Search and Maps**", "**All removed with it**", "**Free check + ownership transfer, pay only after removal**"],
    ] },
    { t: "p", text: "The comparison shows it: every option you can take yourself changes your access or a label – none of them removes the listing itself." },

    { t: "cta", title: "Want your business listing removed, reviews and all?", text: "Start the free check: we look at your listing and tell you whether removal is possible – no obligation.", btn: "Check my listing", href: "/en/check-profile", trust: ["Free check", "No passwords needed", "Pay only after removal"] },

    { t: "h2", id: "have-it-removed", text: "Have your business removed from Google", toc: "Have it removed" },
    { t: "p", text: "If your business listing really needs to go, RapidRemove removes the **entire Google listing, including all reviews** – **on behalf of the owner, through the procedures Google provides**. Here's how it works:" },
    { t: "ol", items: [
      "**Free check:** enter your business name, we find your listing and check whether removal is possible.",
      "**Transfer owner rights:** you add us as an owner in your Business Profile – Google sends the invitation by email. **No passwords**, no access to your Gmail, your Google account or Google Ads.",
      "**Removal:** usually about **24 hours after the ownership transfer**. If Google additionally requires verification, it can take a few days longer.",
      "**Pay only afterwards:** you pay once the listing has been removed.",
    ] },
    { t: "h3", text: "What does it cost to have your business removed from Google?" },
    { t: "ul", items: [
      "**from $495 excl. VAT per profile** – due only after successful removal.",
      "**Fresh start (removal + new profile):** from $950 excl. VAT.",
      "**Multiple locations:** volume discount on request.",
      "**Optional protection plan:** $29.90 per month, $299 per year or $990 one-time (each excl. VAT) – including daily monitoring and renewed removal if a third party later creates a new listing for your location.",
    ] },
    { t: "p", text: "Your website, your rankings in regular Google Search and any Google Ads campaigns are not affected by the removal." },
    { t: "tip", title: "Only a few bad reviews?", text: "If you'd rather keep your listing and only lose one or a few unfair reviews, you don't need to remove the whole business: with our [single-review removal](/en/remove-single-reviews) you pick the reviews and pay only for those actually removed." },

    { t: "h2", id: "limits", text: "Limits: what we don't do", toc: "Limits" },
    { t: "ul", items: [
      "**Only on behalf of the owner:** we work exclusively for the owner or managing director of the business in question.",
      "**No competitors:** we don't remove other businesses' listings.",
      "**No public places:** landmarks, parks, squares, government offices and similar public places are excluded.",
      "**Google decides:** the decision on every removal is Google's alone. That's why you pay only after successful removal.",
    ] },

    { t: "cta", title: "Ready to remove your business from Google?", text: "Free check in seconds – then decide in your own time.", btn: "Start free check", href: "/en/check-profile", trust: ["Free check", "No passwords needed", "Pay only after removal"] },
  ],
  faq: [
    { q: "How do I remove my business from Google?", a: "There is no delete button. As the owner, open your Business Profile and go to ⋮ More → Business Profile settings → Remove Business Profile → Remove profile content and managers → Continue → Remove. That only ends your access, though – the listing and all reviews stay visible on Search and Maps. Complete removal is handled by RapidRemove on behalf of the owner, through the procedures Google provides." },
    { q: "Can I delete my business from Google myself?", a: "Only partly. You can remove your management access or mark the business permanently closed. Neither deletes the public listing – name, address and reviews stay visible." },
    { q: "How do I delete my Google Business account?", a: "There is no separate Google Business account: your Business Profile is managed through a regular Google account, which you can delete under Google Account → Data & privacy → Delete your Google Account. Decide what happens to your business listing first – once the account is gone, you have no access to the listing anymore." },
    { q: "Does deleting my Google account remove my business listing?", a: "No. The listing stays online with all its reviews and simply becomes unclaimed. Anyone can then suggest edits or request ownership. The same applies when you cancel Google Workspace or close your Google Ads account." },
    { q: "How do I close my Google Business page?", a: "In your Business Profile go to Edit profile → Hours (opening status) → Permanently closed (or Temporarily closed for a break) → Save. Closing is not deleting: the page stays visible with a “Permanently closed” label and all its reviews." },
    { q: "Why is my business still on Google after I closed it?", a: "Because “permanently closed” isn't a deletion. Google keeps showing the listing with a “Permanently closed” label – reviews included." },
    { q: "How long does a closed business stay on Google?", a: "There's no fixed deadline. According to Google, a closed listing is shown less often over time; in searches for the business name it often stays visible for a very long time." },
    { q: "How do I remove a previous owner's business from Google?", a: "Open the listing, choose “Suggest an edit” → “Close or remove” and pick the matching reason, such as moved or doesn't exist. Google reviews the suggestion and decides on its own. We don't remove other businesses' listings – only on behalf of the respective owner." },
    { q: "How much does it cost to have my business removed from Google?", a: "At RapidRemove, from $495 excl. VAT per profile, due only after successful removal. Removal plus a new profile (fresh start) costs from $950 excl. VAT. For multiple locations there's a volume discount on request." },
    { q: "How long does removal take?", a: "Usually about 24 hours after the ownership transfer. If Google additionally requires verification, it can take a few days longer." },
    { q: "Do you need my password?", a: "No. You transfer owner rights to us directly in your Business Profile, and Google confirms this with an email invitation. We have no access to your Gmail, your Google account or Google Ads." },
    { q: "Will the reviews come back after removal?", a: "The reviews are attached to the removed listing and disappear with it. A new profile starts with 0 reviews. What can't be prevented is a third party creating a new listing for your location later – that's what the optional protection plan with daily monitoring is for." },
    { q: "Can I delete my business and start over?", a: "Yes. After the removal you can create a new profile yourself after waiting at least 48 hours, or book the fresh start from $950 excl. VAT with a newly created profile. As long as the old listing exists, Google usually merges a new profile with the old one." },
    { q: "I have multiple locations – does that work too?", a: "Yes. Each location is its own profile and is removed individually. For multiple locations there's a volume discount on request." },
    { q: "What if I sold my business or moved?", a: "Then usually don't delete: if you sold, transfer ownership to the buyer; if you moved, change the address in your existing profile. That way the reviews are kept." },
    { q: "Is this legitimate?", a: "RapidRemove works exclusively on behalf of the owner, through the procedures Google provides, without passwords and with payment only after successful removal. Google makes the decision. We don't remove competitors' listings or public places." },
  ],
  related: [
    // Keys for resolveRelated(); each renders as the localized /en/magazine/<slug> path.
    { label: "How to delete a Google Business Profile (step by step)", url: "google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Remove a business from Google Maps: own, third-party & duplicate listings", url: "google-maps-eintrag-loeschen" },
    { label: "Remove Google reviews: costs and methods", url: "google-bewertung-loeschen-lassen" },
    { label: "Google review removal service: how it works", url: "einzelbewertung-loeschen-service" },
  ],
};
export default article;
