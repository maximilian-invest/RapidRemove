/* EN — negative-google-suchergebnisse-verdraengen (Remove or suppress negative results) */
const article = {
  category: "Reputation",
  meta: {
    slug: "remove-suppress-negative-google-results",
    title: "Remove or Suppress Negative Google Search Results",
    h1: "Remove or Suppress Negative Google Search Results",
    description:
      "Remove negative Google results or push them off page 1? What's actually achievable, how long it takes, and which approach fits which situation.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Google expert",
    date: "2026-06-23",
  },
  dek: "A negative result for your name on page 1 costs you trust, customers, and job applicants. Two paths lead out: **remove** the result (when it's unlawful or otherwise deletable) or **push it off page 1** (when it's staying, but you don't want anyone to find it). This article explains which approach fits which situation — and what's realistically achievable.",
  blocks: [
    { t: "h2", id: "kurz", text: "The Bottom Line", toc: "The Bottom Line" },
    { t: "ul", items: [
      "**Removal** works for unlawful/fake content and your own business profile — permanently.",
      "**Suppression** is the path when a result is legitimate but shouldn't be visible anymore.",
      "**Page 1 is everything:** Almost nobody clicks to page 2 — “pushed off page 1” is practically the same as “gone.”",
      "**Suppression takes time:** Weeks to months; removal often takes only days.",
    ] },

    { t: "h2", id: "warum", text: "Why Page 1 Determines Everything", toc: "Why Page 1" },
    { t: "p", text: "When someone searches your name, almost all that matters is what appears on **page 1**. Clicks cluster massively around the top results; page 2 is essentially invisible. A negative article or listing sitting at position 3 shapes your image with customers, partners, and job candidates — every single day. That's why the goal isn't “deleted somewhere” — it's “not on page 1.”" },

    { t: "h2", id: "entfernen", text: "Path 1: Remove — When the Result Can Be Deleted", toc: "Path 1: Remove" },
    { t: "p", text: "Some results can be taken down entirely:" },
    { t: "ul", items: [
      "**Your own Google Business Profile** along with all reviews — through the official process (see [Delete a Google Business Profile](/en/magazine/delete-google-business-profile/)).",
      "**Unlawful content** — defamation, false statements of fact, privacy violations.",
      "**Personal data** — in certain circumstances, through requests to Google under applicable law.",
    ] },
    { t: "p", text: "It's worth noting that the “right to be forgotten” — the principle that individuals can request search engines delist certain personal information about them — is primarily an EU concept, established by the European Court of Justice and codified in GDPR Article 17. In the United States, there is no equivalent federal right, and Section 230 of the Communications Decency Act generally protects platforms from being compelled to remove third-party content. That said, Google does voluntarily process personal information removal requests for US users in specific categories, and unlawful content (defamation, certain privacy violations) remains actionable under US law." },
    { t: "p", text: "Removal is the most direct path because the problem disappears rather than just being moved — and it often takes days rather than months." },

    { t: "h2", id: "verdraengen", text: "Path 2: Suppress — When the Result Isn't Going Away", toc: "Path 2: Suppress" },
    { t: "p", text: "Not everything is deletable. A legitimate press article, an old forum post, a third-party listing — these usually can't be forced down legally. Here, **suppression** helps: deliberately building and strengthening high-quality positive content (your own pages, profiles, contributions, mentions) that Google judges as more relevant. Over time, these rise — and the unwanted result slides to page 2 or further, where almost nobody goes." },
    { t: "p", text: "Suppression is a long-term effort: it typically takes **weeks to months** and produces lasting results. See how we approach this on the service page [Reputation Management](/en/reputation-management/)." },

    { t: "h2", id: "zuordnung", text: "Remove or Suppress? The Breakdown", toc: "The Breakdown" },
    { t: "table", head: ["Type of Result", "Recommended Path"], rows: [
      ["Your own business profile / reviews", "Remove"],
      ["Fake, defamation, false statements of fact", "Remove"],
      ["Personal data (applicable law removal request)", "Remove"],
      ["Legitimate press article", "Suppress (or press deindexing)"],
      ["Old third-party forum or blog post", "Suppress"],
    ] },
    { t: "p", text: "For press articles, there's also the specialized path of [press deindexing](/en/press-deindexing/)." },

    { t: "h2", id: "selbst", text: "What You Can Do Yourself", toc: "DIY" },
    { t: "p", text: "Consistently maintain your own profiles (website, industry and social profiles) with good content — that's the foundation of any suppression effort. For faster levers (profile deletion, unlawful content, persistent results) specialized approaches are needed, because Google's standard tools simply don't reach these cases." },

    { t: "cta", title: "Which Result Is Hurting You — and Can It Be Removed?", text: "Name your business or the result — we'll check for free whether it can be removed or suppressed.", btn: "Start Free Check", href: "https://www.rapid-remove.com/", trust: ["Free Analysis", "Includes Guarantee", "No Risk"] },

    { t: "p", text: "This article is practical guidance, not legal advice." },
  ],
  faq: [
    { q: "Can you delete negative Google search results?", a: "Some, yes: your own business profile, unlawful content, and in certain circumstances personal data. Legitimate third-party content usually can't be deleted — suppression off page 1 is the answer there." },
    { q: "What does “suppress” mean?", a: "Deliberately building strong positive content so that unwanted (but non-removable) results slide from page 1 to later pages, where almost nobody sees them." },
    { q: "How long does suppression take?", a: "Typically weeks to months, depending on the competition and the strength of the unwanted result. Removing deletable content is often a matter of days." },
    { q: "Is pushing a result off page 1 enough?", a: "In practice, usually yes: since almost nobody clicks to page 2, a suppressed result is nearly as invisible as a deleted one." },
  ],
  related: [
    { label: "Online Reputation Management for Businesses — The Complete Guide", url: "https://www.rapid-remove.com/online-reputationsmanagement" },
    { label: "How to Delete a Google Business Profile", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Negative Review: Ignore, Respond, or Remove?", url: "https://www.rapid-remove.com/negative-bewertung-ignorieren-antworten-loeschen" },
  ],
};
export default article;
