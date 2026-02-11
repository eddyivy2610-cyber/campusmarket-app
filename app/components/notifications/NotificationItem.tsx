"use client";

import { Bell, MessageSquare, Tag, TrendingDown, ArrowRight, PackageCheck } from "lucide-react";
import Image from "next/image";

export type NotificationType = "match" | "message" | "price_drop" | "sold" | "system";

interface NotificationItemProps {
    type: NotificationType;
    message: string;
    timestamp: string;
    image?: string;
    actionLabel?: string;
    onAction?: () => void;
    isRead?: boolean;
}

export function NotificationItem({ type, message, timestamp, image, actionLabel, onAction, isRead = false }: NotificationItemProps) {

    const getIcon = () => {
        switch (type) {
            case "match": return <Tag className="w-4 h-4 text-emerald-500" />;
            case "message": return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case "price_drop": return <TrendingDown className="w-4 h-4 text-orange-500" />;
            case "sold": return <PackageCheck className="w-4 h-4 text-gray-500" />;
            case "system": return <Bell className="w-4 h-4 text-foreground/60" />;
            default: return <Bell className="w-4 h-4 text-foreground/60" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case "match": return "bg-emerald-500/10 border-emerald-500/20";
            case "message": return "bg-blue-500/10 border-blue-500/20";
            case "price_drop": return "bg-orange-500/10 border-orange-500/20";
            default: return "bg-secondary/50 border-foreground/5";
        }
    }

    return (
        <div className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-secondary/40 ${isRead ? 'opacity-60 hover:opacity-100 bg-transparent border-transparent' : 'bg-secondary/20 border-foreground/5 shadow-sm'}`}>

            {/* Icon / Image */}
            <div className="shrink-0 relative">
                {image ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-foreground/10 relative">
                        <Image src={image} alt="Item" fill className="object-cover" />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center border border-foreground/10 shadow-sm z-10`}>
                            {getIcon()}
                        </div>
                    </div>
                ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getBgColor()}`}>
                        {getIcon()}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm text-foreground/90 leading-snug truncate ${!isRead ? 'font-medium' : ''}`}>
                    {message}
                </p>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">{timestamp}</p>
            </div>

            {/* Action */}
            {actionLabel && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAction?.();
                    }}
                    className="shrink-0 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-foreground/10 hover:border-primary/30 text-[11px] font-bold text-foreground/80 hover:text-primary transition-all group-hover:translate-x-0 sm:translate-x-2 sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:translate-x-0"
                >
                    {actionLabel}
                    <ArrowRight className="w-3 h-3" />
                </button>
            )}

            {/* Mobile Arrow (Always visible on mobile if action exists) */}
            {actionLabel && (
                <ArrowRight className="w-4 h-4 text-gray-400 sm:hidden" />
            )}

        </div>
    );
}
