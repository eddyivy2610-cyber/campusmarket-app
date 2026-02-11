"use client";

import { X, Check, Bell, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationItem, NotificationType } from "./NotificationItem";
import { CreateAlertModal } from "./CreateAlertModal";

interface NotificationSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Handle animation
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // match transition duration
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Mock Data (same as before)
    const notifications: {
        id: number;
        type: NotificationType;
        message: string;
        timestamp: string;
        image?: string;
        actionLabel?: string;
        isRead?: boolean;
    }[] = [
            {
                id: 1,
                type: "match",
                message: "Good news! A 'MacBook Air M1' matching your alert was just listed by Sarah within your price range.",
                timestamp: "2 mins ago",
                image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=200",
                actionLabel: "View Listing"
            },
            {
                id: 2,
                type: "message",
                message: "New message from David regarding 'Calculus Textbook': 'Is this still available? I can meet at the library.'",
                timestamp: "1 hour ago",
                image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
                actionLabel: "Reply"
            },
            {
                id: 3,
                type: "price_drop",
                message: "Price Drop! The 'Sony WH-1000XM4' in your wishlist is now ₦15,000 cheaper.",
                timestamp: "3 hours ago",
                image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=200",
                actionLabel: "View Deal"
            },
            {
                id: 4,
                type: "sold",
                message: "Your item 'Graphics Tablet' has been marked as sold. Great job!",
                timestamp: "Yesterday",
                image: "https://images.unsplash.com/photo-1585728867375-7b5879a7864c?auto=format&fit=crop&q=80&w=200",
                isRead: true
            },
            {
                id: 5,
                type: "system",
                message: "Welcome to Campus Market! Create an alert to find exactly what you're looking for.",
                timestamp: "2 days ago",
                isRead: true
            }
        ];

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`relative w-full max-w-md bg-background border-l border-foreground/5 shadow-2xl h-full flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-4 border-b border-foreground/5 flex items-center justify-between bg-background/80 backdrop-blur-md z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-xl">
                            <Bell className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground leading-none">Notifications</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Real-time alerts</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Create Alert CTA */}
                    <button
                        onClick={() => setIsAlertModalOpen(true)}
                        className="w-full bg-secondary/30 border border-dashed border-foreground/10 hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-4 flex items-center justify-center gap-2 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground/80 group-hover:text-primary">Create New Alert</span>
                    </button>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Recent</h3>
                            <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Mark all read
                            </button>
                        </div>

                        {notifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                {...notification}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <CreateAlertModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
            />
        </div>
    );
}
