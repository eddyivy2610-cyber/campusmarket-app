"use client";

import React from "react";
import { Monitor, Smartphone, Globe, Clock } from "lucide-react";

export function ProfileActivitySettings() {
    const activities = [
        {
            id: 1,
            action: "Logged in via Chrome",
            device: "Mac OS X",
            location: "Lagos, Nigeria",
            time: "2 hours ago",
            icon: <Globe className="w-4 h-4 text-primary" />,
            status: "current",
        },
        {
            id: 2,
            action: "Updated profile picture",
            device: "iPhone 13",
            location: "Abuja, Nigeria",
            time: "Yesterday, 4:30 PM",
            icon: <Smartphone className="w-4 h-4 text-primary" />,
            status: "success",
        },
        {
            id: 3,
            action: "Posted new listing 'Macbook Pro 2021'",
            device: "Windows 11",
            location: "Port Harcourt, Nigeria",
            time: "2 days ago",
            icon: <Monitor className="w-4 h-4 text-primary" />,
            status: "success",
        },
        {
            id: 4,
            action: "Password changed successfully",
            device: "Mac OS X",
            location: "Lagos, Nigeria",
            time: "Last week",
            icon: <Globe className="w-4 h-4 text-primary" />,
            status: "success",
        },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-[16px] font-bold text-foreground">Profile Activity</h2>
            <p className="text-[13px] text-muted-foreground mt-1">
                A log of your recent account activity and active sessions across different devices.
            </p>

            <div className="mt-8 space-y-4">
                {activities.map((activity) => (
                    <div 
                        key={activity.id} 
                        className="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-card hover:bg-secondary/20 transition-colors shadow-sm"
                    >
                        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center shrink-0 text-primary">
                            {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-bold text-foreground truncate">
                                {activity.action}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-muted-foreground">
                                <span className="text-[11px] font-medium hidden sm:inline-block">{activity.device}</span>
                                <span className="text-[11px] hidden sm:inline-block px-1">·</span>
                                <span className="text-[11px] font-medium">{activity.location}</span>
                                <span className="text-[11px] px-1">·</span>
                                <span className="text-[11px] font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {activity.time}
                                </span>
                            </div>
                        </div>
                        {activity.status === "current" && (
                            <div className="shrink-0 px-2 py-1 bg-green-50 text-green-600 border border-green-200 rounded-md text-[10px] font-bold mt-1">
                                Active Now
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="pt-6 border-t border-border/40">
                <button className="text-[12px] font-bold text-red-500 hover:text-red-600 transition-colors">
                    Sign out of all other sessions
                </button>
            </div>
        </div>
    );
}
