
 "use client";
 
 import { X } from "lucide-react";
 import { motion } from "framer-motion";
 import { DashboardProductRow } from "./DashboardProductsTable";
 import { EditListingCard } from "./EditListingCard";
 
 interface Props {
     listing: DashboardProductRow;
     isOpen: boolean;
     onClose: () => void;
 }
 
 export function EditListingModal({ listing, isOpen, onClose }: Props) {
     if (!isOpen) return null;
 
   const editListing = {
     ...listing,
     condition: "Used",
     location: "Campus",
    };

    return (
         <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div
                 initial={{ opacity: 0, scale: 0.97 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.97 }}
                 className="relative w-full max-w-[28rem] rounded-[var(--radius)] border border-border/50 bg-card shadow-2xl"
                 style={{ paddingRight: "0.5rem" }}
             >
                 <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
                     <h3 className="text-base font-semibold">Update Listing</h3>
                     <button
                         onClick={onClose}
                         className="rounded-full border border-border/30 bg-secondary/40 p-1.5 text-muted-foreground"
                     >
                         <X className="w-4 h-4" />
                     </button>
                 </div>
                 <div className="max-h-[70vh] overflow-y-auto px-5 pb-4 pt-3">
                    <EditListingCard listing={editListing} />
                 </div>
             </motion.div>
         </div>
     );
 }
