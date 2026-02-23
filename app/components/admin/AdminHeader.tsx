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

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-all group">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                </button>

                {/* Vertical Divider */}
                <div className="w-px h-6 bg-border mx-1" />

                {/* Profile Dropdown */}
                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-accent transition-all group">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-bold leading-tight">{adminName}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Super Admin</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-background shadow-sm flex items-center justify-center text-white font-bold">
                        {adminName.charAt(0)}
                    </div>
                    <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-transform group-hover:rotate-180" />
                </button>
            </div>
        </header>
    );
}
