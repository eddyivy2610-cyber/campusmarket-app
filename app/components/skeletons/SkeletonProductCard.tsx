import { Skeleton } from "../ui/Skeleton";

export function SkeletonProductCard() {
    return (
        <div className="group relative bg-background border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Image Placeholder */}
            <div className="aspect-[4/3] w-full overflow-hidden">
                <Skeleton className="w-full h-full" />
            </div>

            {/* Content Placeholder */}
            <div className="p-3 space-y-3">
                {/* Title & Badge */}
                <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1.5 flex-1">
                        <Skeleton height={16} width="90%" className="rounded-sm" />
                        <Skeleton height={16} width="60%" className="rounded-sm" />
                    </div>
                </div>

                {/* Price & Meta */}
                <div className="flex items-center justify-between pt-1">
                    <Skeleton height={20} width={80} className="rounded-md" />
                    <Skeleton height={14} width={60} className="rounded-sm" />
                </div>

                {/* Footer / Location */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Skeleton width={16} height={16} className="rounded-full" />
                    <Skeleton height={12} width={100} className="rounded-sm" />
                </div>
            </div>
        </div>
    );
}
