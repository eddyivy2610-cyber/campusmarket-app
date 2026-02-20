"use client";

import React from "react";
import {
    TrendingUp,
    ShoppingBag,
    Award,
    BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

interface VendorPerformanceAreaProps {
    vendor: {
        activeListings: number;
        soldItems: number;
        rating: number;
        responseRate: string;
        responseTime: string;
    };
}

export function VendorPerformanceArea({ vendor }: VendorPerformanceAreaProps) {
    const stats = [
        { label: "Growth", value: "+24%", icon: TrendingUp, color: "text-green-500" },
        { label: "Repeat", value: "15%", icon: ShoppingBag, color: "text-blue-500" },
        { label: "Trust Score", value: "98/100", icon: Award, color: "text-purple-500" },
    ];

    return (
        <div className="w-full space-y-6 bg-secondary/5 rounded-[24px] p-5 md:p-8 border border-border/40">
            <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <BarChart3 className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black font-heading tracking-tight">Business Performance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 bg-background rounded-2xl border border-border/30 text-center space-y-2 shadow-sm"
                    >
                        <div className={`w-10 h-10 ${stat.color} bg-secondary flex items-center justify-center mx-auto rounded-xl`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xl font-black">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-background/50 rounded-xl border border-border/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Active Items</p>
                    <p className="text-lg font-black">{vendor.activeListings}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl border border-border/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Total Sold</p>
                    <p className="text-lg font-black">{vendor.soldItems}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl border border-border/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Response Rate</p>
                    <p className="text-lg font-black">{vendor.responseRate}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl border border-border/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Avg Time</p>
                    <p className="text-lg font-black">{vendor.responseTime}</p>
                </div>
            </div>
        </div>
    );
}
