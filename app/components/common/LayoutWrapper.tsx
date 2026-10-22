"use client";

import { usePathname } from "next/navigation";
import { Header } from "../header/Header";
import { FloatingActions } from "../locations/FloatingActions";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith("/dashboard");
    const isMessages = pathname.startsWith("/messages");
    const isAdmin = pathname.startsWith("/admin");
    const isLanding = pathname === "/";
    const isHome = pathname.startsWith("/home") || pathname.startsWith("/temp-home");
    const isExplore = pathname.startsWith("/explore");
    const isWanted = pathname.startsWith("/wanted") || pathname.startsWith("/radar");
    const isStores = pathname.startsWith("/stores");
    const isSearch = pathname.startsWith("/search");
    const isListings = pathname.startsWith("/listings");
    const isProfile = pathname.startsWith("/profile");
    const isSettings = pathname.startsWith("/settings");
    const isAuth =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/verify-email") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/forgot-password");

    if (
        isDashboard ||
        isMessages ||
        isAdmin ||
        isLanding ||
        isHome ||
        isExplore ||
        isWanted ||
        isStores ||
        isSearch ||
        isListings ||
        isProfile ||
        isSettings ||
        isAuth
    ) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <div className="pt-[96px] md:pt-[64px]">
                {children}
            </div>
            <FloatingActions />
        </>
    );
}
