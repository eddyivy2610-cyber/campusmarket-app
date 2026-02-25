"use client";

import React from "react";
import { GraduationCap, BadgeCheck, Trophy, Shield, Zap, Star } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    const [isVisible, setIsVisible] = React.useState(false);

    // Extract base color name from tailwind class (e.g. "text-yellow-600" -> "yellow")
    const colorClass = achievement.color.split(' ').find(c => c.startsWith('text-')) || 'text-primary';
    const colorBase = colorClass.split('-')[1]; // yellow, blue, purple, green, etc.

    const tooltipColorClasses: Record<string, { bg: string, border: string, arrow: string }> = {
        yellow: { bg: "bg-yellow-600/60", border: "border-yellow-500/30", arrow: "border-t-yellow-600/60" },
        blue: { bg: "bg-blue-600/60", border: "border-blue-500/30", arrow: "border-t-blue-600/60" },
        purple: { bg: "bg-purple-600/60", border: "border-purple-500/30", arrow: "border-t-purple-600/60" },
        green: { bg: "bg-emerald-600/60", border: "border-emerald-500/30", arrow: "border-t-emerald-600/60" },
        primary: { bg: "bg-slate-900/60", border: "border-white/10", arrow: "border-t-slate-900/60" }
    };

    const theme = tooltipColorClasses[colorBase] || tooltipColorClasses.primary;

    return (
        <div
            className={cn("relative flex-shrink-0 cursor-help", className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onTouchStart={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            <div className={cn(
                "p-2.5 rounded-xl border border-border/30 backdrop-blur-md transition-all duration-300",
                isVisible ? "scale-110 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] border-primary/30" : "",
                achievement.color.split(' ').find(c => c.startsWith('bg-')) || 'bg-primary/5'
            )}>
                <IconComponent className={cn("w-4 h-4 md:w-5 md:h-5", colorClass)} />
            </div>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                        exit={{ opacity: 0, y: 8, scale: 0.95, x: "-50%" }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute bottom-full left-1/2 mb-3 z-[100] pointer-events-none"
                    >
                        <div className={cn(
                            "backdrop-blur-xl border px-3 py-1.5 rounded-xl shadow-2xl min-w-[140px] text-center relative whitespace-nowrap",
                            theme.bg,
                            theme.border
                        )}>
                            <div className="text-[10px] font-bold text-white leading-tight">{achievement.description}</div>

                            {/* Arrow */}
                            <div className={cn(
                                "absolute top-[100%] left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent",
                                theme.arrow
                            )} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
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
