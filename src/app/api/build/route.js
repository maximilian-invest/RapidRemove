/* Aktuelle Build-Kennung (siehe next.config.mjs). Nie cachen – sonst merkt die App den neuen Deploy nicht. */
export const dynamic = "force-dynamic";

export function GET() {
  return new Response(JSON.stringify({ id: process.env.NEXT_PUBLIC_BUILD_ID || "" }), {
    headers: { "content-type": "application/json", "cache-control": "no-store, max-age=0" },
  });
}
