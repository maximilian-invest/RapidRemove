/* Route: /google-profil-loeschungen-report — Datenreport (DE-Fassung; EN unter /en/google-business-profile-removal-report). */
import ReportPage from "@/components/ReportPage";
import { SITE_URL } from "@/lib/article-google-profil";
import { pageHreflang, pageUrl } from "@/lib/page-routes";
import { REPORT, REPORT_META, reportJsonLd } from "@/lib/report-data";

const URL = pageUrl("report", "de");
const M = REPORT_META.de;

export const metadata = {
  title: `${M.title} — RapidRemove`,
  description: M.description,
  alternates: { canonical: URL, languages: pageHreflang("report") },
  openGraph: { type: "article", title: M.title, description: M.description, url: URL, siteName: "RapidRemove", locale: "de_DE" },
};

export default function Page() {
  const jsonLd = reportJsonLd("de", { url: URL, siteUrl: SITE_URL, csvUrl: `${SITE_URL}${REPORT.csv}` });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReportPage initialLang="de" />
    </>
  );
}
