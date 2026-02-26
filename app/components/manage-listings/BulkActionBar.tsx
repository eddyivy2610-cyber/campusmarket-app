import { Trash2, Edit3, EyeOff, Tag, ArrowUpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
}

export function BulkActionBar({ selectedCount, onClearSelection }: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-6"
            >
                <div className="flex items-center gap-3 border-r border-background/20 pr-6">
                    <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-primary-foreground">
                        {selectedCount}
                    </span>
                    <span className="text-sm font-medium whitespace-nowrap">
                        Listings selected
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-background/10 rounded-xl transition-colors tooltip-trigger relative group">
                        <Edit3 className="w-4 h-4" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Bulk Edit Price
                        </span>
                    </button>
                    <button className="p-2 hover:bg-background/10 rounded-xl transition-colors tooltip-trigger relative group">
                        <Tag className="w-4 h-4" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Change Category
                        </span>
                    </button>
                    <button className="p-2 hover:bg-background/10 rounded-xl transition-colors tooltip-trigger relative group">
                        <ArrowUpCircle className="w-4 h-4" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Mark as Sold/Active
                        </span>
                    </button>
                    <button className="p-2 hover:bg-background/10 rounded-xl transition-colors tooltip-trigger relative group">
                        <EyeOff className="w-4 h-4" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Hide Listings
                        </span>
                    </button>
                    <div className="w-px h-6 bg-background/20 mx-2" />
                    <button className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors tooltip-trigger relative group">
                        <Trash2 className="w-4 h-4" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Delete Listings
                        </span>
                    </button>
                </div>

                <button
                    onClick={onClearSelection}
                    className="p-1 hover:bg-background/20 rounded-full transition-colors ml-4"
                >
                    <X className="w-4 h-4 opacity-50" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
