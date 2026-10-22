"use client";

import { usePathname } from "next/navigation";
import { Header } from "../header/Header";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "";

    // Only legacy pages that do not render their own RebrandHeader need LayoutWrapper's Header
    const needsLegacyHeader =
        pathname.startsWith("/saved") ||
        pathname.startsWith("/categories") ||
        pathname.startsWith("/services");

    if (needsLegacyHeader) {
        return (
            <>
                <Header />
                <div className="pt-[96px] md:pt-[64px]">
                    {children}
                </div>
            </>
        );
    }

    return <>{children}</>;
}
