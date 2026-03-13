 "use client";

import Link from "next/link";

interface BackToHomeBarProps {
    className?: string;
}

export function BackToHomeBar({ className = "" }: BackToHomeBarProps) {
    return (
        <div className={`flex justify-end ${className}`}>
            <Link
                href="/"
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-border bg-secondary/40 hover:bg-secondary transition-colors"
            >
                Back to Home
            </Link>
        </div>
    );
}
