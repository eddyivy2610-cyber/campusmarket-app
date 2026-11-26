"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  SUPPORTED_CAMPUSES,
  getCampusBySlug,
  findNearestCampus,
  type CampusConfig,
} from "../config/mvpFeatures";

interface CampusContextValue {
  selectedCampus: CampusConfig;
  campuses: CampusConfig[];
  selectCampus: (slug: string) => void;
  detectedLocation: string | null;
  isDetectingLocation: boolean;
  detectBrowserLocation: (manual?: boolean) => Promise<void>;
}

const CampusContext = createContext<CampusContextValue | undefined>(undefined);

const STORAGE_KEY = "campushive_campus_slug_v2";
const LOCATION_LABEL_KEY = "campushive_detected_location_v1";

function getInitialSlug(): string {
  if (typeof window === "undefined") {
    return "abu-zaria-samaru";
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "abu-zaria-samaru";
  } catch {
    return "abu-zaria-samaru";
  }
}

function getInitialLocationLabel(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCATION_LABEL_KEY);
  } catch {
    return null;
  }
}

async function reverseGeocodeLabel(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lng)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address || {};
    const area = addr.suburb || addr.neighbourhood || addr.town || addr.village || addr.city_district;
    const city = addr.city || addr.state;
    const parts = [area, city].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string>(getInitialSlug);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(
    getInitialLocationLabel
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const selectCampus = useCallback((nextSlug: string) => {
    setSlug(nextSlug);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextSlug);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const detectBrowserLocation = useCallback(
    async (manual = false) => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        if (manual) {
          toast.error("Location is not supported by your browser.");
        }
        return;
      }

      setIsDetectingLocation(true);
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 7000,
            maximumAge: 300000,
          });
        });

        const { latitude, longitude } = position.coords;
        const nearest = findNearestCampus(latitude, longitude);
        selectCampus(nearest.slug);

        const label = (await reverseGeocodeLabel(latitude, longitude)) || nearest.shortName;
        setDetectedLocation(label);
        try {
          window.localStorage.setItem(LOCATION_LABEL_KEY, label);
        } catch {}

        if (manual) {
          toast.success(`Location updated to ${label} (${nearest.shortName}).`);
        }
      } catch (err: any) {
        if (manual) {
          if (err?.code === 1) {
            toast.error("Location permission was denied. You can choose your campus manually.");
          } else {
            toast.error("Could not detect your location right now.");
          }
        }
      } finally {
        setIsDetectingLocation(false);
      }
    },
    [selectCampus]
  );

  useEffect(() => {
    try {
      const hasSaved = Boolean(window.localStorage.getItem(STORAGE_KEY));
      if (!hasSaved) {
        void detectBrowserLocation(false);
      }
    } catch {}
  }, [detectBrowserLocation]);

  return (
    <CampusContext.Provider
      value={{
        selectedCampus: getCampusBySlug(slug),
        campuses: SUPPORTED_CAMPUSES,
        selectCampus,
        detectedLocation,
        isDetectingLocation,
        detectBrowserLocation,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus(): CampusContextValue {
  const ctx = useContext(CampusContext);
  if (!ctx) {
    return {
      selectedCampus: SUPPORTED_CAMPUSES[0],
      campuses: SUPPORTED_CAMPUSES,
      selectCampus: () => {},
      detectedLocation: null,
      isDetectingLocation: false,
      detectBrowserLocation: async () => {},
    };
  }
  return ctx;
}
