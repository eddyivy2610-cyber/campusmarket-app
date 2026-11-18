import { test, expect } from "@playwright/test";
import mongoose from "mongoose";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campushive_test";

test("two browser tabs in one context coalesce simultaneous refresh and keep session active", async ({ browser }) => {
  const email = `pw_twotab_${Date.now()}@example.test`;
  const password = "TestPassword123!";

  const context = await browser.newContext();
  const page1 = await context.newPage();
  const page2 = await context.newPage();

  try {
    // 1. Register user via API
    const regRes = await page1.request.post(`${BASE_URL}/api/auth/register`, {
      data: { fullName: "Two Tab Playwright", email, password },
    });
    expect([200, 201]).toContain(regRes.status());

    // 2. Activate user in MongoDB
    await mongoose.connect(MONGODB_URI);
    await mongoose.connection.db.collection("users").updateOne(
      { email },
      { $set: { emailVerified: true, accountStatus: "active" } }
    );

    // 3. Sign in via browser context so the context holds the real httpOnly refreshToken cookie
    const loginRes = await page1.request.post(`${BASE_URL}/api/auth/login`, {
      data: { email, password },
    });
    expect(loginRes.status()).toBe(200);
    const loginJson = await loginRes.json();

    // Pre-seed campus_user in localStorage on the origin so both tabs restore & trigger AuthContext refresh
    await page1.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page1.evaluate((u) => {
      localStorage.setItem("campus_user", JSON.stringify(u));
      localStorage.removeItem("campus_auth_last_refresh");
    }, loginJson.user);

    // 4. Count server refresh requests across both tabs
    let serverRefreshRequests = 0;
    context.on("request", (req) => {
      if (req.url().includes("/api/auth/refresh") && req.method() === "POST") {
        serverRefreshRequests += 1;
      }
    });
    context.on("response", (res) => {
      if (res.url().includes("/api/auth/refresh") && res.request().method() === "POST") {
        console.log("[PW refresh response]", res.status());
      }
    });

    // 5. Force simultaneous AuthContext mount refresh in both tabs
    const refreshDone = context.waitForEvent(
      "response",
      (res) => res.url().includes("/api/auth/refresh") && res.request().method() === "POST"
    );
    await Promise.all([
      page1.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" }),
      page2.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" }),
      refreshDone,
    ]);

    // Give any queued coalesced microtasks a moment to settle
    await page1.waitForTimeout(1000);

    expect(serverRefreshRequests).toBe(1);

    // 6. Neither tab was logged out, and campus_auth_last_refresh stores ONLY a numeric timestamp
    const [state1, state2] = await Promise.all([
      page1.evaluate(() => ({
        user: localStorage.getItem("campus_user"),
        lastRefresh: localStorage.getItem("campus_auth_last_refresh"),
      })),
      page2.evaluate(() => ({
        user: localStorage.getItem("campus_user"),
        lastRefresh: localStorage.getItem("campus_auth_last_refresh"),
      })),
    ]);

    expect(state1.user).toBeTruthy();
    expect(state2.user).toBeTruthy();
    expect(state1.lastRefresh).toMatch(/^\d+$/);
    expect(state2.lastRefresh).toMatch(/^\d+$/);

    // 7. Rotated cookie in browser context remains valid afterwards (family NOT revoked)
    const followUpStatus = await page2.evaluate(() =>
      fetch("/api/auth/refresh", { method: "POST", credentials: "include" }).then((r) => r.status)
    );
    expect(followUpStatus).toBe(200);
  } finally {
    await mongoose.connection.db?.collection("users").deleteOne({ email }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    await context.close();
  }
});
