// lib/apiClient.js

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

export const BASE_URL =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
const API_BASE = BASE_URL.endsWith("/api") 
  ? BASE_URL 
  : `${BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL}/api`;

const normalizeUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  
  const prefix = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // If the path already starts with /api and the prefix also ends with /api, 
  // remove the /api from the prefix temporarily for assembly
  if (normalizedPath.startsWith("/api/") && prefix.endsWith("/api")) {
    const basePrefix = prefix.slice(0, -4);
    return `${basePrefix}${normalizedPath}`;
  }
  
  return `${prefix}${normalizedPath}`;
};

let refreshPromise: Promise<boolean> | null = null;

import { coalescedRefresh } from "./refreshCoalescer";

// Purge any legacy JWT material from localStorage; auth relies on httpOnly cookies.
function purgeLegacyStoredTokens(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("campus_access_token");
    localStorage.removeItem("hive_admin_token");
  } catch {}
}

async function performSilentRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const result = await coalescedRefresh(
        (u, i) => fetch(u, i),
        normalizeUrl("/api/auth/refresh")
      );
      if (result.ok) {
        purgeLegacyStoredTokens();
        return true;
      }
      if (result.status === 401 || result.status === 403) {
        purgeLegacyStoredTokens();
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export function toFriendlyErrorMessage(raw?: string | null, status?: number): string {
  const msg = (raw || "").trim();
  const lower = msg.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("load failed") ||
    lower.includes("err_network") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout")
  ) {
    return "Unable to connect right now. Please check your internet connection and try again.";
  }

  if (
    lower.includes("csrf") ||
    lower.includes("untrusted origin") ||
    lower.includes("origin_rejected")
  ) {
    return "Your request couldn't be verified. Please refresh the page and try again.";
  }

  if (
    lower.includes("<!doctype") ||
    lower.includes("<html") ||
    lower.includes("prisma") ||
    lower.includes("syntaxerror") ||
    lower.includes("typeerror:") ||
    lower.includes("internal server error") ||
    lower.includes("request failed (5") ||
    (status !== undefined && status >= 500)
  ) {
    if (status === 503 || lower.includes("503")) {
      return "This service is temporarily unavailable. Please try again in a moment.";
    }
    return "Something went wrong on our end. Please try again shortly.";
  }

  if (status === 429 || lower.includes("too many requests") || lower.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (
    lower.includes("jwt") ||
    lower.includes("token expired") ||
    lower === "unauthorized" ||
    lower.includes("invalid token")
  ) {
    return "Your session has expired. Please sign in again.";
  }

  if (lower === "forbidden" || lower.includes("forbidden:")) {
    return "You don't have permission to perform this action.";
  }

  if (!msg || /^request failed \(\d+\)$/i.test(msg) || /^[a-z0-9_]+$/.test(msg)) {
    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You don't have permission to perform this action.";
    if (status === 404) return "We couldn't find what you were looking for.";
    if (status !== undefined && status >= 400 && status < 500) {
      return "Please check your details and try again.";
    }
    return "Something went wrong. Please try again.";
  }

  return msg;
}

const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> => {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const url = normalizeUrl(path);
  if (process.env.NODE_ENV === 'development') {
    console.log(`[apiClient] ${options.method || 'GET'} ${url}`);
  }

  purgeLegacyStoredTokens();
  let response: Response;
  try {
    response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers ?? {}),
      },
    });
  } catch (err: any) {
    const friendly = toFriendlyErrorMessage(err?.message);
    const error: ApiError = new Error(friendly);
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();
  const expectsJson = contentType.includes("application/json");

  // Handle silent token refresh on 401 Unauthorized for client-side requests
  if (
    response.status === 401 &&
    !isRetry &&
    typeof window !== "undefined" &&
    !url.includes("/auth/login") &&
    !url.includes("/auth/refresh") &&
    !url.includes("/admin/auth/signin") &&
    !url.includes("/admin/auth/refresh")
  ) {
    const refreshed = await performSilentRefresh();
    if (refreshed) {
      // The refreshed access token is delivered in an httpOnly cookie and stored locally.
      return apiRequest<T>(path, options, true);
    }
  }

  let payload: unknown = rawBody;
  if (expectsJson && rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      // Keep raw text payload when server returns invalid JSON.
      payload = rawBody;
    }
  } else if (expectsJson && !rawBody) {
    payload = null;
  }

  if (!response.ok) {
    const rawErr = (payload as { error?: string })?.error;
    const rawMsg = (payload as { message?: string })?.message;
    const isCodeOnly = typeof rawErr === "string" && /^[a-z0-9_ ]{1,32}$/.test(rawErr);
    const payloadMessage = isCodeOnly ? rawMsg || rawErr : rawErr || rawMsg;

    const payloadErrors = Array.isArray(
      (payload as { errors?: unknown })?.errors
    )
      ? (payload as { errors: string[] }).errors.join(", ")
      : "";

    const rawMessage =
      payloadMessage ||
      payloadErrors ||
      `Request failed (${response.status})`;

    const error: ApiError = new Error(
      toFriendlyErrorMessage(rawMessage, response.status)
    );
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload as T;
};

export const apiGet = <T>(path: string, options?: RequestInit) =>
  apiRequest<T>(path, { ...options, method: "GET" });

export const apiPost = <T>(
  path: string,
  body?: unknown,
  options?: RequestInit
) =>
  apiRequest<T>(path, {
    ...options,
    method: "POST",
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  });

export const apiPatch = <T>(
  path: string,
  body?: unknown,
  options?: RequestInit
) =>
  apiRequest<T>(path, {
    ...options,
    method: "PATCH",
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  });

export const apiPut = <T>(
  path: string,
  body?: unknown,
  options?: RequestInit
) =>
  apiRequest<T>(path, {
    ...options,
    method: "PUT",
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  });

export const apiDelete = <T>(path: string, options?: RequestInit) =>
  apiRequest<T>(path, { ...options, method: "DELETE" });
