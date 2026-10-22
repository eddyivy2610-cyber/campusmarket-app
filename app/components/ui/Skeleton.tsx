import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    width?: string | number;
    height?: string | number;
    rounded?: string;
}

export function Skeleton({
    className,
    width,
    height,
    rounded = "rounded-md",
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "bg-muted/50 animate-pulse relative overflow-hidden",
                rounded,
                className
            )}
            style={{
                width: width,
                height: height,
            }}
            {...props}
        >
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
    );
}
