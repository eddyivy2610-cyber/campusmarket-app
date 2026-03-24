'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });

const totalUsersData = [
    { name: 'Jan', 'This year': 12000, 'Last year': 9000 },
    { name: 'Feb', 'This year': 14000, 'Last year': 11000 },
    { name: 'Mar', 'This year': 13500, 'Last year': 15000 },
    { name: 'Apr', 'This year': 18000, 'Last year': 12000 },
    { name: 'May', 'This year': 24000, 'Last year': 14000 },
    { name: 'Jun', 'This year': 21000, 'Last year': 19000 },
    { name: 'Jul', 'This year': 23000, 'Last year': 26000 },
];

const platformActivityData = [
    { name: 'Jan', 'This year': 4500, 'Last year': 3200 },
    { name: 'Feb', 'This year': 5200, 'Last year': 3800 },
    { name: 'Mar', 'This year': 4800, 'Last year': 5500 },
    { name: 'Apr', 'This year': 6800, 'Last year': 4200 },
    { name: 'May', 'This year': 8200, 'Last year': 4800 },
    { name: 'Jun', 'This year': 7500, 'Last year': 6900 },
    { name: 'Jul', 'This year': 7900, 'Last year': 9100 },
];

const AdminOverviewCharts = () => {
    const [activeTab, setActiveTab] = useState<'Total Users' | 'Platform Activity'>('Total Users');
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
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[11px] font-bold text-foreground">This year</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-primary/40 bg-transparent" />
                        <span className="text-[11px] font-bold text-muted-foreground/60">Last year</span>
                    </div>
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
                                    return (
                                        <div className="bg-popover text-popover-foreground border border-border text-[11px] font-bold px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-90">
                                            <div className="opacity-50 mb-1">{label}</div>
                                            {payload.map((p, i) => (
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
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdminOverviewCharts;
