/* Eigener Browser (13.10.2026): Google-Bewertungslink in Chromium öffnen und den Seitentext lesen.
 * Google Maps ist eine JS-App – der Text „This review is no longer available" entsteht erst im Browser.
 * Kein Screenshot-Dienst, kein Kontingent, keine KI. Läuft mit @sparticuz/chromium (Binary im npm-Paket).
 * Alles ist abgesichert: Scheitert der Browser, kommt „unknown" zurück und die übrigen Prüfwege greifen. */

type Probe = { state: "gone" | "visible" | "unknown"; text: string; ms: number; error?: string };

let browserP: Promise<any> | null = null;
let idleTimer: NodeJS.Timeout | null = null;
let active = 0;

async function getBrowser(): Promise<any> {
  if (!browserP) {
    browserP = (async () => {
      const mod = (await import("@sparticuz/chromium")) as any;
      const chromium = mod.default;
      const puppeteer = (await import("puppeteer-core")).default as any;
      const launch = async () => puppeteer.launch({
        executablePath: process.env.CHROMIUM_PATH || (await chromium.executablePath()),
        args: [...(chromium.args || []), "--lang=en-US"],
        headless: true,
        defaultViewport: { width: 1280, height: 900 },
      });
      try { return await launch(); }
      catch (e) {
        // Server-Image ohne Chromium-Bibliotheken (libnss3 …): die mitgelieferten Amazon-Linux-Bibliotheken entpacken und nutzen.
        console.warn("Link-Browser: Start ohne Zusatz-Bibliotheken fehlgeschlagen – versuche mitgelieferte", String((e as Error)?.message || e).slice(0, 200));
        const { tmpdir } = await import("node:os"); const { join } = await import("node:path");
        process.env.CODEBUILD_BUILD_IMAGE ||= "nodejs22";
        (mod.setupLambdaEnvironment || chromium.setupLambdaEnvironment)?.(join(tmpdir(), "al2023", "lib"));
        return await launch();
      }
    })().catch((e) => { browserP = null; throw e; });
  }
  return browserP;
}

function scheduleClose(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    if (active > 0 || !browserP) return;
    const p = browserP; browserP = null;
    try { (await p).close(); } catch { /* */ }
  }, 120_000);
}

const GONE = /(this review is no longer available|review is no longer available|diese rezension ist nicht mehr verfügbar|rezension ist nicht mehr verfügbar|unsupported link|link not supported)/i;

const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Bewertungslink öffnen; „gone" bei „no longer available", „visible" wenn der Verfasser auf der Seite steht. */
export async function probeReviewLink(url: string, reviewer?: string | null, timeoutMs = 25_000): Promise<Probe> {
  const t0 = Date.now();
  if (process.env.LINK_PROBE === "off") return { state: "unknown", text: "", ms: 0, error: "aus (LINK_PROBE=off)" };
  if (active >= 2) return { state: "unknown", text: "", ms: 0, error: "Browser ausgelastet" };
  active++;
  let page: any = null;
  try {
    const b = await getBrowser();
    page = await b.newPage();
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36");
    await page.setCookie(
      { name: "CONSENT", value: "YES+", domain: ".google.com", path: "/" },
      { name: "SOCS", value: "CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg", domain: ".google.com", path: "/" },
    );
    const u = new URL(url);
    u.searchParams.set("hl", "en");
    await page.goto(u.toString(), { waitUntil: "domcontentloaded", timeout: timeoutMs });
    const name = norm(String(reviewer || "").trim());
    let text = "";
    while (Date.now() - t0 < timeoutMs) {
      text = String(await page.evaluate(() => document.body ? document.body.innerText : "").catch(() => "")) || "";
      if (GONE.test(text)) return { state: "gone", text: text.replace(/\s+/g, " ").slice(0, 400), ms: Date.now() - t0 };
      // Bewertung angezeigt: Verfassername steht auf der Seite (neben dem Profilnamen)
      if (name.length >= 3 && norm(text).includes(name)) return { state: "visible", text: text.replace(/\s+/g, " ").slice(0, 400), ms: Date.now() - t0 };
      await new Promise((r) => setTimeout(r, 1000));
    }
    return { state: "unknown", text: text.replace(/\s+/g, " ").slice(0, 400), ms: Date.now() - t0, error: "kein eindeutiger Text" };
  } catch (e) {
    return { state: "unknown", text: "", ms: Date.now() - t0, error: String((e as Error)?.message || e).slice(0, 200) };
  } finally {
    try { if (page) await page.close(); } catch { /* */ }
    active--;
    scheduleClose();
  }
}
