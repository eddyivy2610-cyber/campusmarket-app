"use client";

import { MapPin } from "lucide-react";

type CampusDistribution = {
    name: string;
    percentage: number;
    listings: number;
    color: string;
    dotClass: string;
    x: string;
    y: string;
};

const distributions: CampusDistribution[] = [
    {
        name: "Samaru Main Gate",
        percentage: 31,
        listings: 124,
        color: "bg-emerald-500",
        dotClass: "text-emerald-500",
        x: "22%",
        y: "30%",
    },
    {
        name: "ABU Main Campus Core",
        percentage: 27,
        listings: 108,
        color: "bg-blue-500",
        dotClass: "text-blue-500",
        x: "48%",
        y: "46%",
    },
    {
        name: "Kongo Campus Axis",
        percentage: 18,
        listings: 72,
        color: "bg-blue-500",
        dotClass: "text-blue-500",
        x: "64%",
        y: "68%",
    },
    {
        name: "Community Market (Samaru)",
        percentage: 14,
        listings: 56,
        color: "bg-purple-500",
        dotClass: "text-purple-500",
        x: "34%",
        y: "73%",
    },
    {
        name: "Shika / Teaching Hospital Belt",
        percentage: 10,
        listings: 40,
        color: "bg-rose-500",
        dotClass: "text-rose-500",
        x: "74%",
        y: "24%",
    },
];

export function DistributionMap() {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm h-full flex flex-col">
            <h2 className="text-sm font-bold font-heading mb-4">Distribution Maps</h2>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Active listing clusters around ABU Zaria
            </p>

            <div className="flex-1 mb-5">
                <div className="relative w-full h-[170px] rounded-2xl border border-border/50 bg-gradient-to-br from-secondary/70 via-secondary/40 to-background overflow-hidden">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,#10b98133,transparent_35%),radial-gradient(circle_at_70%_25%,#3b82f633,transparent_30%),radial-gradient(circle_at_55%_75%,#f59e0b2e,transparent_30%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b814_1px,transparent_1px),linear-gradient(to_bottom,#94a3b814_1px,transparent_1px)] bg-[size:22px_22px]" />

                    {distributions.map((spot) => (
                        <div
                            key={spot.name}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                            style={{ left: spot.x, top: spot.y }}
                        >
                            <div className="relative group">
                                <MapPin className={`w-5 h-5 drop-shadow-md ${spot.dotClass}`} />
                                <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-card border border-border/60 text-[9px] font-bold whitespace-nowrap shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {spot.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 mt-auto">
                <div className="grid grid-cols-1 gap-y-2.5">
                    {distributions.map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-muted-foreground uppercase tracking-wider">{item.name}</span>
                                <span className="text-foreground">
                                    {item.percentage}% <span className="text-muted-foreground">({item.listings})</span>
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
