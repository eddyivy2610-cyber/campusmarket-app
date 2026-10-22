"use client";

import React from "react";

/**
 * OnboardingGuard — Disabled for previewing all pages freely without auth/onboarding redirects.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
