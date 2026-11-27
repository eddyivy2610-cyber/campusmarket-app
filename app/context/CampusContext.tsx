"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string>(getInitialSlug);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const selectCampus = useCallback((nextSlug: string) => {
    setSlug(nextSlug);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextSlug);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  // Only runs when explicitly triggered by user action (never auto-prompted on general browsing).
  // Resolves strictly to the nearest campus/university — never exposes precise street/suburb publicly.
  const detectBrowserLocation = useCallback(
    async (manual = false) => {
      if (!manual) return;
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        toast.error("Location is not supported by your browser.");
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
        setDetectedLocation(nearest.shortName);
        try {
          window.localStorage.removeItem(LOCATION_LABEL_KEY);
        } catch {}

        toast.success(`Nearest campus selected: ${nearest.name}.`);
      } catch (err: any) {
        if (err?.code === 1) {
          toast.error("Location permission was denied. You can choose your campus manually.");
        } else {
          toast.error("Could not detect your nearest campus right now.");
        }
      } finally {
        setIsDetectingLocation(false);
      }
    },
    [selectCampus]
  );

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
