import StatCard from '@/components/admin/StatCard';
import ActivityGraph from '@/components/admin/ActivityGraph';
import RecentActivityTable from '@/components/admin/RecentActivityTable';
import TopCategoriesChart from '@/components/admin/TopCategoriesChart';
import { Users, FileText, AlertTriangle, CheckCircle, UserPlus, Package, MessageSquare, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const activities = [
        { text: "New user registered: Michael O.", time: "2m ago" },
        { text: "Listing reported: MacBook Pro", time: "5m ago" },
        { text: "Vendor approved: Sarah K.", time: "15m ago" },
        { text: "New report filed: Harassment", time: "22m ago" },
    ];

    const quickActions = [
        { label: "Review Pending Users", href: "/admin/users/pending", color: "bg-blue-600" },
        { label: "Review Reports", href: "/admin/reports", color: "bg-red-600" },
        { label: "Moderate Listings", href: "/admin/listings?status=pending", color: "bg-orange-600" },
        { label: "View All Logs", href: "/admin/logs", color: "bg-slate-700" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back, Admin!</h1>
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-[9px]">Here&apos;s what&apos;s happening today</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Pending Users"
                    value={12}
                    icon={UserPlus}
                    trend={{ value: "Action needed", isPositive: false }}
                />
                <StatCard
                    label="Pending Listings"
                    value={8}
                    icon={Package}
                    trend={{ value: "Action needed", isPositive: false }}
                />
                <StatCard
                    label="Open Reports"
                    value={23}
                    icon={MessageSquare}
                    trend={{ value: "High volume", isPositive: false }}
                />
                <StatCard
                    label="Flagged Content"
                    value={5}
                    icon={Shield}
                    trend={{ value: "Critical", isPositive: false }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity List */}
                <div className="lg:col-span-2 bg-card border border-border/50 rounded-[28px] overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-secondary/5">
                        <h2 className="font-bold text-[11px] uppercase tracking-widest">Recent Activity</h2>
                        <Link href="/admin/logs" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-border/30">
                        {activities.map((activity, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between group hover:bg-secondary/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                    <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{activity.text}</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="bg-card border border-border/50 rounded-[28px] overflow-hidden shadow-sm flex flex-col">
                    <div className="px-6 py-5 border-b border-border/50 bg-secondary/5">
                        <h2 className="font-bold text-[11px] uppercase tracking-widest">Quick Actions</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 gap-2">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-all group"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 group-hover:text-foreground group-hover:translate-x-1 transition-all">{action.label}</span>
                                <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Original Analytics Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ActivityGraph />
                </div>
                <div>
                    <TopCategoriesChart />
                </div>
            </div>
        </div>
    );
}
