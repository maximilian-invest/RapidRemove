import App from "@/components/App";
import { localeUrl, hreflangMap } from "@/lib/locales-meta";

export const metadata = {
  alternates: { canonical: localeUrl("de"), languages: hreflangMap() },
};

export default function Page() {
  return <App initialLang="de" />;
}
