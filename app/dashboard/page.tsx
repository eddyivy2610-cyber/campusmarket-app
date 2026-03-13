import { StatCards } from "../components/dashboard/StatCards";
import { SalesRevenueChart } from "../components/dashboard/SalesRevenueChart";
import { DisputesChart } from "../components/dashboard/DisputesChart";
import { TopProductsTable } from "../components/dashboard/TopProductsTable";
import { DistributionMap } from "../components/dashboard/DistributionMap";

export default function DashboardOverview() {
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg md:text-xl font-bold font-heading">Dashboard</h1>
                    <p className="text-xs text-muted-foreground">Monitor your Campus Market performance at a glance.</p>
                </div>
                <button className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border border-border/60 rounded-md px-3 py-2 hover:bg-secondary transition-colors">
                    Export
                </button>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold font-heading">Sales Summary</h2>
                        </div>
                        <button className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border border-border/60 rounded-md px-2.5 py-1.5 hover:bg-secondary transition-colors">
                            Export
                        </button>
                    </div>
                    <div className="mt-3">
                        <StatCards />
                    </div>
                </div>
                <div className="xl:col-span-4">
                    <DisputesChart />
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8">
                    <SalesRevenueChart />
                </div>
                <div className="xl:col-span-4">
                    <DistributionMap />
                </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1">
                <TopProductsTable />
            </div>
        </div>
    );
}
