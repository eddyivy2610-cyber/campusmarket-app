import { Skeleton } from "../ui/Skeleton";

export function SkeletonHero() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px] lg:h-[480px]">

                {/* Main Banner Skeleton */}
                <div className="lg:col-span-8 h-full">
                    <Skeleton className="w-full h-full rounded-2xl" />
                </div>

                {/* Side Banners / Grid Skeleton (Hidden on mobile for simplicity or stacked) */}
                <div className="hidden lg:grid lg:col-span-4 grid-rows-2 gap-6 h-full">
                    <Skeleton className="w-full h-full rounded-2xl" />
                    <Skeleton className="w-full h-full rounded-2xl" />
                </div>
            </div>

            {/* Features Row Skeleton */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border border-border/40 rounded-xl">
                        <Skeleton width={40} height={40} className="rounded-full shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton height={14} width="80%" className="rounded-sm" />
                            <Skeleton height={10} width="60%" className="rounded-sm" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
