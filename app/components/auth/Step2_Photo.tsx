"use client";

import { Upload, Camera } from "lucide-react";

interface StepProps {
    onNext: () => void;
    onSkip: () => void;
}

export function Step2_Photo({ onNext, onSkip }: StepProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Add a profile photo</h2>
                <p className="text-muted-foreground">Profiles with photos build more trust and get better responses.</p>
            </div>

            <div className="relative w-32 h-32 mx-auto">
                <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer group">
                    <Camera className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Upload className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3">
                <button
                    onClick={onNext}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full shadow-lg shadow-primary/20"
                >
                    Upload photo
                </button>
                <div className="pt-2">
                    <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
                        Skip for now
                    </button>
                    <p className="text-[10px] text-muted-foreground mt-1">You can add one anytime.</p>
                </div>
            </div>
        </div>
    );
}
