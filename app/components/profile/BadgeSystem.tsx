"use client";

import React from "react";
import { GraduationCap, BadgeCheck, Trophy, Shield, Zap, Star } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { IconTooltip } from "../common/IconTooltip";

interface BadgeProps {
    type: 'student' | 'verified' | 'transaction';
    value?: number | string;
    tier?: 'bronze' | 'silver' | 'gold';
    className?: string;
}

export function BadgeSystem({ type, value, tier, className }: BadgeProps) {
    if (type === 'student') {
        return (
            <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 shadow-sm",
                className
            )}>
                <GraduationCap className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase tracking-widest">Student</span>
            </div>
        );
    }

    if (type === 'verified') {
        const fillMain = tier === 'gold' ? "#9333ea" : "#10B981";

        return (
            <div className={cn(
                "flex items-center justify-center p-0.5",
                className
            )}>
                <BadgeCheck className="w-6 h-6" fill={fillMain} stroke="white" strokeWidth={1.5} />
            </div>
        );
    }

    if (type === 'transaction') {
        const count = Number(value);
        let label = "10+";
        let tierColor = "text-slate-600 border-slate-300";
        let ribbonColor = "bg-slate-400";

        if (count >= 100) {
            label = "100+";
            tierColor = "text-purple-700 border-purple-500 shadow-purple-500/10";
            ribbonColor = "bg-purple-500";
        } else if (count >= 50) {
            label = "50+";
            tierColor = "text-slate-500 border-slate-400";
            ribbonColor = "bg-slate-400";
        }

        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={cn(
                    "relative flex flex-col items-center group",
                    className
                )}
            >
                <div className="flex flex-col items-center">
                    <div className={cn(
                        "w-12 h-12 rounded-full border-2 bg-white flex flex-col items-center justify-center z-10 relative overflow-hidden",
                        tierColor
                    )}>
                        <span className="text-[12px] font-bold leading-none">{label}</span>
                        <span className="text-[6px] font-bold uppercase tracking-tighter opacity-60">Sales</span>
                    </div>

                    <div className="flex gap-1 -mt-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <div className={cn("w-3.5 h-6", ribbonColor)} style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }} />
                        <div className={cn("w-3.5 h-6", ribbonColor)} style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }} />
                    </div>
                </div>
            </motion.div>
        );
    }
    return null;
}

export const AchievementIcons = {
    Trophy,
    Shield,
    Zap,
    Star
};

export function AchievementBadge({ achievement, className }: {
    achievement: { name: string; icon: string; color: string; type: string; description: string };
    className?: string
}) {
    const IconComponent = AchievementIcons[achievement.icon as keyof typeof AchievementIcons] || Star;

    // Extract base color name from tailwind class (e.g. "text-yellow-600" -> "yellow")
    const colorClass = achievement.color.split(' ').find(c => c.startsWith('text-')) || 'text-primary';

    return (
        <IconTooltip content={achievement.description} position="top">
            <div className={cn(
                "p-2.5 rounded-xl border border-border/30 backdrop-blur-md transition-all duration-300",
                "hover:scale-110 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] hover:border-primary/30",
                achievement.color.split(' ').find(c => c.startsWith('bg-')) || 'bg-primary/5',
                className
            )}>
                <IconComponent className={cn("w-4 h-4 md:w-5 md:h-5", colorClass)} />
            </div>
        </IconTooltip>
    );
}

export function StudentCapOverlay({ className }: { className?: string }) {
    return (
        <div className={cn(
            "absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full border-2 border-background flex items-center justify-center text-white shadow-md z-20",
            className
        )}>
            <GraduationCap className="w-3.5 h-3.5" />
        </div>
    );
}
