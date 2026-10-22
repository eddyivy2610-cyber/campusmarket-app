import { Skeleton } from "../ui/Skeleton";

export function SkeletonHeader() {
    return (
        <div className="w-full h-[72px] border-b border-border bg-background flex items-center justify-between px-4 lg:px-8">
            {/* Left: Logo Placeholder */}
            <div className="flex items-center gap-2">
                <Skeleton width={140} height={32} className="rounded-lg" />
            </div>

            {/* Center: Search Bar Placeholder - Hidden on mobile, visible on lg */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                <Skeleton className="w-full h-10 rounded-full" />
            </div>

            {/* Right: Icons & Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Mobile Search Icon Placeholder */}
                <Skeleton width={36} height={36} className="rounded-full lg:hidden" />

                {/* Action Icons */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <Skeleton width={36} height={36} className="rounded-full" />
                    <Skeleton width={36} height={36} className="rounded-full" />
                    <Skeleton width={36} height={36} className="rounded-full" />
                </div>

                {/* Sell Button Placeholder */}
                <Skeleton width={80} height={36} className="rounded-full hidden sm:block" />

                {/* User Avatar Placeholder */}
                <Skeleton width={36} height={36} className="rounded-full ml-1" />
            </div>
        </div>
    );
}
