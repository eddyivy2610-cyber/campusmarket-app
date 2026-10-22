import React from "react";
import { PageSkeleton } from "./LoadingSystem";

/**
 * Replaces the old full-page blocking spinner with a content-informed
 * skeleton shimmer layout matching Campus Hive 2.0 design rules.
 */
export function GlobalLoader() {
  return (
    <div className="w-full min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] transition-colors">
      <PageSkeleton title={true} cards={8} />
    </div>
  );
}

export default GlobalLoader;
