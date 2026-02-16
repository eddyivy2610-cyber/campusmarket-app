"use client";

import { useState } from "react";
import { mockNotifications } from "../../data/notifications";
import { CheckCheck, MessageSquare, Package, BellRing, Sparkles, Heart, Trash2, Archive, Star } from "lucide-react";

export function NotificationsSection() {
    const [activeTab, setActiveTab] = useState<"all" | "orders" | "messages" | "updates" | "wishlist">("all");

    // Filter logic
    const filteredNotifications = activeTab === "all"
        ? mockNotifications
        : mockNotifications.filter(n => n.category === activeTab);

    // Helper to get icon based on category/type
    const getIcon = (category: string) => {
        switch (category) {
            case "orders": return <Package className="w-5 h-5 text-blue-500" />;
            case "messages": return <MessageSquare className="w-5 h-5 text-green-500" />;
            case "wishlist": return <Heart className="w-5 h-5 text-red-500" />;
            case "updates": return <Sparkles className="w-5 h-5 text-purple-500" />;
            case "security": return <BellRing className="w-5 h-5 text-orange-500" />;
            default: return <BellRing className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-foreground">List Notification</h2>
                    <p className="text-muted-foreground text-sm">View and manage all your notifications</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            className="bg-secondary/30 border border-border rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                        />
                        {/* Search Icon could go here */}
                    </div>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground">
                        <CheckCheck className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                {[
                    { id: "all", label: "All" },
                    { id: "orders", label: "Orders" },
                    { id: "messages", label: "Messages" },
                    { id: "updates", label: "Updates" },
                    { id: "wishlist", label: "Wishlist" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 text-xs opacity-80 px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20" : "bg-black/5"}`}>
                            {tab.id === "all" ? mockNotifications.length : mockNotifications.filter(n => n.category === tab.id).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Main List */}
            <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
                {/* List Header (Desktop) */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border bg-secondary/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1 text-center">Type</div>
                    <div className="col-span-7">Notification</div>
                    <div className="col-span-3">Time</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                {/* Items */}
                <div className="divide-y divide-border">
                    {filteredNotifications.length > 0 ? filteredNotifications.map((notif) => (
                        <div key={notif.id} className={`group hover:bg-secondary/20 transition-colors p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center ${!notif.isRead ? 'bg-primary/5' : ''}`}>

                            {/* Icon / Type */}
                            <div className="flex items-center gap-3 md:col-span-1 md:justify-center mb-3 md:mb-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-primary/10' : 'bg-secondary'}`}>
                                    {getIcon(notif.category)}
                                </div>
                                <span className="md:hidden text-xs font-bold uppercase text-muted-foreground">{notif.type}</span>
                            </div>

                            {/* Content */}
                            <div className="md:col-span-7 mb-3 md:mb-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>
                                        {notif.title}
                                    </h4>
                                    {!notif.isRead && (
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">{notif.message}</p>
                                {notif.alt && <p className="text-xs text-muted-foreground/60 mt-1 italic">"{notif.alt}"</p>}
                            </div>

                            {/* Time */}
                            <div className="md:col-span-3 flex items-center gap-2 text-xs text-muted-foreground mb-3 md:mb-0">
                                <span>{notif.timestamp}</span>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-1 flex items-center justify-end gap-2">
                                <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-full hover:bg-red-50" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                <BellRing className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">No notifications found</h3>
                            <p className="text-muted-foreground text-sm">We couldn't find any notifications in this category.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination (Mock) */}
            <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground px-2">
                <span>Showing {filteredNotifications.length} of {mockNotifications.length} notifications</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-md border border-border hover:bg-secondary disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 rounded-md border border-border hover:bg-secondary">Next</button>
                </div>
            </div>
        </div>
    );
}
