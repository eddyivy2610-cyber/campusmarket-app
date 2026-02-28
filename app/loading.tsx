import { ShoppingBasket } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-8">

            {/* Animated Logo */}
            <div className="relative flex items-center justify-center">
                {/* Outer spinning ring */}
                <div className="absolute w-28 h-28 rounded-full border-[3px] border-transparent border-t-primary border-r-primary/40 animate-spin" />

                {/* Inner pulsing glow */}
                <div className="absolute w-20 h-20 rounded-full bg-primary/10 animate-pulse" />

                {/* Logo icon */}
                <div className="relative z-20 bg-background rounded-full p-4 shadow-xl ring-1 ring-border/30">
                    <ShoppingBasket className="w-10 h-10 text-primary animate-bounce" style={{ animationDuration: '1.5s' }} />
                </div>
            </div>

            {/* Brand Name */}
            <div className="flex flex-col items-center gap-3">
                <h1 className="text-2xl font-extrabold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-500 to-rose-500 tracking-tight">
                    CampusMarket
                </h1>

                {/* Animated loading bar */}
                <div className="w-48 h-1 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-orange-500 to-rose-500 rounded-full"
                        style={{
                            animation: 'loadingBar 1.5s ease-in-out infinite',
                        }}
                    />
                </div>

                <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase mt-1 animate-pulse">
                    Loading your marketplace...
                </p>
            </div>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes loadingBar {
                    0% {
                        width: 0%;
                        margin-left: 0%;
                    }
                    50% {
                        width: 70%;
                        margin-left: 15%;
                    }
                    100% {
                        width: 0%;
                        margin-left: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
