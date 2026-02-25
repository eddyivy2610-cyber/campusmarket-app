"use client";

import React from 'react';
import { Bell, ChevronDown, Menu, Settings, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
    onMenuClick: () => void;
    adminName?: string;
}

export function AdminHeader({ onMenuClick, adminName = "Admin" }: AdminHeaderProps) {
    return (
        <header className="h-14 border-b border-border bg-background sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
            {/* Left: Mobile Menu Toggle & Brand (Mobile only really for toggle) */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600 animate-spin-slow" />
                    <span className="font-bold text-lg tracking-tight hidden sm:inline-block">Admin Panel</span>
                </div>
            </div>

            {/* Right: Notifications*/}
            <div className="flex items-center gap-3">
                <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-all group">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                </button>
            </div>
        </header>
    );
}
