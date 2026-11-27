export interface UpstashRateLimitResult {
  allowed: boolean;
  count: number;
  retryAfterSeconds: number;
}

const LOGIN_WINDOW_SECONDS = 15 * 60;
const localFallbackCounters = new Map<string, { count: number; expiresAt: number }>();

function checkLocalFallbackLimit(
  key: string,
  limit: number,
  windowSeconds: number
): UpstashRateLimitResult {
  const now = Date.now();
  if (localFallbackCounters.size > 5000) {
    for (const [k, v] of localFallbackCounters) {
      if (v.expiresAt <= now) localFallbackCounters.delete(k);
    }
  }
  const existing = localFallbackCounters.get(key);
  if (!existing || existing.expiresAt <= now) {
    localFallbackCounters.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return { allowed: 1 <= limit, count: 1, retryAfterSeconds: windowSeconds };
  }
  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
  return { allowed: existing.count <= limit, count: existing.count, retryAfterSeconds };
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV !== "production") {
      return null;
    }
    throw new Error("Upstash rate limiting is not configured.");
  }
  return { url, token };
}

export async function checkUpstashLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<UpstashRateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV !== "production") {
      return checkLocalFallbackLimit(key, limit, windowSeconds);
    }
    throw new Error("Upstash rate limiting is not configured.");
  }
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSeconds), "NX"],
    ]),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Upstash rate limiter request failed.");
  const results = (await response.json()) as Array<{ result?: number }>;
  const count = Number(results?.[0]?.result || 0);
  return { allowed: count <= limit, count, retryAfterSeconds: windowSeconds };
}

export async function checkLoginRateLimit(
  email: string,
  ip: string
): Promise<UpstashRateLimitResult> {
  const config = getUpstashConfig();
  if (!config) {
    const emailRes = checkLocalFallbackLimit(
      `campushive:login:email:${email.toLowerCase().trim()}`,
      5,
      LOGIN_WINDOW_SECONDS
    );
    if (!emailRes.allowed) return emailRes;
    return checkLocalFallbackLimit(
      `campushive:login:ip:${ip || "unknown"}`,
      20,
      LOGIN_WINDOW_SECONDS
    );
  }
  const { url, token } = config;
  const keys = [
    `campushive:login:email:${email.toLowerCase().trim()}`,
    `campushive:login:ip:${ip || "unknown"}`,
  ];
  const commands = keys.flatMap((key) => [
    ["INCR", key],
    ["EXPIRE", key, String(LOGIN_WINDOW_SECONDS), "NX"],
  ]);

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Upstash rate limiter request failed.");
  const results = (await response.json()) as Array<{ result?: number }>;
  const emailCount = Number(results?.[0]?.result || 0);
  const ipCount = Number(results?.[2]?.result || 0);
  const count = Math.max(emailCount, ipCount);
  return {
    allowed: emailCount <= 5 && ipCount <= 20,
    count,
    retryAfterSeconds: LOGIN_WINDOW_SECONDS,
  };
}

export async function checkPasswordResetRateLimit(email: string, ip: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV !== "production") {
      const emailRes = checkLocalFallbackLimit(
        `campushive:password-reset:email:${email.toLowerCase().trim()}`,
        3,
        LOGIN_WINDOW_SECONDS
      );
      if (!emailRes.allowed) return emailRes;
      return checkLocalFallbackLimit(
        `campushive:password-reset:ip:${ip || "unknown"}`,
        10,
        LOGIN_WINDOW_SECONDS
      );
    }
    throw new Error("Upstash rate limiting is not configured.");
  }
  const keys = [
    `campushive:password-reset:email:${email.toLowerCase().trim()}`,
    `campushive:password-reset:ip:${ip || "unknown"}`,
  ];
  const commands = keys.flatMap((key) => [
    ["INCR", key],
    ["EXPIRE", key, String(LOGIN_WINDOW_SECONDS), "NX"],
  ]);
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Upstash rate limiter request failed.");
  const results = (await response.json()) as Array<{ result?: number }>;
  const emailCount = Number(results?.[0]?.result || 0);
  const ipCount = Number(results?.[2]?.result || 0);
  return { allowed: emailCount <= 3 && ipCount <= 10, retryAfterSeconds: LOGIN_WINDOW_SECONDS };
}
