"use client";

import { useRef } from "react";
import { CheckCheck } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { mockNotifications } from "../../data/notifications";
import Link from "next/link";

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    useClickOutside(modalRef, onClose);

    const displayed = mockNotifications.slice(0, 4);

    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="absolute top-full right-0 mt-2 w-[300px] z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right bg-background rounded-2xl shadow-2xl border border-border overflow-hidden" onWheel={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="px-3.5 py-2.5 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-bold text-sm font-heading">Notifications</h3>
                <button className="text-primary text-[10px] font-bold flex items-center gap-1 hover:opacity-70 transition-opacity">
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                </button>
            </div>

            {/* List */}
            <div className="max-h-[320px] overflow-y-auto divide-y divide-border/30" data-lenis-prevent>
                {displayed.length > 0 ? displayed.map((notif) => (
                    <div
                        key={notif.id}
                        className={`flex gap-3 px-3.5 py-3 hover:bg-secondary/30 transition-colors cursor-pointer ${!notif.isRead ? "bg-primary/5" : ""}`}
                    >
                        {/* Thumbnail */}
                        <div className="shrink-0 relative">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary border border-border">
                                {notif.image
                                    ? <img src={notif.image} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full bg-secondary animate-pulse" />
                                }
                            </div>
                            {!notif.isRead && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 border border-background rounded-full" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                <h4 className={`text-xs leading-tight truncate ${!notif.isRead ? "font-bold text-foreground" : "font-semibold text-foreground/80"}`}>
                                    {notif.title}
                                </h4>
                                <span className="text-[9px] text-muted-foreground whitespace-nowrap shrink-0">{notif.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{notif.message}</p>
                            {notif.actions && notif.actions.length > 0 && (
                                <button className="mt-1 text-[10px] font-bold text-primary hover:underline">
                                    {notif.actions[0]}
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="py-8 text-center text-muted-foreground text-xs">No recent notifications.</div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3.5 py-2.5 border-t border-border/50 text-center">
                <Link href="/notifications-received" onClick={onClose} className="text-xs font-bold text-primary hover:opacity-80 transition-opacity">
                    Notifications Centre
                </Link>
            </div>
        </div>
    );
}
