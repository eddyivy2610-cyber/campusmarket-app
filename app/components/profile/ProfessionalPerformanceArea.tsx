"use client";

import React from "react";
import {
    TrendingUp,
    ShoppingBag,
    Award,
    BarChart3
} from "lucide-react";
import { motion, Variants } from "framer-motion";

interface ProfessionalPerformanceAreaProps {
    vendor: {
        activeListings: number;
        soldItems: number;
        rating: number;
        recommended: string;
        notRecommended: string;
    };
}

export function ProfessionalPerformanceArea({ vendor }: ProfessionalPerformanceAreaProps) {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="w-full space-y-6 bg-secondary/5 rounded-[20px] p-4 md:p-6 border border-border/40"
        >

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <motion.div variants={itemVariants} className="p-4 bg-background/50 rounded-xl border border-border/20">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Active Items</p>
                    <p className="text-lg font-bold">{vendor.activeListings}</p>
                </motion.div>
                <motion.div variants={itemVariants} className="p-4 bg-background/50 rounded-xl border border-border/20">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Total Sold</p>
                    <p className="text-lg font-bold">{vendor.soldItems}</p>
                </motion.div>
                <motion.div variants={itemVariants} className="p-4 bg-background/50 rounded-xl border border-border/20">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Recommended</p>
                    <p className="text-lg font-bold text-emerald-600">{vendor.recommended}</p>
                </motion.div>
                <motion.div variants={itemVariants} className="p-4 bg-background/50 rounded-xl border border-border/20">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Not Recommended</p>
                    <p className="text-lg font-bold text-red-500">{vendor.notRecommended}</p>
                </motion.div>
            </div>
        </motion.div>
    );
}
