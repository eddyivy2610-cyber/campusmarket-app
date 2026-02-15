import StatCard from '@/components/admin/StatCard';
import ActivityGraph from '@/components/admin/ActivityGraph';
import RecentActivityTable from '@/components/admin/RecentActivityTable';
import TopCategoriesChart from '@/components/admin/TopCategoriesChart';
import { Users, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-400">Overview of platform performance and moderation tasks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Pending Approvals"
                    value={12}
                    icon={CheckCircle}
                    trend={{ value: "+2 new", isPositive: false }}
                />
                <StatCard
                    label="Open Reports"
                    value={8}
                    icon={AlertTriangle}
                    trend={{ value: "-5 resolved", isPositive: true }}
                />
                <StatCard
                    label="Active Listings"
                    value={1402}
                    icon={FileText}
                    trend={{ value: "+12%", isPositive: true }}
                />
                <StatCard
                    label="Active Sellers"
                    value={345}
                    icon={Users}
                    trend={{ value: "+5 new", isPositive: true }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ActivityGraph />
                </div>
                <div>
                    <TopCategoriesChart />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <RecentActivityTable />
            </div>
        </div>
    );
}
