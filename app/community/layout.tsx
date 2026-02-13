"use client";

import { MainHeader } from "../components/header/MainHeader";
import { Footer } from "../components/sections/Footer";
import { CommunityNav } from "../components/community/CommunityNav";

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <MainHeader />
            <CommunityNav />
            <main className="flex-1 w-full max-w-[1780px] mx-auto px-4 md:px-8 py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}
