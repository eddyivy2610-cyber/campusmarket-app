"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading || !user) return;

        // Skip guard for onboarding pages and public/auth pages
        const isPublicPage = ["/login", "/register", "/verify-email", "/forgot-password"].some(p => pathname.startsWith(p));
        const isOnboardingPage = pathname.startsWith("/onboarding");

        if (isPublicPage || isOnboardingPage) return;

        // Only redirect if the user is genuinely stuck mid-seller-flow.
        // "profile_completed" is the normal post-signup state — do NOT redirect.
        if (user.onboardingStep === "onboarding_choice") {
            router.replace("/register/seller");
        }
        // All other states (profile_completed, seller_pending, completed) are fine — allow access.
    }, [user, isLoading, pathname, router]);

    return <>{children}</>;
}
