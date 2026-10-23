/**
 * Outgoing webhook notifications for new orders.
 *
 * Fires a POST request to GROKBOT_ORDER_WEBHOOK_URL when a new order is created.
 * Fire-and-forget: never blocks, slows down, or breaks the order flow.
 *
 * Environment variables:
 *   GROKBOT_ORDER_WEBHOOK_URL  - Webhook endpoint URL
 *   GROKBOT_ORDER_WEBHOOK_AUTH - Full value for the HTTP Authorization header
 *
 * If either is missing, the webhook is silently skipped.
 */

const WEBHOOK_URL = process.env.GROKBOT_ORDER_WEBHOOK_URL || "";
const WEBHOOK_AUTH = process.env.GROKBOT_ORDER_WEBHOOK_AUTH || "";
const WEBHOOK_TIMEOUT_MS = 5000;

export type OrderWebhookEvent = "order.created";

export interface OrderWebhookPayload {
  event: OrderWebhookEvent;
  timestamp: string;
  order: {
    id: string;
    status: string;
    orderType: "profile_removal" | "profile_restart" | "single_reviews" | "express" | "other";
    service: string;
    businessName: string | null;
    googleProfileUrl: string | null;
    placeId: string | null;
    mapsLink: string | null;
    reviewLinks: string[];
    customer: {
      name: string | null;
      email: string;
      country: string;
    };
    amount: number;
    currency: "EUR" | "USD";
    createdAt: string;
  };
}

/**
 * Determines the order type label for the webhook payload.
 */
function orderTypeOf(service: string | undefined): OrderWebhookPayload["order"]["orderType"] {
  switch (service) {
    case "remove":
      return "profile_removal";
    case "reset":
      return "profile_restart";
    case "reviews":
      return "single_reviews";
    case "express":
      return "express";
    default:
      return "other";
  }
}

/**
 * Extracts review links from the raw order data.
 */
function extractReviewLinks(raw: Record<string, unknown> | null | undefined): string[] {
  if (!raw) return [];
  const items = raw.reviewItems;
  if (!Array.isArray(items)) return [];
  return items
    .map((it: unknown) => {
      if (it && typeof it === "object" && "url" in it) {
        const url = (it as { url?: unknown }).url;
        return typeof url === "string" ? url : null;
      }
      return null;
    })
    .filter((url): url is string => !!url)
    .slice(0, 100);
}

/**
 * Check if webhook is configured.
 */
export function webhookConfigured(): boolean {
  return !!(WEBHOOK_URL && WEBHOOK_AUTH);
}

/**
 * Send a webhook notification for a new order.
 * Fire-and-forget: logs errors but never throws or blocks.
 *
 * @param orderId - The order ID (e.g., "RR-123456")
 * @param orderData - The order data as passed to insertOrder
 * @param logger - Optional logger function
 */
export async function sendOrderWebhook(
  orderId: string,
  orderData: {
    name?: string;
    email?: string;
    company?: string;
    profile?: string;
    country?: string;
    service?: string;
    amount?: number;
    raw?: Record<string, unknown> | null;
  },
  logger?: (msg: string, extra?: Record<string, unknown>) => void
): Promise<void> {
  if (!WEBHOOK_URL || !WEBHOOK_AUTH) {
    return;
  }

  const log = logger || ((msg: string) => console.log(`[orderWebhook] ${msg}`));

  try {
    const raw = orderData.raw || {};
    const country = (orderData.country || "DE").toUpperCase();
    const currency = country === "US" ? "USD" : "EUR";

    const payload: OrderWebhookPayload = {
      event: "order.created",
      timestamp: new Date().toISOString(),
      order: {
        id: orderId,
        status: "new",
        orderType: orderTypeOf(orderData.service),
        service: orderData.service || "unknown",
        businessName: orderData.company || orderData.profile || null,
        googleProfileUrl: (raw.mapsUri as string) || null,
        placeId: (raw.placeId as string) || null,
        mapsLink: (raw.mapsUri as string) || (typeof orderData.profile === "string" && orderData.profile.startsWith("http") ? orderData.profile : null),
        reviewLinks: extractReviewLinks(raw),
        customer: {
          name: orderData.name || null,
          email: orderData.email || "",
          country: country,
        },
        amount: orderData.amount || 0,
        currency: currency as "EUR" | "USD",
        createdAt: new Date().toISOString(),
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": WEBHOOK_AUTH,
          "User-Agent": "RapidRemove-Webhook/1.0",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        log(`Webhook response not OK: ${response.status} ${response.statusText}`, { orderId, status: response.status });
      } else {
        log(`Webhook sent successfully`, { orderId, status: response.status });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if ((fetchError as Error).name === "AbortError") {
        log(`Webhook timed out after ${WEBHOOK_TIMEOUT_MS}ms`, { orderId });
      } else {
        log(`Webhook fetch failed: ${(fetchError as Error).message}`, { orderId, error: (fetchError as Error).message });
      }
    }
  } catch (error) {
    log(`Webhook error: ${(error as Error).message}`, { orderId, error: (error as Error).message });
  }
}
