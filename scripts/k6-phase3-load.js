/**
 * k6 Load & Performance Benchmark Script for Campus Hive (Phase 3)
 *
 * Traffic Mix:
 * - 30% Global Feed (GET /api/listings?limit=30&status=active)
 * - 20% Filtered Campus + Category Feed (GET /api/listings?campus=ABU+Zaria&category=Electronics&limit=30)
 * - 15% Keyword Search (GET /api/listings?q=laptop&limit=30)
 * - 15% Store Directory (GET /api/stores?campus=ABU+Zaria&limit=20)
 * - 10% Conversation List (GET /api/messages/conversations?limit=30)
 * - 10% Thread Messages (GET /api/messages/conversations/:id/messages?limit=50)
 *
 * Usage against staging / local server:
 *   BASE_URL=https://staging.campushive.edu.ng AUTH_TOKEN=<jwt> CONV_ID=<id> k6 run scripts/k6-phase3-load.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const feedLatency = new Trend("feed_global_duration", true);
const filteredFeedLatency = new Trend("feed_filtered_duration", true);
const searchLatency = new Trend("search_duration", true);
const storesLatency = new Trend("stores_directory_duration", true);
const convListLatency = new Trend("conversations_list_duration", true);
const messagesLatency = new Trend("messages_thread_duration", true);
const errorRate = new Rate("failed_requests");

export const options = {
  stages: [
    { duration: "15s", target: 20 }, // Ramp up to 20 VUs
    { duration: "45s", target: 50 }, // Sustain 50 VUs realistic traffic mix
    { duration: "15s", target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<250", "p(99)<500"],
    failed_requests: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "";
const CONV_ID = __ENV.CONV_ID || "conv-tunde-calculator";

export default function () {
  const headers = AUTH_TOKEN
    ? { Authorization: `Bearer ${AUTH_TOKEN}`, Accept: "application/json" }
    : { Accept: "application/json" };

  const roll = Math.random();

  if (roll < 0.30) {
    // 30%: Global Feed
    const res = http.get(`${BASE_URL}/api/listings?status=active&limit=30`, { headers });
    feedLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    check(res, { "global feed 200": (r) => r.status === 200 });
  } else if (roll < 0.50) {
    // 20%: Campus + Category Feed
    const res = http.get(
      `${BASE_URL}/api/listings?status=active&campus=${encodeURIComponent("ABU Zaria")}&category=Electronics&limit=30`,
      { headers }
    );
    filteredFeedLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    check(res, { "filtered feed 200": (r) => r.status === 200 });
  } else if (roll < 0.65) {
    // 15%: Search
    const res = http.get(`${BASE_URL}/api/listings?status=active&q=laptop&limit=30`, { headers });
    searchLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    check(res, { "search 200": (r) => r.status === 200 });
  } else if (roll < 0.80) {
    // 15%: Store Directory
    const res = http.get(
      `${BASE_URL}/api/stores?campus=${encodeURIComponent("ABU Zaria")}&limit=20`,
      { headers }
    );
    storesLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    check(res, { "store directory 200": (r) => r.status === 200 });
  } else if (roll < 0.90) {
    // 10%: Conversation List
    const res = http.get(`${BASE_URL}/api/messages/conversations?limit=30`, { headers });
    convListLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200 && res.status !== 401);
    check(res, { "conversations 200/401": (r) => r.status === 200 || r.status === 401 });
  } else {
    // 10%: Thread Messages
    const res = http.get(
      `${BASE_URL}/api/messages/conversations/${encodeURIComponent(CONV_ID)}/messages?limit=50`,
      { headers }
    );
    messagesLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200 && res.status !== 401 && res.status !== 404);
    check(res, {
      "messages 200/401/404": (r) => r.status === 200 || r.status === 401 || r.status === 404,
    });
  }

  sleep(0.1);
}
