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

        // Skip guard for onboarding pages and public pages
        const isPublicPage = ["/login", "/register", "/verify-email"].some(p => pathname.startsWith(p));
        const isOnboardingPage = pathname.startsWith("/onboarding");
        
        if (isPublicPage || isOnboardingPage) return;

        // Redirect based on onboarding step
        switch (user.onboardingStep) {
            case "otp_verified":
                // They need to finish registration (provide name)
                router.replace("/register");
                break;
            case "profile_completed":
                // They need to choose Buy vs Sell
                router.replace("/register"); // Step 4 in our refactored flow
                break;
            case "onboarding_choice":
                // They chose Sell but didn't finish terms/ID upload
                router.replace("/onboarding/seller");
                break;
            default:
                // completed or seller_pending (already applied)
                break;
        }
    }, [user, isLoading, pathname, router]);

    return <>{children}</>;
}
