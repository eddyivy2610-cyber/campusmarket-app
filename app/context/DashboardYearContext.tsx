"use client";

import { createContext } from "react";

export interface DashboardYearContextValue {
    year: number;
    setYear: (year: number) => void;
}

export const DashboardYearContext = createContext<DashboardYearContextValue>({
    year: new Date().getFullYear(),
    setYear: () => {},
});
