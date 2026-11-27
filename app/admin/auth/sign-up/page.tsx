// Server component — reads live DB flag on every request (no caching).
import { notFound } from "next/navigation";
import AdminSignUpClient from "./_client";

export const dynamic = "force-dynamic";

async function isSignupEnabled(): Promise<boolean> {
  try {
    // Call our own Next.js API route (proxy to Express backend).
    // No auth token needed — the backend returns only the public-safe
    // admin_signup_enabled key for unauthenticated callers.
    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    const res = await fetch(`${base}/api/admin/settings`, {
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = await res.json();
    const settings: { key: string; value: string }[] = json?.data ?? [];
    const row = settings.find((s) => s.key === "admin_signup_enabled");
    return row?.value === "true";
  } catch {
    return false;
  }
}

export default async function AdminSignUpPage() {
  // Hard env-var override — if explicitly set to "false", always 404.
  const hardDisabled = process.env.ADMIN_SIGNUP_ENABLED === "false";
  if (hardDisabled) notFound();

  const enabled = await isSignupEnabled();
  if (!enabled) notFound();

  return <AdminSignUpClient />;
}
