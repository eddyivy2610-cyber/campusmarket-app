"use client";

import React from "react";
import { Search, User } from "lucide-react";
import { cn } from "../../../lib/utils";

interface BlockedUserProps {
    name: string;
    handle: string;
    date: string;
}

function BlockedUserRow({ name, handle, date }: BlockedUserProps) {
    return (
        <div className="flex items-center justify-between py-4 group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-red-500 transition-colors">
                    <User className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">{name}</h4>
                    <p className="text-xs text-muted-foreground">{handle} • Blocked {date}</p>
                </div>
            </div>
            <button className="text-xs font-semibold text-primary hover:opacity-70 transition-opacity">
                Unblock
            </button>
        </div>
    );
}

export function BlockedUsers() {
    return (
        <div className="max-w-4xl space-y-12 pb-12">
            {/* Blocked Users Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40 flex justify-between items-center">
                    <h2 className="text-base font-semibold">Blocked Users</h2>
                    <span className="text-xs text-muted-foreground">2 accounts blocked</span>
                </div>

                <div className="space-y-4">
                    {/* Search Field */}
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                        <input
                            type="text"
                            placeholder="Search blocked users..."
                            className="w-full bg-muted/30 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="divide-y divide-border/20">
                        <BlockedUserRow name="Michael Ojo" handle="@michael_ojo" date="Mar 10, 2025" />
                        <BlockedUserRow name="Sarah Ibrahim" handle="@sarah_i" date="Mar 5, 2025" />
                    </div>
                </div>
            </div>

            {/* Restrict New User Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Restrict Account</h2>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Enter the handle of the user you want to restrict. They won't be able to message you or see your listings.
                    </p>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="@username"
                            className="flex-1 bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                        <button className="px-6 py-3 bg-red-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-500/10 hover:bg-red-600 transition-all active:scale-[0.98]">
                            Restrict
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
