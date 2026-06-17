/* EN — negative-bewertung-ignorieren-antworten-loeschen (Ignore, respond, or remove) */
const article = {
  category: "Reputation",
  meta: {
    slug: "negative-review-ignore-respond-remove",
    title: "Negative Review: Ignore, Respond, or Remove?",
    h1: "Negative Google Review: Ignore, Respond, or Remove?",
    description:
      "Got a negative Google review? A clear decision guide by review type — with concrete next steps for each scenario.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Google expert",
    date: "2026-06-09",
  },
  dek: "The right response comes down to **one** question: is the review legitimate or not? Genuine, factual criticism deserves a composed reply. Unjustified, fake, or unlawful reviews should be removed. And some reviews you simply leave alone. This guide maps out all three paths clearly — so you're not reacting on instinct.",
  blocks: [
    { t: "h2", id: "kurz", text: "The Bottom Line", toc: "The Bottom Line" },
    { t: "ul", items: [
      "**Ignore:** when the criticism is harmless and isolated, and gets lost in a healthy overall average.",
      "**Respond:** when the criticism is genuine and factual — the response is for *other readers*, not the reviewer.",
      "**Get it removed:** when you're dealing with fakes, insults, false statements of fact, or no real customer relationship — there's often a valid basis for removal.",
      "**Never:** argue in anger, make threats, or publicly call out a customer — that triggers the Streisand Effect.",
    ] },

    { t: "h2", id: "grundfrage", text: "The Core Question: Legitimate or Not?", toc: "Legitimate?" },
    { t: "p", text: "Before you do anything, settle one thing: does the review describe a **real experience** — or not? Everything flows from this line. An honest opinion, even a harsh one, about a genuine visit is protected as free speech and is very hard to get removed. A review with no real basis — a fake, a competitor, a case of mistaken identity, a pure attack — is often far more vulnerable." },

    { t: "h2", id: "ignorieren", text: "Path 1: Ignore — When Doing Nothing Is Right", toc: "1 · Ignore" },
    { t: "p", text: "Not every critical voice needs a response. If your overall average is solid, above 4.0, and a single matter-of-fact 3- or 4-star review sits in the mix, it barely hurts — it actually makes the overall picture look more credible. A business that reacts to *every* minor comment can come across as thin-skinned." },
    { t: "p", text: "**Ignore is right when:** the review is isolated, factual, and unremarkable within a strong overall average." },

    { t: "h2", id: "antworten", text: "Path 2: Respond — With Composure, for the Readers", toc: "2 · Respond" },
    { t: "p", text: "A genuine critical review is a stage — not for a fight with the reviewer, but to show **other readers** how you handle criticism. A good response is brief, professional, solution-focused, and free of defensiveness." },
    { t: "p", text: "Practical rules: respond promptly, thank the person for the feedback, take the concern seriously, offer a resolution or a private conversation — and never reveal customer data or internal details in public. The thing to avoid here is the **Streisand Effect**: aggressive pushback or threats often trigger a wave of additional negative reviews." },
    { t: "p", text: "**Respond is right when:** the criticism is genuine and factual, and a composed reply improves how others see you." },

    { t: "h2", id: "loeschen", text: "Path 3: Get It Removed — When There's a Valid Basis", toc: "3 · Remove" },
    { t: "p", text: "For **unjustified** reviews, removal is the better path. Strong grounds exist for:" },
    { t: "ul", items: [
      "**Fake reviews** with no real customer relationship (e.g., from competitors),",
      "**Insults, pure attacks, or false statements of fact,**",
      "**1-star reviews without text** and no identifiable connection to your business,",
      "**Off-topic or mistaken-identity** entries.",
    ] },
    { t: "p", text: "The requirement that a review must be tied to an actual customer relationship is well-established in case law — confirmed by the German Regional Court of Lübeck (ref. [9 O 59/17](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=9+O+59/17)) and the German Federal Court of Justice (ref. [VI ZR 34/15](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=VI+ZR+34/15)) as part of German and EU legal precedent. In the United States, the legal landscape is different: Section 230 of the Communications Decency Act generally shields platforms like Google from liability for third-party content, which means legal pressure on platforms is less straightforward. Still, Google's own content policies and terms of service remain enforceable grounds to request removal of fake or policy-violating reviews regardless of jurisdiction." },
    { t: "p", text: "For the actual process, there are two routes we compare in detail: **flagging and the legal path** for individual reviews, and **technical profile deletion** when the profile as a whole is damaged. For the direct comparison, see [Lawyer or Technical Removal?](/en/magazine/negative-google-review-lawyer-or-removal/); for methods and costs, see [How to Remove a Google Review](/en/magazine/remove-google-reviews/)." },
    { t: "p", text: "**Remove is right when:** the review is unjustified, fake, or unlawful — or when the profile as a whole is beyond saving." },

    { t: "h2", id: "schnell", text: "Quick Decision Guide", toc: "Quick Guide" },
    { t: "table", head: ["Situation", "Recommendation"], rows: [
      ["Isolated, factual criticism, strong overall average", "Ignore"],
      ["Genuine negative experience, addressable", "Respond"],
      ["Fake / competitor / no real customer contact", "Get removed"],
      ["Insult, false statement of fact, pure attack", "Get removed"],
      ["Multiple bad reviews, average in freefall", "Consider profile deletion"],
    ] },

    { t: "cta", title: "Not Sure Whether Your Review Can Be Removed?", text: "Enter your business name — we'll check in seconds, for free, whether the review or profile can be removed and how quickly.", btn: "Start Free Check", href: "https://www.rapid-remove.com/", trust: ["Free Analysis", "Includes Guarantee", "No Risk"] },

    { t: "p", text: "This article is practical guidance, not legal advice." },
  ],
  faq: [
    { q: "Should I respond to every negative review?", a: "No. A composed response is worthwhile for genuine, factual criticism — for the benefit of other readers. Harmless isolated reviews in a good overall average can be left alone; unjustified or unlawful ones are better removed." },
    { q: "When can a Google review be removed?", a: "When it violates Google's policies or is unlawful — for example, fakes, insults, false statements of fact, or a missing customer relationship. Purely factual opinions about real experiences are very difficult to remove." },
    { q: "What is the Streisand Effect?", a: "When an aggressive response or a legal threat provokes the reviewer — and triggers more negative reviews. That's why you should never respond in anger, and why removal is best handled through quiet, technical channels rather than public confrontation. The term comes from a 2003 incident in which Barbra Streisand's attempt to suppress a photo of her home backfired and massively amplified its exposure online." },
    { q: "What if there are already a lot of bad reviews?", a: "Then fighting each one individually is often a losing battle. A full profile deletion followed by a clean restart is usually the more practical path." },
  ],
  related: [
    { label: "What Does a Bad Google Review Actually Cost You?", url: "https://www.rapid-remove.com/was-kostet-eine-schlechte-google-bewertung" },
    { label: "Lawyer or Technical Removal?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "How to Remove a Google Review: Costs and Methods", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
