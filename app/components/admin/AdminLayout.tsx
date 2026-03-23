"use client";

import React from "react";
import AdminSidebar from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { usePathname, useRouter } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        // @DEV: Temporarily bypassing auth for testing
        // const session = getAdminSession();
        // if (!session) {
        //     const next = encodeURIComponent(pathname || "/admin");
        //     router.replace(`/admin/auth/sign-in?next=${next}`);
        //     return;
        // }
        setIsReady(true);
    }, [pathname, router]);

    if (!isReady) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-secondary/10 overflow-x-hidden text-foreground font-heading">
            <AdminHeader />

            <div className="flex flex-1 max-w-[1780px] mx-auto w-full gap-6 relative px-2 md:px-6 pt-24 md:pt-28 pb-4 md:pb-6">
                <div className="hidden md:block w-16 shrink-0" />

                <AdminSidebar />

                <main className="flex-1 min-h-0 overflow-y-auto pb-32 md:pb-0">
                    <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6 shadow-sm min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
