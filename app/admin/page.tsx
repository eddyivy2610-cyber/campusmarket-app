"use client";

import StatCard from '@/components/admin/StatCard';
import AdminOverviewCharts from '@/components/admin/AdminOverviewCharts';
import Link from 'next/link';

export default function AdminDashboard() {
    const userActivities = [
        { text: "User 'Alex M.' viewed 'MacBook Pro' (Admin)", time: "Just now" },
        { text: "User 'Sarah K.' sent a message to 'Apple Store'", time: "4m ago" },
        { text: "User 'John D.' updated their profile photo", time: "12m ago" },
        { text: "User 'Emma L.' added 'iPhone 14' to favorites", time: "18m ago" },
        { text: "User 'Chris P.' registered a new seller account", time: "25m ago" },
        { text: "User 'Lily R.' reported a listing: 'Fake Watch'", time: "32m ago" },
        { text: "User 'Mike B.' completed their first purchase", time: "45m ago" },
        { text: "User 'Anna W.' joined the 'General' community", time: "1h ago" },
    ];

    return (
        <div className="space-y-6 md:space-y-8 pb-10">
            <div className="flex flex-col gap-6">
                {/* Overview Header */}
                <div className="flex items-center justify-between px-1 md:px-0">
                    <h2 className="text-[13px] font-bold text-foreground uppercase tracking-widest">Overview</h2>
                    <div className="flex items-center gap-1.5 cursor-pointer group bg-secondary/20 px-3 py-1.5 rounded-full border border-border/40 transition-all hover:bg-secondary/40">
                        <span className="text-[11px] font-bold text-foreground/60 group-hover:text-foreground transition-colors uppercase tracking-widest">Today</span>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="opacity-40 group-hover:opacity-70 transition-all transform group-hover:translate-y-0.5">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>

                {/* Key Totals - 2x2 Grid on Mobile */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
                    <StatCard
                        label="Views"
                        value="7,265"
                        trend={{ value: "+11.01%", isPositive: true }}
                    />
                    <StatCard
                        label="Visits"
                        value="3,671"
                        trend={{ value: "-0.03%", isPositive: false }}
                    />
                    <StatCard
                        label="New Users"
                        value="256"
                        trend={{ value: "+15.03%", isPositive: true }}
                    />
                    <StatCard
                        label="Active Users"
                        value="2,318"
                        trend={{ value: "+6.08%", isPositive: true }}
                    />
                </div>
            </div>

            {/* Unified Toggleable Charts */}
            <AdminOverviewCharts />

            {/* Recent User Activity */}
            <div className="bg-card border border-border/50 rounded-[28px] overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-secondary/5">
                    <h2 className="font-bold text-[11px] uppercase tracking-widest text-foreground/40">Recent User Activity</h2>
                    <Link href="/admin/logs" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">View All Logs</Link>
                </div>
                <div className="max-h-[380px] overflow-y-auto no-scrollbar">
                    <div className="divide-y divide-border/30">
                        {userActivities.map((activity, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between group hover:bg-secondary/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors shrink-0" />
                                    <span className="text-[13px] font-bold text-foreground/60 group-hover:text-foreground transition-colors truncate">{activity.text}</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 shrink-0">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
