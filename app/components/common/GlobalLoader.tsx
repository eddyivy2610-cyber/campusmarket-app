export function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-[3px] border-border border-t-foreground rounded-full animate-spin" style={{ animationTimingFunction: "linear", animationDuration: "1s" }} />
        </div>
    );
}
