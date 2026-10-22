"use client";

import React, { createContext, useContext, useState } from "react";
import {
  SUPPORTED_CAMPUSES,
  getCampusBySlug,
  type CampusConfig,
} from "../config/mvpFeatures";

interface CampusContextValue {
  selectedCampus: CampusConfig;
  campuses: CampusConfig[];
  selectCampus: (slug: string) => void;
}

const CampusContext = createContext<CampusContextValue | undefined>(undefined);

const STORAGE_KEY = "campushive_campus_slug_v2";

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

  const selectCampus = (nextSlug: string) => {
    setSlug(nextSlug);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextSlug);
    } catch {
      // Ignore storage write errors
    }
  };

  return (
    <CampusContext.Provider
      value={{
        selectedCampus: getCampusBySlug(slug),
        campuses: SUPPORTED_CAMPUSES,
        selectCampus,
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
    };
  }
  return ctx;
}
