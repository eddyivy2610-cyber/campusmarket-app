import { DashboardProductsTable } from "../../components/dashboard/DashboardProductsTable";
import { ProUpgradePrompt } from "../../components/shared/ProUpgradePrompt";

export default function DashboardProductsPage() {
    // Mock user status for the prototype
    const isPro = false;

    if (!isPro) {
        return (
            <ProUpgradePrompt
                title="Unlock Products Management"
                featureName="product management"
                description="Upgrade to a Pro account to list unlimited items, manage inventory variations, and boost your campus visibility."
            />
        );
    }

    return (
        <div className="flex flex-col h-full">
            <DashboardProductsTable />
        </div>
    );
}
