"use client";

interface StepProps {
    onNext: () => void;
}

export function Step3_Identity({ onNext }: StepProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">How should we identify you?</h2>
                <p className="text-muted-foreground">Use your name or a business/shop name.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Display name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        placeholder="e.g. Daniel A. / Tech Deals Store"
                        className="flex h-12 w-full rounded-xl bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Department or hostel <span className="text-muted-foreground font-normal">(Optional)</span></label>
                    <input
                        type="text"
                        placeholder="e.g. Computer Science / Hall 3"
                        className="flex h-12 w-full rounded-xl bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <p className="text-[10px] text-muted-foreground">Helps build trust with buyers on campus.</p>
                </div>
            </div>

            <button
                onClick={onNext}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full shadow-lg shadow-primary/20"
            >
                Continue
            </button>
        </div>
    );
}
