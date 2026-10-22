/**
 * Structured Logger with automatic sensitive data redaction.
 * Prevents leakage of tokens, passwords, cookies, or secrets in logs.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "jwt",
  "apikey",
  "api_key",
  "accesstoken",
  "refreshtoken",
  "creditcard",
]);

/**
 * Recursively deep-clones an object while redacting sensitive values.
 */
export function redactSensitiveData(data: any, depth = 0): any {
  if (depth > 5) return "[DeepObject]";
  if (data === null || data === undefined) return data;
  if (typeof data === "string") {
    // Redact Bearer tokens in raw strings
    if (data.toLowerCase().startsWith("bearer ")) {
      return "Bearer [REDACTED]";
    }
    return data;
  }
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, depth + 1));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = redactSensitiveData(value, depth + 1);
    }
  }

  return sanitized;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  path?: string;
  [key: string]: any;
}

class Logger {
  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): string {
    const payload: Record<string, any> = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      payload.context = redactSensitiveData(context);
    }

    if (error) {
      payload.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
      };
    }

    if (process.env.NODE_ENV === "production") {
      return JSON.stringify(payload);
    }

    const reqId = context?.requestId ? `[${context.requestId.slice(0, 8)}] ` : "";
    return `[${payload.timestamp}] [${level.toUpperCase()}] ${reqId}${message} ${
      context && Object.keys(context).length > 0 ? JSON.stringify(redactSensitiveData(context)) : ""
    }${error ? `\n${error.stack || error.message}` : ""}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatLog("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatLog("warn", message, context));
  }

  error(message: string, context?: LogContext, error?: Error): void {
    console.error(this.formatLog("error", message, context, error));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatLog("debug", message, context));
    }
  }
}

export const logger = new Logger();
export default logger;
