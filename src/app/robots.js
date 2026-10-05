import { SITE_URL } from "@/lib/article-google-profil";

/* Alle Crawler erlaubt. KI-Such-Crawler (ChatGPT-Suche, Perplexity, Claude, Gemini)
   werden ausdrücklich genannt, damit Inhalte in KI-Antworten zitiert werden können.
   Admin und Bestell-Formulare sind für niemanden relevant. */
const AI_BOTS = ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "Google-Extended", "Applebot-Extended", "Bingbot"];

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/partner", "/my-reviews"] },
      { userAgent: AI_BOTS, allow: "/", disallow: ["/admin", "/partner", "/my-reviews"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
