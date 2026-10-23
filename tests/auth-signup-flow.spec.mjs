import { test, expect } from "@playwright/test";

test.describe("real signup and login auth flow", () => {
  test("signup uses Next auth routes and never creates a demo user", async ({ page }) => {
    const requests = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/")) {
        requests.push({ url: request.url(), method: request.method() });
      }
    });

    await page.goto("/register");
    await page.getByLabel(/full name/i).fill("Dedicated Audit Account");
    await page.getByLabel(/email address/i).fill(`audit-${Date.now()}@example.test`);
    await page.getByLabel(/password/i).fill("AuditPassword123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/verify-email/);
    expect(requests.some((request) => request.url.endsWith("/api/auth/register") && request.method === "POST")).toBeTruthy();
    expect(await page.evaluate(() => localStorage.getItem("campus_user"))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem("campus_token"))).toBeNull();
  });

  test("failed login shows the server error and does not create a demo session", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("wrong@example.test");
    await page.getByLabel(/password/i).fill("WrongPassword123");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/invalid email or password|unable to sign in/i)).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("campus_user"))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem("campus_token"))).toBeNull();
  });
});
