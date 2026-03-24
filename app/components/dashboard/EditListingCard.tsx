"use client";

import { ShieldCheck } from "lucide-react";

import type { DashboardProductRow } from "./DashboardProductsTable";

export interface EditListingCardProps {
    listing: DashboardProductRow & {
        condition?: string;
        location?: string;
    };
}

export function EditListingCard({ listing }: EditListingCardProps) {
    const quickActions = [
        { label: "Delete Listing", tone: "text-red-600 border-red-200 bg-red-50" },
        { label: "Mark as Sold", tone: "text-amber-700 border-amber-200 bg-amber-50" },
        { label: "Hide from Search", tone: "text-black/70 border-border/60 bg-white" },
    ];

    const statSections = [
        { label: "Views", value: listing.views },
        { label: "Messages", value: listing.messages },
        { label: "Offers", value: listing.offers },
        { label: "Orders", value: listing.orders },
    ];

    return (
        <div className="w-full max-w-sm space-y-2 text-xs" style={{ borderRadius: "0.75rem" }}>
            <div className="flex flex-col border border-border/40 bg-card px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Edit Listing</p>
                        <h2 className="text-lg font-semibold text-foreground">{listing.name}</h2>
                        <p className="text-[10px] text-muted-foreground">Status: {listing.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-emerald-600">Live</span>
                    </div>
                </div>

                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Title</p>
                        <input
                            className="w-full border border-border/30 px-3 py-2 text-sm"
                            defaultValue={listing.name}
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Price</p>
                        <input
                            className="w-full border border-border/30 px-3 py-2 text-sm"
                            defaultValue={`₦${(listing.price / 1000).toFixed(0)}k`}
                        />
                    </div>
                </div>

                <div className="mt-1 grid gap-1 sm:grid-cols-3">
                    {[
                        { label: "Condition", value: listing.condition ?? "Used" },
                        { label: "Category", value: listing.category },
                        { label: "Location", value: listing.location ?? "Campus" },
                    ].map((item) => (
                        <div key={item.label} className="space-y-1">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">{item.label}</p>
                            <input className="w-full border border-border/30 px-3 py-2 text-sm" defaultValue={item.value} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="border border-border/40 bg-card px-3 py-2 shadow-sm space-y-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Photos</p>
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((idx) => (
                        <div key={idx} className="aspect-square w-16 border border-border/40 bg-secondary/50" />
                    ))}
                    <button className="aspect-square w-16 border border-dashed border-border/40 bg-white text-[10px] font-semibold uppercase tracking-[0.3em]">
                        Upload
                    </button>
                </div>
            </div>

            <div className="border border-border/40 bg-card px-3 py-2 shadow-sm space-y-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Description</p>
                <textarea
                    rows={3}
                    defaultValue="MacBook Pro 14-inch, M1 Pro chip, 16GB RAM, 512GB SSD..."
                    className="w-full border border-border/30 px-3 py-2 text-sm resize-none"
                />
            </div>

            <div className="border border-border/40 bg-card px-3 py-2 shadow-sm space-y-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Performance</p>
                <div className="grid gap-1 sm:grid-cols-4">
                    {statSections.map((item) => (
                        <div key={item.label} className="border border-border/30 bg-secondary/30 px-2 py-1 text-center">
                            <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">{item.label}</p>
                            <p className="text-base font-bold text-foreground">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border border-border/40 bg-card px-3 py-2 shadow-sm space-y-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Danger Zone</p>
                <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            className={`flex-1 rounded-sm border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] ${action.tone}`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
