"use client";

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu, ShoppingBasket } from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className={`flex-1 w-full overflow-y-auto z-10 transition-all duration-500 ease-in-out cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* Mobile Header (Only visible on mobile) */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <ShoppingBasket className="w-6 h-6 text-blue-600" />
                        <span className="font-bold text-lg tracking-tight">Campus<span className="text-blue-600">Market</span></span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
