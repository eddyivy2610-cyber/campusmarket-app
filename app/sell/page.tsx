"use client";

import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { ComingSoon } from "../components/shared/ComingSoon";

export default function SellPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center">
                <ComingSoon />
            </div>
            <Footer />
        </main>
    );
}
