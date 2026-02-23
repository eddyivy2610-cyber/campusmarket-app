"use client";

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar layer */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out",
                isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
            )}>
                {/* Global Admin Header */}
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    adminName="Sarah Johnson"
                />

                {/* Content Body */}
                <main className="flex-1 overflow-y-auto bg-secondary/5" data-lenis-prevent>
                    <div className="max-w-[1440px] mx-auto p-4 md:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
