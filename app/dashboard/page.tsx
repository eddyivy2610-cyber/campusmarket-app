"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, BarChart, Bar } from "recharts";
import { PlusSquare, Megaphone, LineChart as LineChartIcon, MessageCircle, Settings as SettingsIcon, TrendingUp, ArrowUpRight, BarChart3, Users, Target, Zap, Shield, Trophy, Star, Eye } from "lucide-react";
import { useContext, useMemo, useState, useEffect } from "react";
import { PRODUCTS } from "../data/products";
import { DASHBOARD_ORDERS } from "../data/dashboardOrders";
import { AchievementBadge } from "@/components/profile/BadgeSystem";
import { DashboardYearContext } from "@/context/DashboardYearContext";
import { dashboardService } from "@/lib/dashboardService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OptimizedImage } from "@/components/common/OptimizedImage";

const DONUT_COLORS = ["#FFD700", "#f2c94c", "#f6e28b", "#e6d36a", "#e8e8e8"];
const CARD_SHADOW = "shadow-[0_18px_52px_rgba(15,23,42,0.12)]";



const QUICK_ACTIONS = [
    {
        title: "Add listings",
        icon: PlusSquare,
        tone: "border-[#FFD700] text-[#a16207] bg-[#fff4cf]",
    },
    {
        title: "Promote shop",
        icon: Megaphone,
        tone: "border-[#efe3cf] text-[#1f1f1f] bg-white",
    },
    {
        title: "Earning overview",
        icon: LineChartIcon,
        tone: "border-[#efe3cf] text-[#1f1f1f] bg-white",
    },
    {
        title: "Messages",
        icon: MessageCircle,
        tone: "border-[#efe3cf] text-[#1f1f1f] bg-white",
    },
];




export default function DashboardOverview() {
    const [range, setRange] = useState<"weekly" | "monthly">("monthly");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const { year } = useContext(DashboardYearContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await dashboardService.getSellerStats();
                if (res.success) {
                    setData(res.data);
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                toast.error("Failed to load dashboard statistics");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCompact = (value: number) =>
        new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 }).format(value);

    const formatCurrency = (value: number) =>
        `NGN ${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(value)}`;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Syncing Dashboard...</p>
            </div>
        );
    }

    if (!data) return null;

    const soldChart = data.chartData;
    const donutData = data.donutData;
    const stats = data.stats;
    const activity = data.activity;
    const topItems = data.topItems;
    const achievements = data.achievements;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* TOP SECTION: Revenue Trend + Vertical Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-6">
                {/* Revenue Trend (Deals Analytics) */}
                <div className={`rounded-2xl border border-border/50 bg-card ${CARD_SHADOW} p-6 transition-colors duration-300`}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-sm font-bold text-foreground">Deals Analytics</h2>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Track your shop's deal performance over time.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${range === "weekly" ? "bg-primary text-black shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                                onClick={() => setRange("weekly")}
                            >
                                Weekly
                            </button>
                            <button
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${range === "monthly" ? "bg-primary text-black shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                                onClick={() => setRange("monthly")}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <div className="h-[340px] w-full text-muted-foreground">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={soldChart} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="soldGlow" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.05} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "currentColor" }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "currentColor" }}
                                    tickFormatter={formatCompact}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.5 }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const qty = (payload[0].payload as { qty?: number })?.qty ?? 0;
                                            return (
                                                <div className="bg-popover text-popover-foreground border border-border text-xs font-bold px-3 py-2 rounded-lg shadow-2xl">
                                                    <div className="opacity-60">{label}</div>
                                                    <div className="text-primary">{qty} sold</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area type="monotone" dataKey="sold" stroke="none" fill="url(#soldGlow)" />
                                <Line
                                    type="monotone"
                                    dataKey="sold"
                                    stroke="var(--color-primary)"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vertical Stat Cards */}
                <div className="flex flex-col gap-4">
                    {[
                        { label: "Total Earnings", value: `₦${stats.totalEarnings.toLocaleString()}`, date: "All time revenue", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { label: "Total Orders", value: stats.totalOrders.toString(), date: "Completed transactions", icon: BarChart3, color: "text-amber-500", bg: "bg-amber-500/10" },
                        { label: "Active Listings", value: stats.activeListings.toString(), date: "Live in marketplace", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Followers", value: stats.followers.toString(), date: "Your shop audience", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
                    ].map((card) => (
                        <div
                            key={card.label}
                            className={`flex flex-1 items-center justify-between rounded-2xl border border-border/50 bg-card p-5 ${CARD_SHADOW} transition-all hover:-translate-x-1 duration-300`}
                        >
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{card.label}</p>
                                <p className="text-2xl font-black text-foreground">{card.value}</p>
                                <p className="text-[10px] text-muted-foreground/60 font-medium">{card.date}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MIDDLE SECTION: Badge Progress (Horizontal) */}
            <div className={`rounded-2xl border border-border/50 bg-card ${CARD_SHADOW} p-6`}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    {achievements.length > 0 ? achievements.map((badge: any) => (
                        <div key={badge.name} className="space-y-4">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-xs font-bold text-foreground">{badge.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
                                </div>
                            </div>
                            <div className="relative h-1.5 w-full rounded-full bg-secondary/50">
                                <div
                                    className="absolute h-full rounded-full bg-primary"
                                    style={{ width: `100%` }}
                                />
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-4 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">No achievements unlocked yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* THIRD SECTION: 3 Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Sales Insights (Category Pie) */}
                <div className={`rounded-2xl border border-border/50 bg-card p-5 ${CARD_SHADOW} overflow-hidden relative min-h-[320px] flex flex-col`}>
                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Sales Insights</p>
                            <span className="text-[10px] font-bold text-muted-foreground/40">{range === "monthly" ? "Yearly" : "Weekly"}</span>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center -mx-4 -mt-2">
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const item = payload[0];
                                                return (
                                                    <div className="bg-popover text-popover-foreground border border-border text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                                                        <div>{item.name}: {item.value}</div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Pie
                                        data={donutData}
                                        dataKey="value"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={5}
                                        stroke="transparent"
                                    >
                                        {donutData.map((_: any, idx: number) => (
                                            <Cell key={`cell-${idx}`} fill={["#4f46e5", "#ec4899", "#10b981", "#f59e0b", "#a855f7"][idx % 5]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                             {donutData.slice(0, 5).map((cat: any, idx: number) => (
                                <div key={cat.name} className="flex items-center justify-between text-[11px] font-bold">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ["#4f46e5", "#ec4899", "#10b981", "#f59e0b", "#a855f7"][idx % 5] }} />
                                        <span className="text-muted-foreground truncate">{cat.name}</span>
                                    </div>
                                    <span className="ml-1 text-foreground">{cat.value}</span>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={`rounded-2xl border border-border/50 bg-card ${CARD_SHADOW} p-5 flex flex-col h-[320px] hidden md:flex`}>
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div className="flex flex-col">
                            <h2 className="text-[11px] font-black text-foreground uppercase tracking-wider">Quick Actions</h2>
                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Essential Tools</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide hover:scrollbar-default transition-all custom-scrollbar">
                        {QUICK_ACTIONS.map((action: any, idx: number) => {
                            const Icon = action.icon;
                            const colors = ["bg-indigo-500/10 text-indigo-500", "bg-rose-500/10 text-rose-500", "bg-emerald-500/10 text-emerald-500", "bg-amber-500/10 text-amber-500", "bg-purple-500/10 text-purple-500"];
                            return (
                                <div key={action.title} className="flex items-center gap-3.5 group cursor-pointer pb-5 last:pb-2 transition-transform hover:translate-x-1">
                                    <div className={`w-9 h-9 rounded-full ${colors[idx % colors.length]} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm shadow-black/5`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="grow">
                                        <p className="text-[12px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{action.title}</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 mt-0.5 line-clamp-1">Manage shop effectively</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Latest Activity */}
                <div className={`rounded-2xl border border-border/50 bg-card ${CARD_SHADOW} p-5 h-[320px] flex flex-col order-3 md:order-none`}>
                    <div className="flex items-center justify-between mb-6 flex-shrink-0">
                        <div className="flex flex-col">
                            <h2 className="text-[11px] font-black text-foreground uppercase tracking-wider">Latest Activity</h2>
                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Timeline Update</span>
                        </div>
                    </div>
                    <div className="space-y-0 relative flex-1 overflow-y-auto custom-scrollbar pr-1">
                        {/* Vertical line mapping */}
                        <div className="absolute left-[7px] top-2 bottom-6 w-0.5 bg-border/40" />
                        
                        {activity.map((item: any, idx: number) => {
                            const colors = ["bg-blue-500", "bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500"];
                            return (
                                <div key={item.id || idx} className="relative pl-7 pb-5 last:pb-2">
                                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-[3px] border-card z-10 transition-transform hover:scale-125 ${colors[idx % colors.length]} shadow-sm`} />
                                    <div className="grow">
                                        <p className="text-[12px] font-bold text-foreground leading-tight">{item.type}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-70 grow">{item.detail}</p>
                                        <p className="text-[8px] text-muted-foreground/40 font-bold uppercase mt-1">{new Date(item.time).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: Best Sellers */}
            <div className={`rounded-2xl border border-border/50 bg-card ${CARD_SHADOW} p-6`}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Best Sellers</h2>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Your highest performing products this month</p>
                    </div>
                    <button className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors border border-border/60 px-3 py-1 rounded-full">View all products</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {topItems.map((item: any, idx: number) => (
                        <div
                            key={item.name}
                            className="p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-secondary/20 hover:bg-secondary/40 shadow-sm transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex-shrink-0 overflow-hidden relative">
                                    <OptimizedImage
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold group-hover:text-primary transition-colors truncate">{item.name}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">₦{item.price.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 grow">
                                <div className="text-[11px] font-black w-full border-t border-border/40 pt-3 flex items-center justify-between">
                                    <p className="opacity-40 uppercase text-[9px]">Views</p>
                                    <p className="text-foreground">{item.views.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
