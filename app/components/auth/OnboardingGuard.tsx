"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        const isPublicPage = ["/login", "/register", "/verify-email", "/forgot-password"].some((p) =>
            pathname.startsWith(p)
        );
        const isOnboardingPage = pathname.startsWith("/onboarding");

        const protectedPrefixes = [
            "/settings",
            "/messages",
            "/profile",
            "/saved",
            "/notifications",
            "/dashboard",
            "/manage-listings",
            "/cart",
        ];
        const isProtectedPage = protectedPrefixes.some((p) => pathname.startsWith(p));

        if (!user && isProtectedPage) {
            const next = encodeURIComponent(pathname);
            router.replace(`/login?next=${next}`);
            return;
        }

        if (isPublicPage || isOnboardingPage) return;
        if (!user) return;

        // Redirect only mid-seller-flow users to the seller registration path.
        if (user.onboardingStep === "onboarding_choice") {
            router.replace("/register/seller");
        }
    }, [user, isLoading, pathname, router]);

    return <>{children}</>;
}
