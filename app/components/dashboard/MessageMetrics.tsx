"use client";

import React from "react";
import { MessageSquare, Clock, CheckCircle2 } from "lucide-react";

interface MessageMetricsProps {
    responseRate: string;
    avgResponseTime: string;
    unreadCount: number;
}

export const MessageMetrics: React.FC<MessageMetricsProps> = ({
    responseRate,
    avgResponseTime,
    unreadCount,
}) => {
    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border/50 p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Response Rate</p>
                    <p className="text-lg font-bold text-foreground">{responseRate}</p>
                </div>
            </div>

            <div className="bg-card border border-border/50 p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg Time</p>
                    <p className="text-lg font-bold text-foreground">{avgResponseTime}</p>
                </div>
            </div>

            <div className="bg-card border border-border/50 p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Unread</p>
                    <p className="text-lg font-bold text-foreground">{unreadCount}</p>
                </div>
            </div>
        </div>
    );
};
