import App from "@/components/App";
import { localeUrl, hreflangMap } from "@/lib/locales-meta";
import { magCardsFor } from "@/lib/articles/catalog";

export const metadata = {
  alternates: { canonical: localeUrl("de"), languages: hreflangMap() },
};

export default function Page() {
  return <App initialLang="de" magCards={magCardsFor("de")} />;
}
