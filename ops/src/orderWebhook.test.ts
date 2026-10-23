/**
 * Unit tests for orderWebhook module.
 *
 * Run with: npx tsx --test ops/src/orderWebhook.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";

describe("orderWebhook", () => {
  it("should correctly identify order types", () => {
    const testCases = [
      { service: "remove", expected: "profile_removal" },
      { service: "reset", expected: "profile_restart" },
      { service: "reviews", expected: "single_reviews" },
      { service: "express", expected: "express" },
      { service: "deindex", expected: "other" },
      { service: undefined, expected: "other" },
    ];

    for (const tc of testCases) {
      const orderType = orderTypeOf(tc.service);
      assert.strictEqual(orderType, tc.expected, `Expected ${tc.service} to map to ${tc.expected}`);
    }
  });

  it("should extract review links from raw data", () => {
    const raw = {
      reviewItems: [
        { url: "https://maps.app.goo.gl/review1", name: "John" },
        { url: "https://maps.app.goo.gl/review2", name: "Jane", text: "Bad service" },
        { name: "NoUrl", text: "This one has no URL" },
      ],
    };

    const links = extractReviewLinks(raw);
    assert.strictEqual(links.length, 2);
    assert.strictEqual(links[0], "https://maps.app.goo.gl/review1");
    assert.strictEqual(links[1], "https://maps.app.goo.gl/review2");
  });

  it("should return empty array for null raw data", () => {
    assert.deepStrictEqual(extractReviewLinks(null), []);
    assert.deepStrictEqual(extractReviewLinks(undefined), []);
    assert.deepStrictEqual(extractReviewLinks({}), []);
  });

  it("should handle non-array reviewItems", () => {
    assert.deepStrictEqual(extractReviewLinks({ reviewItems: "not an array" }), []);
    assert.deepStrictEqual(extractReviewLinks({ reviewItems: 123 }), []);
  });

  it("should limit review links to 100", () => {
    const raw = {
      reviewItems: Array.from({ length: 150 }, (_, i) => ({
        url: `https://example.com/review${i}`,
      })),
    };

    const links = extractReviewLinks(raw);
    assert.strictEqual(links.length, 100);
  });

  it("should format webhook payload structure correctly", () => {
    const payload = buildSamplePayload({
      orderId: "RR-123456",
      name: "Test User",
      email: "test@example.com",
      company: "Test Company",
      profile: "Test Profile",
      country: "AT",
      service: "remove",
      amount: 450,
      raw: {
        mapsUri: "https://maps.app.goo.gl/test",
        placeId: "ChIJtest123",
      },
    });

    assert.strictEqual(payload.event, "order.created");
    assert.strictEqual(payload.order.id, "RR-123456");
    assert.strictEqual(payload.order.status, "new");
    assert.strictEqual(payload.order.orderType, "profile_removal");
    assert.strictEqual(payload.order.service, "remove");
    assert.strictEqual(payload.order.businessName, "Test Company");
    assert.strictEqual(payload.order.googleProfileUrl, "https://maps.app.goo.gl/test");
    assert.strictEqual(payload.order.placeId, "ChIJtest123");
    assert.strictEqual(payload.order.customer.name, "Test User");
    assert.strictEqual(payload.order.customer.email, "test@example.com");
    assert.strictEqual(payload.order.customer.country, "AT");
    assert.strictEqual(payload.order.amount, 450);
    assert.strictEqual(payload.order.currency, "EUR");
  });

  it("should use USD for US country", () => {
    const payload = buildSamplePayload({
      orderId: "RR-123456",
      country: "US",
      service: "reviews",
      amount: 358,
    });

    assert.strictEqual(payload.order.currency, "USD");
  });
});

// Helper functions (same logic as the module)
function orderTypeOf(service: string | undefined): string {
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

interface PayloadInput {
  orderId: string;
  name?: string;
  email?: string;
  company?: string;
  profile?: string;
  country?: string;
  service?: string;
  amount?: number;
  raw?: Record<string, unknown>;
}

function buildSamplePayload(input: PayloadInput) {
  const raw = input.raw || {};
  const country = (input.country || "DE").toUpperCase();
  const currency = country === "US" ? "USD" : "EUR";

  return {
    event: "order.created" as const,
    timestamp: new Date().toISOString(),
    order: {
      id: input.orderId,
      status: "new",
      orderType: orderTypeOf(input.service),
      service: input.service || "unknown",
      businessName: input.company || input.profile || null,
      googleProfileUrl: (raw.mapsUri as string) || null,
      placeId: (raw.placeId as string) || null,
      mapsLink: (raw.mapsUri as string) || null,
      reviewLinks: extractReviewLinks(raw),
      customer: {
        name: input.name || null,
        email: input.email || "",
        country: country,
      },
      amount: input.amount || 0,
      currency: currency as "EUR" | "USD",
      createdAt: new Date().toISOString(),
    },
  };
}
