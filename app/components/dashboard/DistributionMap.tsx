"use client";

import { MapPin } from "lucide-react";

const distributions = [
    { name: "Main Campus", percentage: 45, color: "bg-emerald-500" },
    { name: "North Campus", percentage: 25, color: "bg-blue-500" },
    { name: "South Campus", percentage: 15, color: "bg-amber-500" },
    { name: "Outside Campus", percentage: 15, color: "bg-purple-500" },
];

export function DistributionMap() {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm h-full flex flex-col">
            <h2 className="text-sm font-bold font-heading mb-6">Distribution Maps</h2>

            <div className="flex-1 flex flex-col items-center justify-center mb-6 relative">
                {/* Abstract visual representation of a map */}
                <div className="w-full max-w-[150px] aspect-video bg-secondary/30 rounded-full blur-xl absolute" />
                <div className="relative z-10 grid grid-cols-2 gap-4 w-full px-4">
                    <div className="flex flex-col items-center gap-1">
                        <MapPin className="w-6 h-6 text-emerald-500 drop-shadow-md" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Main C.</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 translate-y-4">
                        <MapPin className="w-5 h-5 text-blue-500 drop-shadow-md" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">North C.</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 -translate-y-2">
                        <MapPin className="w-4 h-4 text-amber-500 drop-shadow-md" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">South C.</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 translate-y-2">
                        <MapPin className="w-5 h-5 text-purple-500 drop-shadow-md" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Outside</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mt-auto">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {distributions.map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-muted-foreground uppercase tracking-wider">{item.name}</span>
                                <span>{item.percentage}%</span>
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
