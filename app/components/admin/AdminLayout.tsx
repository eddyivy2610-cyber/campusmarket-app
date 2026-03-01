"use client";

import React from "react";
import AdminSidebar from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen w-full bg-secondary/10 overflow-x-hidden text-foreground font-heading">
            <AdminHeader />

            <div className="flex flex-1 max-w-[1780px] mx-auto w-full px-2 md:px-6 pt-24 md:pt-28 pb-4 md:pb-6 gap-6 relative h-screen overflow-hidden">
                <AdminSidebar />

                <main className="flex-1 min-h-0 overflow-y-auto pb-20 md:pb-0 pr-1 md:ml-24">
                    <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6 shadow-sm min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
