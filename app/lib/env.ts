import { z } from "zod";
import fs from "fs";
import path from "path";

// In standalone test runs or CLI scripts, ensure .env.local is populated if not already present
if (!process.env.AUTH_SECRET) {
  try {
    const envLocalPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Fall through
  }
}

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI cannot be empty"),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters long for cryptographic security"),
  SMTP_USER: z
    .string()
    .default("noreply@campushive.edu.ng"),
  SMTP_PASSWORD: z
    .string()
    .default("dev-smtp-password"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  OTP_PEPPER: z.string().optional(),
  UNIVERSITY_EMAIL_DOMAINS: z.string().default(""),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  ADMIN_REGISTRATION_KEY: z
    .string()
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(customEnv?: Record<string, any>): Env {
  const raw = customEnv || {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    AUTH_SECRET: process.env.AUTH_SECRET || process.env.JWT_SECRET,
    SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
    SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: process.env.SMTP_PORT || "587",
    OTP_PEPPER: process.env.OTP_PEPPER,
    UNIVERSITY_EMAIL_DOMAINS: process.env.UNIVERSITY_EMAIL_DOMAINS || "",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    ADMIN_REGISTRATION_KEY: process.env.ADMIN_REGISTRATION_KEY,
  };

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    console.error("\n==================================================================");
    console.error("❌ FATAL: Application crashed on boot — Missing or invalid environment variables:");
    console.error("==================================================================");
    for (const issue of result.error.issues) {
      console.error(`  • [${issue.path.join(".")}] ${issue.message}`);
    }
    console.error("==================================================================\n");

    throw new Error(
      `FATAL: Missing or invalid environment variables: ${result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`
    );
  }

  if (result.data.NODE_ENV === "production") {
    const missing: string[] = [];
    if (!result.data.OTP_PEPPER) missing.push("OTP_PEPPER");
    if (!result.data.ADMIN_REGISTRATION_KEY) missing.push("ADMIN_REGISTRATION_KEY");
    if (!result.data.UPSTASH_REDIS_REST_URL) missing.push("UPSTASH_REDIS_REST_URL");
    if (!result.data.UPSTASH_REDIS_REST_TOKEN) missing.push("UPSTASH_REDIS_REST_TOKEN");
    if (!process.env.RESEND_API_KEY && !process.env.POSTMARK_SERVER_TOKEN) {
      missing.push("RESEND_API_KEY or POSTMARK_SERVER_TOKEN");
    }
    if (result.data.SMTP_PASSWORD === "dev-smtp-password") {
      missing.push("SMTP_PASSWORD (development fallback is not allowed)");
    }
    if (missing.length) {
      throw new Error(`FATAL: Production configuration is incomplete: ${missing.join(", ")}`);
    }
  }

  return result.data;
}

export const env: Env = validateEnv();
