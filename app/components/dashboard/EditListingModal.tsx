import { BaseModal } from "../common/BaseModal";
import { Package } from "lucide-react";
import { DashboardProductRow } from "./DashboardProductsTable";
import { EditListingCard } from "./EditListingCard";

interface Props {
    listing: DashboardProductRow;
    isOpen: boolean;
    onClose: () => void;
}

export function EditListingModal({ listing, isOpen, onClose }: Props) {
    if (!listing) return null;

    const editListing = {
        ...listing,
        condition: "Used",
        location: "Campus",
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Update Listing"
            icon={<Package className="w-5 h-5" />}
            maxWidth="max-w-xl"
            footer={
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-2xl border border-border bg-card text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all active:scale-95 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-[2] px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        Save Changes
                    </button>
                </div>
            }
        >
            <EditListingCard listing={editListing} />
        </BaseModal>
    );
}
