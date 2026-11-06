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

function getStoredAccessToken(isAdminUrl = false): string | null {
  if (typeof window === "undefined") return null;
  try {
    if (isAdminUrl) {
      const adminToken = localStorage.getItem("hive_admin_token");
      if (adminToken) return adminToken;
    }
    return localStorage.getItem("campus_access_token");
  } catch {
    return null;
  }
}

function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem("campus_access_token", token);
    } else {
      localStorage.removeItem("campus_access_token");
    }
  } catch {}
}

async function performSilentRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(normalizeUrl("/api/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData?.token) {
          setStoredAccessToken(refreshData.token);
          if (typeof window !== "undefined" && refreshData.user) {
            window.dispatchEvent(
              new CustomEvent("campus_auth_refreshed", { detail: refreshData.user })
            );
          }
          return true;
        }
      } else if (refreshRes.status === 401 || refreshRes.status === 403) {
        setStoredAccessToken(null);
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

  const isAdminUrl = url.includes("/admin/");
  const storedToken = getStoredAccessToken(isAdminUrl);
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      ...(options.headers ?? {}),
    },
  });

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

  if (
    response.ok &&
    payload &&
    typeof payload === "object" &&
    typeof (payload as { token?: unknown }).token === "string"
  ) {
    setStoredAccessToken((payload as { token: string }).token);
  }

  if (!response.ok) {
    const payloadMessage =
      (payload as { message?: string; error?: string })?.error ||
      (payload as { message?: string; error?: string })?.message;

    const payloadErrors = Array.isArray(
      (payload as { errors?: unknown })?.errors
    )
      ? (payload as { errors: string[] }).errors.join(", ")
      : "";

    const message =
      payloadMessage ||
      payloadErrors ||
      `Request failed (${response.status})`;

    const error: ApiError = new Error(message);
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
