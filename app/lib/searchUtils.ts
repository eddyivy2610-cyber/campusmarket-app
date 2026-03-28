import { apiGet } from "./apiClient";
import type { Product } from "../data/types";
import type { Profile } from "../data/profiles";

type SearchType = "products" | "profiles";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const deriveArray = <T>(payload: unknown, type: SearchType): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isPlainObject(payload)) {
    return [];
  }

  if (type in payload && Array.isArray(payload[type])) {
    return payload[type] as T[];
  }

  const candidates = ["data", "results", "items", "docs", "records", "payload"];
  for (const key of candidates) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      const nested = deriveArray<T>((payload as Record<string, unknown>)[key], type);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
};

const buildSearchUrl = (query: string, type: SearchType) => {
  const params = new URLSearchParams({
    q: query,
    type,
  });

  return `/api/search?${params.toString()}`;
};

const performSearch = async <T>(
  query: string,
  type: SearchType
): Promise<T[]> => {
  if (!query.trim()) {
    return [];
  }

  try {
    const payload = await apiGet<unknown>(buildSearchUrl(query, type));
    return deriveArray<T>(payload, type);
  } catch (error) {
    console.error(`[searchUtils] ${type} search failed`, error);
    return [];
  }
};

export const searchProducts = (query: string) =>
  performSearch<Product>(query, "products");

export const searchProfiles = (query: string) =>
  performSearch<Profile>(query, "profiles");
