"use client";

import { usePathname } from "next/navigation";
import { Header } from "../header/Header";
import { FloatingActions } from "../locations/FloatingActions";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith("/dashboard");
    const isMessages = pathname.startsWith("/messages");
    const isAdmin = pathname.startsWith("/admin");

    if (isDashboard || isMessages || isAdmin) {
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
