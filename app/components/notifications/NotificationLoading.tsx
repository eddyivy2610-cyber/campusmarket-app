import React from "react";

export function NotificationSkeletons({ compact = false, count = 4 }: { compact?: boolean; count?: number }) {
  return (
    <div aria-label="Loading notifications" aria-busy="true" role="status" className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 ${
            compact ? "p-3.5" : "p-4 sm:p-5"
          } flex items-start gap-3.5`}
        >
          {/* Circular icon skeleton */}
          <div className="hive-skeleton w-9 h-9 rounded-xl shrink-0" />

          {/* Text rows skeleton */}
          <div className="flex-1 space-y-2.5 pt-0.5">
            <div className="flex items-center justify-between gap-3">
              <div className={`hive-skeleton h-4 rounded-md ${index % 2 === 0 ? "w-1/2" : "w-2/5"}`} />
              <div className="hive-skeleton h-3 w-14 rounded" />
            </div>
            <div className="hive-skeleton h-3.5 w-4/5 rounded" />
            <div className="flex items-center gap-3 pt-1">
              <div className="hive-skeleton h-5 w-20 rounded-md" />
              <div className="hive-skeleton h-4 w-16 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationLoadingDots() {
  return (
    <span aria-label="Working..." role="status" className="three-dots-pulse text-inherit">
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span className="sr-only">Working...</span>
    </span>
  );
}
