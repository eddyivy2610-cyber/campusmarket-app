
/**
 * Provider-agnostic transactional email service.
 *
 * Provider selection:
 * - If SMTP_USER and SMTP_PASS are configured, use SMTP exclusively.
 *   SMTP failure throws; it never silently falls back to Resend/Postmark.
 * - If SMTP is not configured, try Resend, then Postmark.
 * - Development mock is available only when no real provider is configured.
 * - Production never reports a mock email as delivered.
 *
 * Uses native fetch for cloud APIs and Nodemailer for SMTP.
 */

import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailSendResult {
  success: boolean;
  provider: "resend" | "postmark" | "ses" | "smtp" | "development_mock";
  messageId?: string;
  error?: string;
}

const DEFAULT_FROM_ADDRESS =
  process.env.EMAIL_FROM || "CampusHive <auth@campushive.edu.ng>";

/**
 * Sends transactional email via Resend API.
 */
async function sendViaResend(
  apiKey: string,
  options: SendEmailOptions
): Promise<EmailSendResult> {
  const from = options.from || DEFAULT_FROM_ADDRESS;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (res.ok && data?.id) {
    return {
      success: true,
      provider: "resend",
      messageId: data.id,
    };
  }

  throw new Error(`Resend request failed with status ${res.status}`);
}

/**
 * Sends transactional email via Postmark API.
 */
async function sendViaPostmark(
  serverToken: string,
  options: SendEmailOptions
): Promise<EmailSendResult> {
  const from = options.from || DEFAULT_FROM_ADDRESS;

  const res = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": serverToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      From: from,
      To: options.to,
      Subject: options.subject,
      HtmlBody: options.html,
      TextBody: options.text,
      MessageStream: "outbound",
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (res.ok && data?.MessageID) {
    return {
      success: true,
      provider: "postmark",
      messageId: data.MessageID,
    };
  }

  throw new Error(`Postmark request failed with status ${res.status}`);
}

/**
 * Sends transactional email via SMTP.
 *
 * Gmail defaults:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=465
 *
 * Port 465 uses implicit TLS.
 * Port 587 uses STARTTLS.
 *
 * SMTP_FROM defaults to SMTP_USER to avoid accidentally using
 * an unconfigured Campus Hive domain address with Gmail.
 */
async function sendViaSmtp(
  options: SendEmailOptions
): Promise<EmailSendResult> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP credentials are not configured");
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error("Invalid SMTP port configuration");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    tls: {
      minVersion: "TLSv1.2",
    },
  });

  try {
    const info = await transporter.sendMail({
      from: options.from || process.env.SMTP_FROM || user,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (!info.messageId) {
      throw new Error("SMTP did not return a message ID");
    }

    return {
      success: true,
      provider: "smtp",
      messageId: info.messageId,
    };
  } finally {
    // Release the connection after sending. This is suitable
    // for short-lived serverless requests.
    transporter.close();
  }
}

/**
 * Sends transactional email using the configured provider strategy.
 *
 * IMPORTANT: When SMTP credentials exist, SMTP is the exclusive provider.
 * If SMTP fails, this function throws instead of trying Resend or Postmark.
 * This ensures presentation OTP emails cannot silently switch providers.
 *
 * When SMTP credentials are absent, Resend and then Postmark may be used.
 * A development mock is allowed only when no real provider is configured.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<EmailSendResult> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpConfigured = Boolean(smtpUser && smtpPass);

  // 1. If SMTP is configured, use it exclusively. Never fall back to Resend.
  if (smtpConfigured) {
    try {
      return await sendViaSmtp(options);
    } catch {
      // Do not log credentials, recipient addresses, OTPs, or provider bodies.
      console.error("[Email] SMTP delivery failed; no provider fallback attempted.");
      throw new Error("Email service is temporarily unavailable.");
    }
  }

  // 2. SMTP is not configured. Try Resend if configured.
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      return await sendViaResend(resendApiKey, options);
    } catch {
      console.warn("[Email] Resend delivery failed.");
    }
  }

  // 3. Try Postmark only when SMTP is not configured.
  const postmarkToken = process.env.POSTMARK_SERVER_TOKEN;
  if (postmarkToken) {
    try {
      return await sendViaPostmark(postmarkToken, options);
    } catch {
      console.warn("[Email] Postmark delivery failed.");
    }
  }

  // 4. Never simulate successful delivery in production.
  if (process.env.NODE_ENV === "production") {
    if (!resendApiKey && !postmarkToken) {
      console.error("[Email] No transactional email provider is configured.");
    } else {
      console.error("[Email] All configured email providers failed.");
    }

    throw new Error("Email service is temporarily unavailable.");
  }

  // Development mock only when no SMTP credentials are configured and
  // no configured cloud provider succeeded.
  if (process.env.NODE_ENV !== "test") {
    console.info("[Email Mock Dev] Email delivery simulated.");
  }

  return {
    success: true,
    provider: "development_mock",
    messageId: `mock_${Date.now()}`,
  };
}

/**
 * Formats and dispatches a 6-digit OTP verification email.
 */
export async function sendOtpVerificationEmail(
  toEmail: string,
  otpCode: string
): Promise<EmailSendResult> {
  const appBaseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "")
  ).replace(/\/$/, "");

  const logoMarkup = appBaseUrl
    ? `<img src="${appBaseUrl}/logo-light.png" width="140" alt="CampusHive" style="display:block;width:140px;height:auto;margin:0 auto;border:0;" />`
    : `<span style="font-size:24px;font-weight:800;color:#171717;">Campus<span style="color:#ffc928;">Hive</span></span>`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CampusHive Verification Code</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f7f8fa;margin:0;padding:24px;color:#171717;">
  <div style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
    <div style="margin-bottom:24px;text-align:center;">
      ${logoMarkup}
      <p style="color:#6b7280;font-size:14px;margin-top:4px;">Student Marketplace &amp; Community</p>
    </div>

    <div style="border-top:1px solid #f3f4f6;padding-top:24px;margin-bottom:24px;">
      <h3 style="font-size:18px;font-weight:700;margin:0 0 12px;color:#111827;">Confirm your email address</h3>
      <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 20px;">
        Use the 6-digit code below to verify your email address and activate your CampusHive account.
      </p>

      <div style="background-color:#f9fafb;border:2px dashed #d1d5db;border-radius:12px;padding:18px;text-align:center;margin-bottom:20px;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#111827;">${otpCode}</span>
      </div>

      <p style="font-size:13px;color:#6b7280;line-height:1.5;margin:0 0 8px;">
        This code will expire in <strong>10 minutes</strong>.
      </p>
      <p style="font-size:13px;color:#9ca3af;line-height:1.5;margin:0;">
        If you did not request this verification code, you can safely ignore this email.
      </p>
    </div>

    <div style="border-top:1px solid #f3f4f6;padding-top:16px;text-align:center;">
      <p style="font-size:12px;color:#9ca3af;margin:0;">
        CampusHive &bull; Connecting university students across campuses
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text =
    `Your CampusHive verification code is: ${otpCode}\n\n` +
    "This code will expire in 10 minutes. " +
    "If you did not request this, please ignore this email.";

  return sendEmail({
    to: toEmail,
    subject: "Your CampusHive verification code",
    html,
    text,
  });
}

/**
 * Notifies a user that their account already exists.
 */
export async function sendExistingAccountNotice(
  toEmail: string
): Promise<EmailSendResult> {
  return sendEmail({
    to: toEmail,
    subject: "Your CampusHive account already exists",
    html: "<p>We received a new signup request for this email address. If you own the account, sign in or use the password reset flow.</p>",
    text: "We received a new signup request for this email address. If you own the account, sign in or use the password reset flow.",
  });
}

/**
 * Sends a password reset link.
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string
): Promise<EmailSendResult> {
  return sendEmail({
    to: toEmail,
    subject: "Reset your CampusHive password",
    html: `<p>Use the link below to reset your CampusHive password. It expires in 30 minutes and can only be used once.</p><p><a href="${resetUrl}">Reset password</a></p>`,
    text:
      `Reset your CampusHive password: ${resetUrl}\n\n` +
      "This link expires in 30 minutes and can only be used once.",
  });
}

/**
 * Notifies a user that their password has changed.
 */
export async function sendPasswordResetNotice(
  toEmail: string
): Promise<EmailSendResult> {
  return sendEmail({
    to: toEmail,
    subject: "Your CampusHive password was changed",
    html: "<p>Your CampusHive password was changed successfully. If you did not do this, contact CampusHive support immediately.</p>",
    text: "Your CampusHive password was changed successfully. If you did not do this, contact CampusHive support immediately.",
  });
}
