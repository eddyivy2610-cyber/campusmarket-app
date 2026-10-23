export interface UpstashRateLimitResult {
  allowed: boolean;
  count: number;
  retryAfterSeconds: number;
}

const LOGIN_WINDOW_SECONDS = 15 * 60;

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
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
      return { allowed: true, count: 0, retryAfterSeconds: windowSeconds };
    }
    throw new Error("Upstash rate limiting is not configured.");
  }
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSeconds)],
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
  const { url, token } = getUpstashConfig();
  const keys = [
    `campushive:login:email:${email.toLowerCase().trim()}`,
    `campushive:login:ip:${ip || "unknown"}`,
  ];
  const commands = keys.flatMap((key) => [
    ["INCR", key],
    ["EXPIRE", key, String(LOGIN_WINDOW_SECONDS)],
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
  if (!url || !token) throw new Error("Upstash rate limiting is not configured.");
  const keys = [
    `campushive:password-reset:email:${email.toLowerCase().trim()}`,
    `campushive:password-reset:ip:${ip || "unknown"}`,
  ];
  const commands = keys.flatMap((key) => [["INCR", key], ["EXPIRE", key, String(LOGIN_WINDOW_SECONDS)]]);
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
