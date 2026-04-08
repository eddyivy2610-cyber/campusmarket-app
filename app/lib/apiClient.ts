// lib/apiClient.js

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const API_BASE = BASE_URL.endsWith("/api") 
  ? BASE_URL 
  : `${BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL}/api`;

const normalizeUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  
  const prefix = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // If the path already starts with /api and the prefix also ends with /api, 
  // remove the /api from the prefix temporarily for assembly
  if (normalizedPath.startsWith("/api/") && prefix.endsWith("/api")) {
    const basePrefix = prefix.slice(0, -4);
    return `${basePrefix}${normalizedPath}`;
  }
  
  return `${prefix}${normalizedPath}`;
};

const apiRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  // Get token from localStorage if it exists (client-side only)
  const token = typeof window !== 'undefined' ? localStorage.getItem('campus_token') : null;
  
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(normalizeUrl(path), {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const payloadMessage =
      (payload as { message?: string; error?: string })?.message ||
      (payload as { message?: string; error?: string })?.error;

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
