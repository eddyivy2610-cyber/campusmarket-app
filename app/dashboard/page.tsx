import { StatCards } from "../components/dashboard/StatCards";
import { SalesRevenueChart } from "../components/dashboard/SalesRevenueChart";
import { DisputesChart } from "../components/dashboard/DisputesChart";
import { TopProductsTable } from "../components/dashboard/TopProductsTable";
import { DistributionMap } from "../components/dashboard/DistributionMap";

export default function DashboardOverview() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg md:text-xl font-bold font-heading">Dashboard</h1>
            </div>

            {/* Stat Cards Row */}
            <StatCards />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SalesRevenueChart />
                <DisputesChart />
            </div>

            {/* Bottom Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TopProductsTable />
                <DistributionMap />
            </div>
        </div>
    );
}
