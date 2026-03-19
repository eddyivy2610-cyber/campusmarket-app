"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Area } from "recharts";
import { PlusSquare, Megaphone, LineChart as LineChartIcon, MessageCircle, Settings as SettingsIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { PRODUCTS } from "../data/products";
import { DASHBOARD_ORDERS } from "../data/dashboardOrders";

const DONUT_COLORS = ["#FFD700", "#f2c94c", "#f6e28b", "#e6d36a", "#e8e8e8"];

const RECENT_ACTIVITY = [
    { type: "New order", detail: "Order #ORD-1568 placed", time: "2 mins ago" },
    { type: "Approved listing", detail: "Gaming Chair listing approved", time: "1 hour ago" },
    { type: "Review", detail: "5-star review on MacBook Air M2", time: "3 hours ago" },
    { type: "Message", detail: "New message from Sarah P.", time: "Yesterday" },
    { type: "Completed order", detail: "Order #ORD-1444 delivered", time: "2 days ago" },
];

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
    {
        title: "Settings",
        icon: SettingsIcon,
        tone: "border-[#efe3cf] text-[#1f1f1f] bg-white",
    },
];

const TOP_ITEMS = [
    { name: "iPhone 14 Pro", views: 1420, reviews: 86 },
    { name: "MacBook Air M2", views: 1180, reviews: 64 },
    { name: "Gaming Chair", views: 980, reviews: 41 },
    { name: "AirPods Max", views: 860, reviews: 33 },
    { name: "PlayStation 5", views: 790, reviews: 28 },
];
export default function DashboardOverview() {
    const [range, setRange] = useState<"weekly" | "monthly">("monthly");

    const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const weekLabels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const cardTips: Record<string, string> = {
        "Orders Value": "Total value of delivered orders in the selected period.",
        "Total Orders": "Number of orders placed in the selected period.",
        "Listing Views": "Total product listing views in the selected period.",
        "Conversion %": "Messages that turned into exchanges (message to exchange).",
    };

    const monthlySold = useMemo(() => {
        const totals = Array(12).fill(0);
        DASHBOARD_ORDERS.filter((order) => order.status === "Delivered").forEach((order) => {
            const [month, day, year] = order.date.split("/").map(Number);
            if (!month || !day || !year) return;
            totals[month - 1] += order.amount;
        });
        return totals;
    }, []);

    const monthlySoldQty = useMemo(() => {
        const totals = Array(12).fill(0);
        DASHBOARD_ORDERS.filter((order) => order.status === "Delivered").forEach((order) => {
            const [month, day, year] = order.date.split("/").map(Number);
            if (!month || !day || !year) return;
            totals[month - 1] += order.qty;
        });
        return totals;
    }, []);

    const weeklySold = useMemo(() => {
        const delivered = DASHBOARD_ORDERS.filter((order) => order.status === "Delivered");
        if (!delivered.length) return Array(7).fill(0);

        const parseDate = (value: string) => {
            const [month, day, year] = value.split("/").map(Number);
            return new Date(year, (month || 1) - 1, day || 1);
        };

        const maxDate = delivered
            .map((order) => parseDate(order.date))
            .sort((a, b) => b.getTime() - a.getTime())[0];

        const startOfWeek = new Date(maxDate);
        const weekday = (startOfWeek.getDay() + 6) % 7; // Monday = 0
        startOfWeek.setDate(startOfWeek.getDate() - weekday);
        startOfWeek.setHours(0, 0, 0, 0);

        const dayTotals = Array(7).fill(0);
        delivered.forEach((order) => {
            const orderDate = parseDate(order.date);
            orderDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((orderDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                dayTotals[diffDays] += order.amount;
            }
        });

        return dayTotals;
    }, []);

    const weeklySoldQty = useMemo(() => {
        const delivered = DASHBOARD_ORDERS.filter((order) => order.status === "Delivered");
        if (!delivered.length) return Array(7).fill(0);

        const parseDate = (value: string) => {
            const [month, day, year] = value.split("/").map(Number);
            return new Date(year, (month || 1) - 1, day || 1);
        };

        const maxDate = delivered
            .map((order) => parseDate(order.date))
            .sort((a, b) => b.getTime() - a.getTime())[0];

        const startOfWeek = new Date(maxDate);
        const weekday = (startOfWeek.getDay() + 6) % 7; // Monday = 0
        startOfWeek.setDate(startOfWeek.getDate() - weekday);
        startOfWeek.setHours(0, 0, 0, 0);

        const dayTotals = Array(7).fill(0);
        delivered.forEach((order) => {
            const orderDate = parseDate(order.date);
            orderDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((orderDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                dayTotals[diffDays] += order.qty;
            }
        });

        return dayTotals;
    }, []);

    const soldSeries = range === "monthly" ? monthlySold : weeklySold;
    const soldQtySeries = range === "monthly" ? monthlySoldQty : weeklySoldQty;
    const soldLabels = range === "monthly" ? monthLabels : weekLabels;
    const soldChart = soldSeries.map((value, idx) => ({
        name: soldLabels[idx],
        sold: value,
        qty: soldQtySeries[idx] ?? 0,
    }));

    const formatCompact = (value: number) =>
        new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 }).format(value);

    const formatCurrency = (value: number) =>
        `NGN ${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(value)}`;

    const donutData = useMemo(() => {
        const counts = new Map<string, number>();
        PRODUCTS.forEach((p) => {
            counts.set(p.category, (counts.get(p.category) || 0) + 1);
        });
        const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 4);
        const othersCount = sorted.slice(4).reduce((sum, [, v]) => sum + v, 0);
        const data = top.map(([name, value]) => ({ name, value }));
        if (othersCount > 0) data.push({ name: "Others", value: othersCount });
        return data;
    }, []);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[860px_1fr] gap-4">
            <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 max-w-[860px]">
                    {[ 
                        { label: "Orders Value", value: "₦ 4,593.36", tone: "bg-[#f0f7ff] border-[#d9e8ff]" },
                        { label: "Total Orders", value: "1,250", tone: "bg-[#fef4cf] border-[#f6e3a1]" },
                        { label: "Listing Views", value: "38.6k", tone: "bg-[#efe6ff] border-[#dacbff]" },
                        { label: "Conversion %", value: "2.6%", tone: "bg-[#eaf7ef] border-[#cfead9]" },
                    ].map((card) => (
                        <div
                            key={card.label}
                            className={`card-live h-[110px] rounded-2xl border ${card.tone} px-4 py-4 shadow-[0_12px_28px_rgba(30,20,10,0.08)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,20,10,0.15)]`}
                            title={cardTips[card.label]}
                        >
                            <p className="text-[10px] uppercase tracking-widest font-bold text-black/60 mb-2">
                                {card.label}
                            </p>
                            <p className="text-2xl font-bold text-black">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-black/10 bg-white shadow-[0_18px_40px_rgba(10,10,10,0.15)] p-3 md:p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-black/60 font-bold">Revenue Trend</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <button
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${range === "weekly" ? "bg-[#FFD700] text-black" : "bg-black/5 text-black/60 hover:bg-black/10"}`}
                                onClick={() => setRange("weekly")}
                            >
                                Weekly
                            </button>
                            <button
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${range === "monthly" ? "bg-[#FFD700] text-black" : "bg-black/5 text-black/60 hover:bg-black/10"}`}
                                onClick={() => setRange("monthly")}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={soldChart} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="soldGlow" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#FFD700" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "rgba(0,0,0,0.6)" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "rgba(0,0,0,0.6)" }}
                                    tickFormatter={formatCompact}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ stroke: "rgba(0,0,0,0.2)", strokeWidth: 1, strokeDasharray: "4 4" }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const qty = (payload[0].payload as { qty?: number })?.qty ?? 0;
                                            return (
                                                <div className="bg-white border border-black/10 text-xs font-bold px-3 py-2 rounded-lg shadow-xl">
                                                    <div className="text-black/60">{label}</div>
                                                    <div className="text-black">{qty} sold</div>
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
                                    stroke="#FFD700"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 5, fill: "#FFD700", stroke: "#ffffff", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white shadow-[0_12px_28px_rgba(30,20,10,0.08)] p-4 max-w-[860px]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs uppercase tracking-widest text-black/60 font-bold">Recent Activity</p>
                        <button className="text-[11px] font-semibold text-black/50 hover:text-black">View all</button>
                    </div>
                    <div className="space-y-3">
                        {RECENT_ACTIVITY.map((item, idx) => (
                            <div key={`${item.type}-${idx}`} className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-black">{idx + 1}. {item.type}</p>
                                    <p className="text-xs text-black/60">{item.detail}</p>
                                </div>
                                <span className="text-xs font-semibold text-black/50 whitespace-nowrap">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-2xl border border-black/10 bg-white shadow-[0_12px_28px_rgba(30,20,10,0.08)] p-4 flex flex-col">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-black/60 mb-2">Orders by Category</p>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const item = payload[0];
                                            return (
                                                <div className="bg-white border border-black/10 text-xs font-bold px-3 py-2 rounded-lg shadow-xl">
                                                    <div className="text-black/60">{item.name}</div>
                                                    <div className="text-black">{item.value} orders</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Pie
                                    data={donutData}
                                    dataKey="value"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={2}
                                >
                                    {donutData.map((_, idx) => (
                                        <Cell key={`cell-${idx}`} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 space-y-2 text-[11px]">
                        {donutData.map((cat, idx) => (
                            <div key={cat.name} className="flex items-center justify-between text-black/70">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                                    <span className="font-semibold">{cat.name}</span>
                                </div>
                                <span className="font-bold">{cat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white shadow-[0_12px_28px_rgba(30,20,10,0.08)] p-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-black/60 mb-3">Top Performing Items</p>
                    <div className="space-y-3">
                        {TOP_ITEMS.map((item, idx) => (
                            <div key={item.name} className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold text-black">{idx + 1}. {item.name}</p>
                                <div className="flex items-center gap-3 text-[11px] font-semibold text-black/60">
                                    <span className="inline-flex items-center gap-1">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path
                                                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                            />
                                            <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                                        </svg>
                                        {item.views}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path
                                                d="M12 3.5 14.9 9l6 .9-4.4 4.2 1 6-5.5-3-5.5 3 1-6-4.4-4.2 6-.9L12 3.5Z"
                                                stroke="currentColor"
                                                strokeWidth="1.4"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        {item.reviews}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-[#efe3cf] bg-white shadow-[0_16px_36px_rgba(40,30,10,0.08)] overflow-hidden">
                    <div className="px-3 pt-3 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-5 bg-[#FFD700] rounded-none shadow-sm" />
                            <p className="text-[11px] font-extrabold uppercase tracking-widest text-black">
                                Quick Action
                            </p>
                        </div>
                    </div>
                    <div className="px-2 pb-3 space-y-1.5">
                        {QUICK_ACTIONS.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.title}
                                    className={`w-full flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-[#FFD700]/40 hover:bg-[#fff9e6] ${action.tone}`}
                                >
                                    <span className="h-8 w-8 rounded-md border border-current/20 bg-[#FFD700] text-black flex items-center justify-center transition-colors">
                                        <Icon className="w-3.5 h-3.5" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[11px] font-heading font-medium text-black">
                                            {action.title}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}




