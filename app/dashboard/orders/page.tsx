import { DashboardOrdersTable } from "../../components/dashboard/DashboardOrdersTable";
import { ProUpgradePrompt } from "../../components/shared/ProUpgradePrompt";

export default function DashboardOrdersPage() {
    // Mock user status for the prototype
    const isPro = false;

    if (!isPro) {
        return (
            <ProUpgradePrompt
                title="Unlock Order Processing"
                featureName="order processing"
                description="Upgrade to a Pro account to manage customer orders, view detailed transaction history, and access fast payouts."
            />
        );
    }

    return (
        <div className="flex flex-col h-full">
            <DashboardOrdersTable />
        </div>
    );
}
