"use client";

import { usePathname } from "next/navigation";
import { Header } from "../header/Header";
import { FloatingActions } from "../locations/FloatingActions";
import { OnboardingGuard } from "../auth/OnboardingGuard";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith("/dashboard");
    const isMessages = pathname.startsWith("/messages");
    const isAdmin = pathname.startsWith("/admin");
    const isLanding = pathname === "/";

    if (isDashboard || isMessages || isAdmin || isLanding) {
        return (
            <OnboardingGuard>
                {children}
            </OnboardingGuard>
        );
    }

    return (
        <OnboardingGuard>
            <Header />
            <div className="pt-[96px] md:pt-[64px]">
                {children}
            </div>
            <FloatingActions />
        </OnboardingGuard>
    );
}
