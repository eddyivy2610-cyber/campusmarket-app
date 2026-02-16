import { SkeletonHeader } from "./SkeletonHeader";
import { SkeletonHero } from "./SkeletonHero";
import { SkeletonProductCard } from "./SkeletonProductCard";
import { Skeleton } from "../ui/Skeleton";

export function HomeSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <SkeletonHeader />

            <main>
                <SkeletonHero />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                    {/* Recent Listings Section Skeleton */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Skeleton height={32} width={200} className="rounded-lg" />
                            <Skeleton height={36} width={120} className="rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <SkeletonProductCard key={i} />
                            ))}
                        </div>
                    </div>

                    {/* Another Section (e.g., Shop by Category) Skeleton */}
                    <div className="space-y-6">
                        <Skeleton height={32} width={250} className="rounded-lg" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 p-4 bg-secondary/20 rounded-xl">
                                    <Skeleton width={64} height={64} className="rounded-full" />
                                    <Skeleton height={14} width={80} className="rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* More Products Skeleton */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Skeleton height={32} width={180} className="rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <SkeletonProductCard key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
