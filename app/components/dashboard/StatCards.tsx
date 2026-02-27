"use client";

import { Users, Tag, MousePointerClick, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

const stats = [
    {
        title: "Customers",
        value: "45,000",
        change: "+7%",
        isPositive: true,
        icon: Users,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10"
    },
    {
        title: "Total Offers",
        value: "1,204",
        change: "+12%",
        isPositive: true,
        icon: Tag,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
    },
    {
        title: "Product Interactions",
        value: "128,500",
        change: "-2.4%",
        isPositive: false,
        icon: MousePointerClick,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10"
    },
    {
        title: "Completed Sales",
        value: "14,500",
        change: "+5.2%",
        isPositive: true,
        icon: CheckCircle,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10"
    }
];

export function StatCards() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <div key={idx} className="p-4 bg-card border border-border/50 rounded-2xl flex flex-col justify-between gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</span>
                        </div>
                        {stat.isPositive ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                        <p className={`text-[10px] font-bold mt-1 ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stat.change} <span className="text-muted-foreground font-medium">vs. last month</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
