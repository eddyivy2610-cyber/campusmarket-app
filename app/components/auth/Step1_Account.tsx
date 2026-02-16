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
                        className="flex h-12 w-full rounded-xl bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a secure password"
                            className="flex h-12 w-full rounded-xl bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
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

            <div className="flex items-center gap-4">
                <div className="h-px bg-border flex-1" />
                <span className="text-xs text-muted-foreground uppercase">or</span>
                <div className="h-px bg-border flex-1" />
            </div>

            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-muted/50 hover:bg-accent hover:text-accent-foreground h-12 w-full">
                <img src="/google.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
            </button>

            <div className="text-center text-sm">
                Already have an account?{" "}
                <button onClick={onSwitchMode} className="text-primary hover:underline font-medium">Sign in</button>
            </div>
        </div>
    );
}
