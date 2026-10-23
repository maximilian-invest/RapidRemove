#!/usr/bin/env npx tsx
/**
 * Test script to send a sample webhook payload.
 *
 * Usage:
 *   npx tsx ops/src/testWebhook.ts [TARGET_URL] [AUTH_HEADER]
 *
 * If no arguments provided, uses GROKBOT_ORDER_WEBHOOK_URL and GROKBOT_ORDER_WEBHOOK_AUTH
 * from the environment.
 *
 * Example:
 *   npx tsx ops/src/testWebhook.ts https://example.com/webhook "Bearer my-token"
 */
import "dotenv/config";
import type { OrderWebhookPayload } from "./orderWebhook";

const TARGET_URL = process.argv[2] || process.env.GROKBOT_ORDER_WEBHOOK_URL || "";
const AUTH_HEADER = process.argv[3] || process.env.GROKBOT_ORDER_WEBHOOK_AUTH || "";

const samplePayload: OrderWebhookPayload = {
  event: "order.created",
  timestamp: new Date().toISOString(),
  order: {
    id: "RR-TEST01",
    status: "new",
    orderType: "profile_removal",
    service: "remove",
    businessName: "Test Business GmbH",
    googleProfileUrl: "https://maps.app.goo.gl/testExample123",
    placeId: "ChIJtest123456789",
    mapsLink: "https://www.google.com/maps/place/Test+Business",
    reviewLinks: [],
    customer: {
      name: "Max Mustermann",
      email: "test@example.com",
      country: "AT",
    },
    amount: 450,
    currency: "EUR",
    createdAt: new Date().toISOString(),
  },
};

const samplePayloadReviews: OrderWebhookPayload = {
  event: "order.created",
  timestamp: new Date().toISOString(),
  order: {
    id: "RR-TEST02",
    status: "new",
    orderType: "single_reviews",
    service: "reviews",
    businessName: "Test Restaurant",
    googleProfileUrl: "https://maps.app.goo.gl/testRestaurant",
    placeId: "ChIJtest987654321",
    mapsLink: "https://www.google.com/maps/place/Test+Restaurant",
    reviewLinks: [
      "https://maps.app.goo.gl/review1",
      "https://maps.app.goo.gl/review2",
    ],
    customer: {
      name: "Jane Doe",
      email: "jane@example.com",
      country: "US",
    },
    amount: 358,
    currency: "USD",
    createdAt: new Date().toISOString(),
  },
};

async function main() {
  if (!TARGET_URL) {
    console.error("Error: No target URL provided.");
    console.error("Usage: npx tsx ops/src/testWebhook.ts [TARGET_URL] [AUTH_HEADER]");
    console.error("   Or set GROKBOT_ORDER_WEBHOOK_URL in environment.");
    process.exit(1);
  }

  if (!AUTH_HEADER) {
    console.error("Warning: No Authorization header provided. Request may be rejected.");
  }

  console.log("=== Order Webhook Test ===\n");
  console.log("Target URL:", TARGET_URL);
  console.log("Auth header:", AUTH_HEADER ? `${AUTH_HEADER.slice(0, 20)}...` : "(none)");
  console.log("");

  const payloads = [
    { name: "Profile Removal Order", payload: samplePayload },
    { name: "Single Reviews Order", payload: samplePayloadReviews },
  ];

  for (const { name, payload } of payloads) {
    console.log(`\n--- Sending: ${name} ---`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(TARGET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(AUTH_HEADER ? { Authorization: AUTH_HEADER } : {}),
          "User-Agent": "RapidRemove-Webhook-Test/1.0",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log(`\nResponse: ${response.status} ${response.statusText}`);
      if (text) {
        try {
          console.log("Body:", JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          console.log("Body:", text.slice(0, 500));
        }
      }
    } catch (error) {
      console.error("Error:", (error as Error).message);
    }
  }

  console.log("\n=== Done ===");
}

main().catch(console.error);
