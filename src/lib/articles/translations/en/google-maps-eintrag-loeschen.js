/* EN — google-maps-eintrag-loeschen

   SEO rebuild 2026-11-06 for the US "remove business from Google Maps" cluster
   (GSC USA, 28 days: Google served the EN hub for these queries, this page had 2
   impressions). Target queries: how to remove a business from google maps, remove /
   delete business from google maps, how do i remove my business from google maps,
   how to delete a business on google maps, remove company from google maps, how long
   does a permanently closed business stay on google, how to permanently close a
   business on google.
   Structure mirrors the rebuilt German article (google-maps-eintrag-loeschen.js):
   short answer → official steps → "permanently closed" (+ how long it stays) →
   someone else's / fake listing → duplicate → home address → moving, closing,
   selling → comparison table → service → starting over → limits → FAQ.
   Distinct from the EN hub (/en/magazine/delete-google-business-profile = "delete
   Google Business Profile"); linked with the anchor "delete a Google Business Profile".
   WORDING (binding): removal "on behalf of the owner, through the procedures Google
   provides"; duration "usually about 24 hours after the ownership transfer" (+
   verification note); prices excl. VAT; no promises of success or safety. */
const article = {
  category: "Google policy",
  meta: {
    slug: "delete-google-maps-listing",
    title: "How to Remove a Business from Google Maps (2026 Guide)",
    h1: "How to Remove (or Delete) a Business from Google Maps",
    description:
      "Google has no delete button: “permanently closed” keeps the listing and all reviews online. Every way to remove a business from Google Maps, step by step.",
    keywords: [
      "how to remove a business from google maps",
      "remove business from google maps",
      "delete business from google maps",
      "how do i remove my business from google maps",
      "how to remove my business from google maps",
      "how to delete a business on google maps",
      "how to remove your business from google maps",
      "remove company from google maps",
      "how long does a permanently closed business stay on google",
      "how to permanently close a business on google",
      "remove fake business from google maps",
      "remove home address from google maps",
    ],
    author: "Maximilian Hölzl",
    authorRole: "Google expert & founder",
    date: "2026-06-04",
    updated: "2026-11-06",
  },
  dek: "Want to remove your business from Google Maps – after closing, moving, selling, or because the listing is hurting you? First, the part most guides skip: **neither “Remove Business Profile” nor “permanently closed” deletes the listing.** The name, address and every review stay on Google Maps and Google Search. This guide walks through every option step by step – for your own listing, someone else’s, a fake or duplicate listing, and your home address – and shows which one actually removes the business.",
  blocks: [
    { t: "note", title: "Note", text: "This article is a practical how-to guide, not legal advice. As of November 2026 – Google occasionally renames menus and options." },

    { t: "tip", title: "Short answer", text: "Google Maps has **no delete button** for a business listing. As the owner you can only **remove your own access** (“Remove profile content and managers”) or mark the business **“permanently closed”** – in both cases **the listing and all its reviews stay on Google Maps and Google Search**. Google itself removes a place only in specific cases, for example when it never existed, isn’t eligible to be on Maps, or is a duplicate – and Google decides that on its own. **Complete removal including all reviews** is what RapidRemove handles on behalf of the owner, through the procedures Google provides – **you pay only after the listing is removed**." },

    { t: "h2", id: "official-steps", text: "How to remove a business from Google Maps: the official steps", toc: "Official steps" },
    { t: "p", text: "The option Google gives owners is called **“Remove Business Profile.”** It ends your management of the listing – it does not delete the listing itself. Here is exactly how it works, so you know what you are (and aren’t) doing:" },
    { t: "h3", text: "On a computer (Google Search or Google Maps)" },
    { t: "ol", items: [
      "Sign in with the Google account that **owns** the Business Profile, then search for your business name in Google Search or Google Maps (or search “my business”).",
      "Open your Business Profile and click **⋮ More**.",
      "Select **“Business Profile settings.”**",
      "Click **“Remove Business Profile.”**",
      "Choose **“Remove profile content and managers.”** You can also tick **“Mark your business as permanently closed”** here.",
      "Confirm with **Continue** → **Remove**.",
    ] },
    { t: "h3", text: "In the Google Maps app (iPhone or Android)" },
    { t: "p", text: "Open the Google Maps app with the owner account, go to your Business Profile and tap **More** → **“Business Profile settings”** → **“Remove Business Profile.”** The steps and the result are the same as on a computer; labels can differ slightly depending on your app version." },
    { t: "h3", text: "Don’t see the option?" },
    { t: "p", text: "If “Remove Business Profile” is missing, you are usually **not the primary owner**: you’re a manager, signed in with the wrong Google account, the listing was never claimed by you – or you only recently became owner. New owners may have to wait before the option appears (Google currently mentions 7 days). Without owner rights, you first have to request access with **“Claim this business”** or **“Request access”** and get verified. Otherwise the only route is “Suggest an edit” (see below)." },
    { t: "warn", title: "What Google says happens afterwards", text: "Google’s own help page says, in essence: **customer reviews remain visible**, and the business **may still appear on Google Search and Maps**. Only *your* content is deleted – posts, photos you uploaded, and your replies to reviews. Only the **primary owner** can do this. In short: you give up control, the listing stays." },
    { t: "p", text: "That is why so many owners are surprised to find their business still on Google Maps after they “deleted” it – now without their replies to negative reviews and without any say over who edits the listing. If you want the full picture of the profile side, read how to [delete a Google Business Profile](/en/magazine/delete-google-business-profile/)." },

    { t: "h2", id: "permanently-closed", text: "What “permanently closed” really does", toc: "“Permanently closed”" },
    { t: "p", text: "Many owners think “permanently closed” means deleted. It doesn’t – it is only a **status**. The listing stays public with its name, address, photos and **every review**, plus a “Permanently closed” label. To people who find it, that often looks worse than before: the star rating stays, but your replies stop." },
    { t: "ul", items: [
      "**The listing stays visible** – on Google Maps and in Google Search, including searches for your business name.",
      "**The reviews stay** – including unfair or fake ones.",
      "**It only fades gradually:** according to Google, closed businesses are shown less often over time. Google gives no fixed deadline for when the listing is gone.",
      "**It can still be edited:** any user can suggest changes – up to and including marking the business as open again.",
    ] },
    { t: "h3", text: "How to permanently close a business on Google" },
    { t: "p", text: "If your business really has closed, the status is correct and worth setting. As the owner, open your Business Profile → **Edit profile** → **Hours** → set the status to **“Permanently closed”** → **Save**. Alternatively, tick **“Mark your business as permanently closed”** when you remove the profile (see above). If you don’t own the listing, use **Suggest an edit** → **“Close or remove”** → **“Permanently closed”** – Google reviews the suggestion first." },
    { t: "p", text: "But if your goal is to **get rid of** the listing, “permanently closed” doesn’t solve the problem." },

    { t: "h2", id: "how-long-closed", text: "How long does a permanently closed business stay on Google?", toc: "How long it stays" },
    { t: "p", text: "There is **no fixed timeframe**. Google only says that permanently closed businesses appear less often in results over time – it doesn’t say when, or whether, the listing disappears completely. Until then, the listing and its reviews stay public." },
    { t: "p", text: "In our experience, closed listings often stay visible for a long time – in many cases for years – especially when people still search for the business name, the listing has many reviews, or other websites still mention the business. Treat “it will go away on its own” as a hope, not a plan." },
    { t: "cta", title: "Don’t want to wait years for a closed listing to fade?", text: "We check for free whether your listing can be removed completely – reviews included – on your behalf, through the procedures Google provides.", btn: "Check my listing", href: "/en/check-profile", trust: ["Free check", "No passwords needed", "Pay only after removal"] },

    { t: "h2", id: "someone-elses-listing", text: "How to remove someone else’s, a fake, or a wrong listing from Google Maps", toc: "Someone else’s / fake listing" },
    { t: "p", text: "For listings you don’t own – a place that doesn’t exist, a business shown at your address that has nothing to do with you, or spam – the only option is Google’s report function. Any Google user can use it:" },
    { t: "ol", items: [
      "Open the listing in **Google Maps** (browser or app).",
      "Click **“Suggest an edit.”**",
      "Choose **“Close or remove.”**",
      "Pick the reason that fits, for example **“Doesn’t exist here,”** **“Duplicate of another place,”** **“Permanently closed”** or **“Spam, fake, or offensive.”**",
      "Submit – Google reviews the suggestion and decides on its own.",
    ] },
    { t: "p", text: "Realistically: Google reviews these mostly automatically, and **for real, existing businesses such suggestions are often rejected** or only turned into a “Permanently closed” label. Reports that are obviously true – a store that never existed at that address, for example – have a better chance. You can track the status under **“Contributions”** in Google Maps." },
    { t: "p", text: "You can’t have a **competitor’s** listing removed just because it hurts you. If there is a concrete violation – a fake listing, misleading information, or keyword stuffing in the business name – you can report it for review through “Suggest an edit” or Google’s Business Redressal Complaint Form." },

    { t: "h2", id: "duplicate-listing", text: "How to remove or merge a duplicate Google Maps listing", toc: "Duplicate listing" },
    { t: "p", text: "Duplicates often appear after a move, a name change, or because a customer “added” your business a second time. What to do depends on who owns the listings:" },
    { t: "ul", items: [
      "**Both listings are in your account:** remove the extra profile with **“Remove Business Profile”** – and only that one.",
      "**Duplicate without an owner:** open it in Google Maps → **“Suggest an edit”** → **“Close or remove”** → **“Duplicate of another place.”**",
      "**Both listings have reviews:** ask **Google Business Profile support** to merge them instead of removing one. Otherwise the reviews on the removed listing are lost.",
    ] },
    { t: "warn", title: "Careful", text: "Never report your **verified** main listing as the duplicate by mistake. The wrong listing may stay, and you may have to verify ownership all over again." },

    { t: "h2", id: "home-address", text: "How to remove your home address from Google Maps", toc: "Remove your home address" },
    { t: "p", text: "When people search for removing an address from Google Maps, they usually mean one of three things:" },
    { t: "h3", text: "Your home address is shown on your own business listing" },
    { t: "p", text: "If you work from home and serve customers at their location (contractors, cleaners, mobile services), Google treats you as a **service-area business** – and you don’t have to show your home address. Open your profile → **Edit profile** → **Location**, turn off **showing the business address to customers**, and set a **service area** instead (cities, ZIP codes or counties). Google still knows the address, but it is no longer displayed publicly." },
    { t: "h3", text: "Your home is shown as a business" },
    { t: "p", text: "If a business listing appears at your private home – a former business, a previous tenant’s, or one someone else created – report it via **“Suggest an edit”** → **“Close or remove”** → **“Doesn’t exist here”** (or “Private residence,” if offered). If it is your own former business, claim the listing first, then remove the address or the whole listing." },
    { t: "h3", text: "Saved places and history in the Maps app" },
    { t: "p", text: "If it’s only about addresses in your own Google account: in the Maps app under **“Saved”** → **“Labeled,”** you can remove “Home,” “Work” and custom labels via **⋮**. Search history and visited places are deleted via your **profile picture** → **“Settings”** → **“Maps history.”** This only affects your account – public listings don’t change." },

    { t: "h2", id: "moving-closing-selling", text: "After moving, closing, selling or retiring", toc: "Moving, closing, selling" },
    { t: "ul", items: [
      "**Moving:** change the address on the existing listing instead of creating a new one. A second listing creates a duplicate and splits your reviews.",
      "**Name change:** change the name on the same profile. A new listing starts without any review history.",
      "**Closing:** “Permanently closed” is correct – but the listing and old reviews stay visible and are often still tied to your name.",
      "**Selling:** transfer ownership to the buyer (**Business Profile settings** → **People and access** → **Add** → role **Owner**) instead of removing the listing. The buyer then takes over the listing and its reviews.",
      "**Retiring / shutting down:** if nothing should remind people of the former business – especially when the listing carries your personal name – complete removal is the clean ending.",
    ] },
    { t: "p", text: "Want your company out of Google Search as a whole, not only Maps? See [remove your company from Google](/en/magazine/remove-company-from-google/)." },

    { t: "h2", id: "comparison", text: "All options compared", toc: "Options compared" },
    { t: "table", head: ["Option", "Listing on Maps", "Reviews", "Effort"], rows: [
      ["Remove profile content and managers", "Stays visible, now unmanaged", "Stay visible (without your replies)", "Low – a few clicks, primary owner only"],
      ["Mark permanently closed", "Stays visible with a label, fades only gradually", "Stay visible", "Low"],
      ["Suggest an edit (“Doesn’t exist here”)", "Google decides – often rejected for real businesses", "Stay as long as the listing stays", "Low, outcome uncertain"],
      ["Lawyer", "Usually stays – only targets individual unlawful content", "Only individual unlawful reviews", "High – weeks to months, billed by the hour"],
      ["**RapidRemove**", "**Removed** – on behalf of the owner, through the procedures Google provides", "**Disappear with the listing**", "Low – free check, ownership transfer, pay only after removal"],
    ] },

    { t: "cta", title: "Can your business be removed from Google Maps?", text: "Enter your business name – we check for free whether and how your listing can be removed, including all reviews.", btn: "Start free check", href: "/en/check-profile", trust: ["Free check", "No passwords needed", "Pay only after removal"] },

    { t: "h2", id: "have-it-removed", text: "Have your business removed from Google Maps", toc: "Have it removed" },
    { t: "p", text: "If you want the listing removed **completely** – including all reviews – from Google Maps and Google Search, Google’s built-in options aren’t enough. That’s what RapidRemove does: we remove the entire listing **on behalf of the owner, through the procedures Google provides**. All reviews attached to the listing disappear with it." },
    { t: "h3", text: "How it works" },
    { t: "ol", items: [
      "**Free check:** enter your business name. We find your listing and check whether and how it can be removed.",
      "**Transfer owner rights:** you add us as an owner in your Business Profile – this runs through Google’s own invitation email. **We don’t need any passwords**, and we get no access to your Google account, Gmail or Google Ads.",
      "**Removal:** the listing is **usually removed about 24 hours after the ownership transfer**. If Google requires verification first – for example because you haven’t claimed the listing yet – it takes a few days longer.",
      "**Pay only afterwards:** you pay once the listing has been removed.",
    ] },
    { t: "h3", text: "What it costs" },
    { t: "p", text: "Removing a listing costs **from $495 excl. VAT** per profile – due **only after successful removal**; your exact price is shown in the free check. Removal plus a **fresh new profile** set up for you costs **from $950 excl. VAT**. Optional **protection against new listings** – in case someone adds your business to Google Maps again later – is available for **$29.90 per month, $299 per year or $990 one-time** (each excl. VAT, each including daily monitoring)." },
    { t: "warn", title: "Good to know", text: "Your **good reviews and photos** disappear with the listing too. Your website and your rankings in regular Google Search are not affected. If a listing can’t be removed, you’ll need to request ownership back from Google yourself afterwards." },
    { t: "p", text: "Only a few unfair or fake reviews are the problem, and the listing itself is fine? Then you can keep it and have just those reviews removed instead: [single-review removal](/en/remove-single-reviews/) – you pay only for reviews that are actually removed. More on fake reviews: [remove fake Google reviews](/en/magazine/remove-fake-google-reviews/)." },

    { t: "h2", id: "start-over", text: "Starting over afterwards", toc: "Starting over" },
    { t: "p", text: "Yes, you can. After complete removal you can create and verify a **new Business Profile**. Wait **at least 48 hours** after the removal so Google doesn’t connect the new listing to the old one. The new profile starts with **0 reviews** – a genuine fresh start." },
    { t: "p", text: "It’s different if you only used “Remove Business Profile” or “permanently closed” and then create a new profile: the old listing still exists, Google sees a **duplicate** at the same address and often merges the two – old reviews included." },

    { t: "h2", id: "limits", text: "Limits: what we don’t do", toc: "Limits" },
    { t: "ul", items: [
      "**Only on behalf of the owner:** we work exclusively for the owner or managing director of the business whose listing is to be removed.",
      "**No competitors’ listings:** we don’t remove other businesses’ profiles.",
      "**No public places:** landmarks, parks, government offices or streets aren’t business listings and aren’t part of our service.",
      "**Google decides:** whether a listing is removed is up to Google alone. That’s why you pay only after success.",
    ] },

    { t: "h2", id: "conclusion", text: "Conclusion", toc: "Conclusion" },
    { t: "p", text: "You can’t delete a business from Google Maps with Google’s own tools: “Remove profile content and managers” only ends your management, “permanently closed” is only a status, and “Suggest an edit” reports are often rejected for real businesses. For duplicates, home addresses and moves there are good fixes inside the profile. If the listing should **disappear completely** along with all its reviews, removal on behalf of the owner through the procedures Google provides is the direct route – and you pay only after success." },

    { t: "cta", title: "Check for free whether your listing can be removed.", text: "See your listing in seconds and find out whether we can remove it. From $495 excl. VAT – due only after successful removal.", btn: "Start free check", href: "/en/check-profile", trust: ["Free check", "No passwords needed", "Pay only after removal"] },
  ],
  faq: [
    { q: "How do I remove my business from Google Maps?", a: "As the owner, open your Business Profile → ⋮ More → “Business Profile settings” → “Remove Business Profile” → “Remove profile content and managers” → Continue → Remove. This only ends your management, though: according to Google, the listing and its reviews usually stay on Maps and Search. Complete removal runs through the procedures Google provides – RapidRemove handles that on behalf of the owner." },
    { q: "Can I delete my business from Google Maps myself?", a: "Not completely. You can remove your access or mark the business “permanently closed.” There is no button for owners that deletes the listing together with its reviews." },
    { q: "Why is my business still on Google Maps after I deleted it?", a: "Because “Remove Business Profile” only deletes your content and your access – posts, your photos and your replies to reviews. The public listing with name, address and reviews stays, often labeled “Permanently closed.”" },
    { q: "How do I permanently close a business on Google?", a: "Open your Business Profile → Edit profile → Hours → set the status to “Permanently closed” → Save. You can also tick “Mark your business as permanently closed” when removing the profile. The listing and its reviews stay visible with a label." },
    { q: "How long does a permanently closed business stay on Google?", a: "There is no fixed timeframe. Google says permanently closed businesses are shown less often over time – until then the listing and reviews stay visible. In our experience that can take a very long time, often years." },
    { q: "How do I remove a business from Google Maps that isn’t mine or has closed?", a: "Open the listing in Google Maps → “Suggest an edit” → “Close or remove” → pick a reason such as “Doesn’t exist here,” “Duplicate of another place” or “Permanently closed.” Google reviews the suggestion and decides on its own; for real businesses such suggestions are often rejected or only turned into a “closed” label." },
    { q: "How do I remove a duplicate Google Maps listing?", a: "If both listings are in your account, remove the extra profile. Report a duplicate without an owner via “Suggest an edit” → “Close or remove” → “Duplicate of another place.” If both have reviews, ask Google Business Profile support to merge them instead." },
    { q: "How do I remove my home address from Google Maps?", a: "If it’s your home address on your own business listing, go to Edit profile → Location, stop showing the address to customers and set a service area. If your home is shown as someone else’s business, report the listing via “Suggest an edit.” Saved addresses like “Home” are removed in the Maps app under “Saved” → “Labeled.”" },
    { q: "How much does it cost to remove a business from Google Maps?", a: "With RapidRemove from $495 excl. VAT per profile, due only after successful removal; your exact price is shown in the free check. Removal plus a fresh new profile costs from $950 excl. VAT. Optional protection against new listings costs $29.90 per month, $299 per year or $990 one-time (excl. VAT, incl. daily monitoring)." },
    { q: "How long does removal take?", a: "Usually about 24 hours after the ownership transfer. If Google requires verification first, it takes a few days longer." },
    { q: "Do you need my password?", a: "No. You add us as an owner in your Business Profile through Google’s invitation email. We get no access to your Google account, Gmail or Google Ads." },
    { q: "Will the reviews come back?", a: "The reviews are attached to the listing and disappear with it. If you create a new profile later, it starts with 0 reviews." },
    { q: "Can a removed listing reappear?", a: "Yes – third parties, such as customers, can add your business to Google Maps again later. That’s what the optional protection with daily monitoring is for." },
    { q: "Can I create a new listing afterwards?", a: "Yes. Wait at least 48 hours after complete removal, then create and verify a new profile. It starts without reviews." },
    { q: "Will my website still show up on Google?", a: "Yes. Only the Google Maps listing (the Business Profile) is removed. Your website, your rankings in regular search and your Google Ads campaigns stay unchanged." },
    { q: "Is this legitimate?", a: "We work exclusively on behalf of the owner or managing director and use the procedures Google provides. We don’t need passwords, we don’t remove competitors’ listings, and whether a listing is removed is decided by Google alone. That’s why you pay only after success." },
  ],
  // resolveRelated() (lib/articles/catalog.js) passes relative "/<lang>/…" paths
  // straight through (cleanHref strips the trailing slash) – all verified in the
  // live sitemap.xml on 2026-11-06.
  related: [
    { label: "How to delete a Google Business Profile", url: "/en/magazine/delete-google-business-profile/" },
    { label: "Remove your company from Google", url: "/en/magazine/remove-company-from-google/" },
    { label: "Remove fake Google reviews", url: "/en/magazine/remove-fake-google-reviews/" },
    { label: "Bad Google review – what to do?", url: "/en/magazine/bad-google-review-what-to-do/" },
  ],
};
export default article;
