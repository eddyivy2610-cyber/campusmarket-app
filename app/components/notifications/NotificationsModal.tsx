"use client";

import { useRef } from "react";
import { CheckCheck } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { mockNotifications } from "../../data/notifications";
import Link from "next/link";
import Image from "next/image";

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    useClickOutside(modalRef, onClose);

    // Filter to show only the latest 4 for the modal snippet
    const displayedNotifications = mockNotifications.slice(0, 4);

    if (!isOpen) return null;

    return (
        <div className="absolute top-full right-0 mt-3 w-[380px] z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div ref={modalRef} className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-secondary/10">
                    <h3 className="font-bold text-lg font-heading">Notifications</h3>
                    <button className="text-primary text-xs font-bold flex items-center gap-1 hover:opacity-80 transition-opacity">
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                    </button>
                </div>

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {displayedNotifications.length > 0 ? (
                        displayedNotifications.map((notif) => (
                            <div key={notif.id} className={`p-4 hover:bg-secondary/30 transition-colors group relative cursor-pointer border-b border-border/30 last:border-0 ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                                <div className="flex gap-4">
                                    {/* Image / Icon */}
                                    <div className="shrink-0">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-secondary flex items-center justify-center relative">
                                            {notif.image ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={notif.image}
                                                        alt="Thumbnail"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-secondary animate-pulse" />
                                            )}
                                            {/* Status Indicator for Unread */}
                                            {!notif.isRead && (
                                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-background rounded-full translate-x-1/2 -translate-y-1/2"></span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm leading-none truncate pr-2 ${!notif.isRead ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.timestamp}</span>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                            {notif.message}
                                        </p>

                                        {/* Action Buttons (Simplified for Modal) */}
                                        {notif.actions && notif.actions.length > 0 && (
                                            <div className="mt-2 flex gap-2">
                                                <button className="text-[10px] font-bold text-primary hover:underline">
                                                    {notif.actions[0]}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            No recent notifications.
                        </div>
                    )}
                </div>

                {/* Footer Link */}
                <div className="p-3 bg-secondary/30 border-t border-border/50 text-center">
                    <Link
                        href="/profile?tab=notifications"
                        onClick={onClose}
                        className="text-sm font-bold text-primary hover:text-primary/80 transition-colors block w-full py-1"
                    >
                        See all incoming activity
                    </Link>
                </div>
            </div>
        </div>
    );
}
