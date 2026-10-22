import React from "react";

/**
 * Campus Hive 2.0 Unified Loading System
 * Skeletons for content/pages, small rings for buttons, and three-dot pulse for actions.
 */

// 1. Single Listing / Storefront Card Skeleton
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 sm:p-3.5 space-y-3 ${className}`}
    >
      {/* Product Image Box */}
      <div className="hive-skeleton aspect-4/3 w-full rounded-xl" />

      {/* Meta: Title & Price */}
      <div className="space-y-2">
        <div className="hive-skeleton h-4 w-4/5 rounded-md" />
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="hive-skeleton h-4.5 w-1/3 rounded-md" />
          <div className="hive-skeleton h-3.5 w-1/4 rounded-md" />
        </div>
      </div>

      {/* Seller info footer */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#F2F4F7] dark:border-white/5">
        <div className="hive-skeleton w-5 h-5 rounded-full shrink-0" />
        <div className="hive-skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

// 2. Full Page Content Skeleton (Explore, Search, Stores, Categories, Default Route)
export function PageSkeleton({
  title = true,
  cards = 8,
}: {
  title?: boolean;
  cards?: number;
}) {
  return (
    <div
      aria-label="Loading content..."
      aria-busy="true"
      role="status"
      className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 pb-16 space-y-6"
    >
      {/* Top Header Placeholder */}
      {title && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="hive-skeleton h-6 w-48 rounded-lg" />
              <div className="hive-skeleton h-3.5 w-72 rounded-md" />
            </div>
            <div className="hidden sm:block flex-1 h-[1px] bg-[#ECEEF2] dark:bg-white/10" />
            <div className="hive-skeleton h-8 w-24 rounded-lg shrink-0" />
          </div>

          {/* Filter / Category Pills Placeholder */}
          <div className="flex items-center gap-2 overflow-hidden py-1">
            {[72, 96, 84, 110, 64, 90].map((width, idx) => (
              <div
                key={idx}
                style={{ width }}
                className="hive-skeleton h-8 rounded-full shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Responsive Card Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {Array.from({ length: cards }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// 3. Settings Shell Skeleton
export function SettingsSkeleton() {
  return (
    <div
      aria-label="Loading settings..."
      aria-busy="true"
      role="status"
      className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 pb-16"
    >
      {/* Header bar */}
      <div className="hive-skeleton h-7 w-40 rounded-lg mb-2" />
      <div className="hive-skeleton h-4 w-64 rounded mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Nav Column */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="hive-skeleton h-10 w-full rounded-xl" />
          ))}
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-3 radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-6 space-y-5">
          <div className="hive-skeleton h-5 w-44 rounded-md" />
          <div className="hive-skeleton h-3.5 w-3/4 rounded" />
          <div className="space-y-3 pt-3">
            <div className="hive-skeleton h-11 w-full rounded-xl" />
            <div className="hive-skeleton h-11 w-full rounded-xl" />
            <div className="hive-skeleton h-24 w-full rounded-xl" />
          </div>
          <div className="flex justify-end pt-2">
            <div className="hive-skeleton h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Radar / Feed Items Skeleton
export function RadarSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      aria-label="Loading radar items..."
      aria-busy="true"
      role="status"
      className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 pb-16 space-y-4"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="space-y-1.5">
          <div className="hive-skeleton h-6 w-36 rounded-lg" />
          <div className="hive-skeleton h-3.5 w-60 rounded-md" />
        </div>
        <div className="hidden sm:block flex-1 h-[1px] bg-[#ECEEF2] dark:bg-white/10" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="hive-skeleton w-9 h-9 rounded-full" />
                <div className="space-y-1">
                  <div className="hive-skeleton h-3.5 w-28 rounded" />
                  <div className="hive-skeleton h-2.5 w-20 rounded" />
                </div>
              </div>
              <div className="hive-skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="hive-skeleton h-4 w-4/5 rounded" />
            <div className="hive-skeleton h-3.5 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. Auth Card Skeleton (Verify Email, Login, Signup)
export function AuthCardSkeleton() {
  return (
    <div
      aria-label="Loading authentication..."
      aria-busy="true"
      role="status"
      className="min-h-[70vh] flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-md radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-6 sm:p-8 space-y-5">
        <div className="hive-skeleton w-12 h-12 rounded-2xl mx-auto" />
        <div className="space-y-2 text-center">
          <div className="hive-skeleton h-5 w-48 rounded-md mx-auto" />
          <div className="hive-skeleton h-3.5 w-64 rounded mx-auto" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="hive-skeleton h-11 w-full rounded-xl" />
          <div className="hive-skeleton h-11 w-full rounded-xl" />
        </div>
        <div className="hive-skeleton h-10 w-full rounded-xl mt-4" />
      </div>
    </div>
  );
}

// 6. Three-Dot Pulse for Actions & Lightweight Loading States
export function ThreeDotsPulse({
  className = "",
  label = "Working...",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`three-dots-pulse text-inherit ${className}`}
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

// 7. Small Ring Spinner for Buttons (Tight, unobtrusive action feedback)
export function ButtonRing({
  size = "sm",
  className = "",
  label = "Processing...",
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
  label?: string;
}) {
  const sizeClasses = {
    xs: "w-3 h-3 border-[1.5px]",
    sm: "w-4 h-4 border-2",
    md: "w-5 h-5 border-[2.5px]",
  };

  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`btn-ring ${sizeClasses[size]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
