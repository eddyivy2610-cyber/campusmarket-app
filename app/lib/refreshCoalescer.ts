export interface CoalescedRefreshResult {
  ok: boolean;
  status: number;
  token?: string;
  user?: any;
  coalescedFromPeer?: boolean;
}

const REFRESH_LOCK_NAME = "campus_hive_auth_refresh_lock";
const LAST_REFRESH_KEY = "campus_auth_last_refresh";
const RECENT_REFRESH_WINDOW_MS = 3000;

let inTabPromise: Promise<CoalescedRefreshResult> | null = null;

async function withCrossTabLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request(REFRESH_LOCK_NAME, fn);
  }
  return fn();
}

function readRecentRefresh(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_REFRESH_KEY);
    if (!raw) return null;
    const at = Number(raw);
    if (Number.isFinite(at) && Date.now() - at < RECENT_REFRESH_WINDOW_MS) {
      return at;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

function writeRecentRefresh(token: string | undefined): void {
  if (typeof window === "undefined") return;
  try {
    // Store ONLY the numeric timestamp in campus_auth_last_refresh (never token material)
    window.localStorage.setItem(LAST_REFRESH_KEY, String(Date.now()));
    if (token) {
      window.localStorage.setItem("campus_access_token", token);
    }
  } catch {
    // ignore storage errors
  }
}

export function clearCoalescedRefreshState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LAST_REFRESH_KEY);
  } catch {}
}

/**
 * Coalesces concurrent refresh requests both within a single tab (promise deduplication)
 * and across browser tabs (navigator.locks + short recent-refresh cache in localStorage),
 * preventing rotating refresh token reuse revocation when two tabs refresh simultaneously.
 */
export async function coalescedRefresh(
  fetcher: (url: string, init: RequestInit) => Promise<Response> = (u, i) => fetch(u, i),
  refreshUrl = "/api/auth/refresh"
): Promise<CoalescedRefreshResult> {
  if (inTabPromise) return inTabPromise;

  inTabPromise = withCrossTabLock(async () => {
    const recentAt = readRecentRefresh();
    if (recentAt !== null) {
      return {
        ok: true,
        status: 200,
        coalescedFromPeer: true,
      };
    }

    const res = await fetcher(refreshUrl, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      writeRecentRefresh(data?.token);
      if (typeof window !== "undefined" && data?.user) {
        window.dispatchEvent(
          new CustomEvent("campus_auth_refreshed", { detail: data.user })
        );
      }
      return {
        ok: true,
        status: res.status,
        token: data?.token,
        user: data?.user,
      };
    }

    if (res.status === 401 || res.status === 403) {
      clearCoalescedRefreshState();
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem("campus_access_token");
        } catch {}
      }
    }

    return { ok: false, status: res.status };
  }).finally(() => {
    inTabPromise = null;
  });

  return inTabPromise;
}
