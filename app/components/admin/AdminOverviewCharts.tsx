'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiGet } from "@/lib/apiClient";

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });

const platformActivityData: any[] = [];

const AdminOverviewCharts = () => {
    const [activeTab, setActiveTab] = useState<'Total Users' | 'Platform Activity'>('Total Users');
    const [totalUsersData, setTotalUsersData] = useState<any[]>([]);

    useEffect(() => {
        const fetchTotals = async () => {
            try {
                const response: any = await apiGet("/api/user");
                const users = response?.data || [];

                const now = new Date();
                const months: { key: string; label: string; tooltipLabel: string; end: Date }[] = [];
                for (let i = 11; i >= 0; i -= 1) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                    const label = d.toLocaleString("en-US", { month: "short" });
                    const tooltipLabel = d.toLocaleString("en-US", { month: "long", year: "numeric" });
                    months.push({ key, label, tooltipLabel, end });
                }

                const totals = months.map((m: any) => {
                    const count = users.filter((u: any) => {
                        const created = u?.createdAt ? new Date(u.createdAt) : null;
                        return created && created < m.end;
                    }).length;
                    return { name: m.label, tooltipLabel: m.tooltipLabel, "Total Users": count };
                });

                setTotalUsersData(totals);
            } catch (err) {
                console.error("Failed to load total users chart", err);
                setTotalUsersData([]);
            }
        };

        fetchTotals();
    }, []);

    const chartData = activeTab === 'Total Users' ? totalUsersData : platformActivityData;

    return (
        <div className="bg-card border border-border/50 rounded-[22px] p-5 md:p-6 shadow-sm flex flex-col w-full min-h-[420px]">
            {/* Header: Tabs + Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                {/* Tabs */}
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setActiveTab('Total Users')}
                        className={`text-[13px] font-bold transition-all relative pb-1 ${
                            activeTab === 'Total Users' 
                            ? 'text-foreground' 
                            : 'text-muted-foreground/50 hover:text-muted-foreground'
                        }`}
                    >
                        Total Users
                        {activeTab === 'Total Users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('Platform Activity')}
                        className={`text-[13px] font-bold transition-all relative pb-1 ${
                            activeTab === 'Platform Activity' 
                            ? 'text-foreground' 
                            : 'text-muted-foreground/50 hover:text-muted-foreground'
                        }`}
                    >
                        Platform Activity
                        {activeTab === 'Platform Activity' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
                    </button>
                    <div className="w-px h-4 bg-border/60 mx-1 hidden sm:block" />
                    <button className="text-[13px] font-bold text-muted-foreground/50 hover:text-muted-foreground transition-all cursor-default">Operating Status</button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6">
                    {activeTab === "Total Users" ? (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[11px] font-bold text-foreground">Cumulative Users</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[11px] font-bold text-foreground">This year</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full border border-primary/40 bg-transparent" />
                                <span className="text-[11px] font-bold text-muted-foreground/60">Last year</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 w-full text-muted-foreground/30 font-medium">
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: "currentColor", fontWeight: 600 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: "currentColor", fontWeight: 600 }}
                            tickFormatter={(val) => `${val / 1000}k`}
                        />
                        <Tooltip 
                            cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.3 }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const tooltipTitle = (payload[0]?.payload?.tooltipLabel as string) || label;
                                    const unique = Array.from(
                                        new Map(payload.map((p: any) => [p.dataKey, p])).values()
                                    );
                                    return (
                                        <div className="bg-popover text-popover-foreground border border-border text-[11px] font-bold px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-90">
                                            <div className="opacity-50 mb-1">{tooltipTitle}</div>
                                            {unique.map((p, i) => (
                                                <div key={i} className={`flex items-center justify-between gap-4 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    <span>{p.name}:</span>
                                                    <span>{p.value?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        {activeTab === "Total Users" ? (
                            <>
                                <Area type="monotone" dataKey="Total Users" stroke="none" fill="url(#glow)" />
                                <Line
                                    type="monotone"
                                    dataKey="Total Users"
                                    stroke="var(--color-primary)"
                                    strokeWidth={3}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 5, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
                                />
                            </>
                        ) : (
                            <>
                                <Area type="monotone" dataKey="This year" stroke="none" fill="url(#glow)" />
                                <Line
                                    type="monotone"
                                    dataKey="This year"
                                    stroke="var(--color-primary)"
                                    strokeWidth={3}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 5, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Last year"
                                    stroke="var(--color-primary)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    opacity={0.3}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 4, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2, opacity: 0.5 }}
                                />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdminOverviewCharts;
