"use client";

import { useState } from "react";
import { Filter, Search, Plus, Check } from "lucide-react";
import { NotificationItem, NotificationType } from "../../components/notifications/NotificationItem";
import { CreateAlertModal } from "../../components/notifications/CreateAlertModal";

// Mock Data from the Sidebar
const BASE_ALERTS: {
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

// Duplicate the alerts multiple times to demonstrate scrolling
const DASHBOARD_ALERTS = [
    ...BASE_ALERTS,
    ...BASE_ALERTS.map(a => ({ ...a, id: a.id + 10 })),
    ...BASE_ALERTS.map(a => ({ ...a, id: a.id + 20 })),
    ...BASE_ALERTS.map(a => ({ ...a, id: a.id + 30 })),
];

const FILTERS = ["All", "Matches", "Messages", "Price Drops", "Sold", "System"];

export default function DashboardAlertsPage() {
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");

    const getFilteredAlerts = () => {
        if (activeFilter === "All") return DASHBOARD_ALERTS;
        if (activeFilter === "Matches") return DASHBOARD_ALERTS.filter(alert => alert.type === "match");
        if (activeFilter === "Messages") return DASHBOARD_ALERTS.filter(alert => alert.type === "message");
        if (activeFilter === "Price Drops") return DASHBOARD_ALERTS.filter(alert => alert.type === "price_drop");
        if (activeFilter === "Sold") return DASHBOARD_ALERTS.filter(alert => alert.type === "sold");
        if (activeFilter === "System") return DASHBOARD_ALERTS.filter(alert => alert.type === "system");
        return DASHBOARD_ALERTS;
    };

    const filteredAlerts = getFilteredAlerts();

    return (
        <div className="w-full flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 shrink-0">
                <button
                    onClick={() => setIsAlertModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-foreground text-background font-bold px-6 py-3 rounded-full hover:opacity-90 transition-all text-xs tracking-wide shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Alert
                </button>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                    {/* Search */}
                    <div className="w-full sm:w-auto relative flex items-center">
                        <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
                        <input
                            type="text"
                            placeholder="Search alerts"
                            className="w-full sm:w-64 bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-background outline-none rounded-full py-2.5 pl-9 pr-4 text-xs font-medium transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Content Area */}
            <div className="flex flex-col flex-1 min-h-0 bg-card border border-border/50 rounded-3xl p-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
                        {FILTERS.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === filter
                                    ? "bg-foreground text-background shadow-sm"
                                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <button className="shrink-0 hidden sm:flex text-[11px] font-bold text-primary hover:underline items-center gap-1.5 px-2">
                        <Check className="w-3.5 h-3.5" />
                        Mark all as read
                    </button>
                </div>

                {/* Alerts List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar" data-lenis-prevent>
                    {filteredAlerts.length > 0 ? (
                        filteredAlerts.map(alert => (
                            <NotificationItem
                                key={alert.id}
                                {...alert}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                <Search className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No alerts found for this filter.</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateAlertModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
            />
        </div>
    );
}
