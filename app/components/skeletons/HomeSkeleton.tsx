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

                {/* Feature Highlights skeleton — 4 icon+text cards, hidden on mobile */}
                <div className="hidden md:block py-12 border-b border-border/40">
                    <div className="max-w-[1780px] mx-auto px-8">
                        <div className="grid grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton width={48} height={48} className="rounded-full shrink-0" />
                                    <div className="flex flex-col gap-2">
                                        <Skeleton height={12} width={100} className="rounded-sm" />
                                        <Skeleton height={10} width={80} className="rounded-sm" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-[1780px] mx-auto px-4 md:px-8 py-8 space-y-12">
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

                    {/* Categories section — 6×2 grid to match 12 categories */}
                    <div className="space-y-6">
                        <Skeleton height={32} width={250} className="rounded-lg" />
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                            {[...Array(12)].map((_, i) => (
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
