"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface StepProps {
    onNext: () => void;
    onSwitchMode: () => void;
}

export function Step1_Account({ onNext, onSwitchMode }: StepProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
                <p className="text-muted-foreground">Join Campus Market to buy & sell with students around you.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Email address</label>
                    <input
                        type="email"
                        placeholder="name@school.edu.ng"
                        className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a secure password"
                            className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={onNext}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full shadow-lg shadow-primary/20"
            >
                Continue
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
            </div>

            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 w-full">
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-.4167-.0333-.8167-.1-1.2167H12.0003v3.2h4.8333c-.2083 1.125-.8667 2.075-1.8333 2.7167v2.225h2.9667c1.7333-1.6 2.7333-3.95 2.7333-6.6334 0-.6666-.075-1.3166-.2-1.9416H12.0003V12h8.65c.0917.5.15 1.0167.15 1.55 0 2.6167-.9333 4.8167-2.4833 6.4333-1.55 1.6167-3.6 2.5167-5.9667 2.5167-3.7833 0-6.9833-2.55-8.1333-6.0167h-3.05v2.35c1.55 3.0833 4.7 5.1667 8.3333 5.1667z" fill="#4285F4"></path><path d="M3.86697 14.2833c-.28333-.85-.45-1.7667-.45-2.7167 0-.95.16667-1.8667.45-2.7167v-2.35h-3.05c-.63333 1.25-.98333 2.6667-.98333 4.15 0 1.4834.35 2.9 1.01667 4.15l3.01666-2.5166z" fill="#FBBC05"></path><path d="M12.0003 4.75c2.05 0 3.8833.7083 5.3333 2.0917l2.4-2.4C17.65 2.5833 15.017 1.75 12.0003 1.75c-3.6333 0-6.7833 2.0833-8.33333 5.1667l3.05 2.35c1.15-3.4667 4.35-6.0167 8.13333-6.0167z" fill="#EA4335"></path><path d="M12.0003 17.5c-2.3667 0-4.4167-.9-5.96663-2.5167l-3.01666 2.5167c1.55 3.0833 4.7 5.1667 8.3333 5.1667 2.3667 0 4.4167-.9 5.9667-2.5167l-3.0167-2.5167c-.2083.5834-1.2917 1.3667-2.3 1.3667z" fill="#34A853"></path></svg>
                Continue with Google
            </button>

            <div className="text-center text-sm">
                Already have an account?{" "}
                <button onClick={onSwitchMode} className="text-primary hover:underline font-medium">Sign in</button>
            </div>
        </div>
    );
}
