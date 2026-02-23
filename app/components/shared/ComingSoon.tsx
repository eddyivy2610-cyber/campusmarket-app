import { ChefHat, Rocket } from "lucide-react";

export function ComingSoon() {
    return (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center px-4">
            <div className="bg-secondary p-6 rounded-full mb-6 animate-pulse">
                <ChefHat className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl md:text-5xl font-bold font-heading tracking-tighter mb-4 flex items-center justify-center gap-3">
                Coming Soon
                <Rocket className="w-8 h-8 md:w-12 md:h-12 text-primary animate-bounce-slow" />
            </h1>

            <p className="text-xl font-bold text-foreground/80 mb-2">
                This feature is still cooking.
            </p>

            <p className="text-gray-500 font-medium">
                Swing by again soon to see what’s new.
            </p>
        </div>
    );
}
