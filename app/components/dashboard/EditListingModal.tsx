import { BaseModal } from "../common/BaseModal";
import { Package, Loader2 } from "lucide-react";
import { DashboardProductRow } from "./DashboardProductsTable";
import { EditListingCard } from "./EditListingCard";
import { useState } from "react";
import { listingService } from "@/lib/listingService";
import { toast } from "sonner";

interface Props {
    listing: DashboardProductRow;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditListingModal({ listing, isOpen, onClose, onSuccess }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    if (!listing) return null;

    const handleSave = async () => {
        if (!formData) {
            onClose();
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await listingService.updateListing(listing._id || listing.id, formData);
            if (res.success) {
                toast.success("Listing updated successfully");
                onSuccess?.();
                onClose();
            } else {
                toast.error(res.message || "Failed to update listing");
            }
        } catch (err) {
            console.error("Update error:", err);
            toast.error("An error occurred while saving changes");
        } finally {
            setIsSubmitting(false);
        }
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
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 rounded-2xl border border-border bg-card text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all active:scale-95 shadow-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex-[2] px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            }
        >
            <EditListingCard 
                listing={listing} 
                onChange={(data) => setFormData(data)} 
            />
        </BaseModal>
    );
}
