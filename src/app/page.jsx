import App from "@/components/App";
import { localeUrl, hreflangMap } from "@/lib/locales-meta";
import { magCardsFor } from "@/lib/articles/catalog";
import { I18N } from "@/lib/i18n";

export const metadata = {
  alternates: { canonical: localeUrl("de"), languages: hreflangMap() },
};

// FAQPage-Schema aus dem sichtbaren deutschen FAQ der Startseite (1:1, keine Erfindung).
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ((I18N.de.faq && I18N.de.faq.items) || []).map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <App initialLang="de" magCards={magCardsFor("de")} />
    </>
  );
}
