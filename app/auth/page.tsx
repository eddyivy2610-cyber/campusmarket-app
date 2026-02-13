"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthContainer } from "../components/auth/AuthContainer";

export default function AuthPage() {
    return (
        <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
            {/* Header / Back */}
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="p-2 rounded-full bg-background border border-border group-hover:bg-secondary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                </Link>
            </div>

            <AuthContainer />
        </div>
    );
}
