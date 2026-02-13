"use client";

import { MainHeader } from "../components/header/MainHeader";
import { Footer } from "../components/sections/Footer";
import { OnboardingContainer } from "../components/seller-onboarding/OnboardingContainer";

export default function SellPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
            <MainHeader />
            <div className="flex-1 w-full bg-secondary/10">
                <OnboardingContainer />
            </div>
            <Footer />
        </main>
    );
}
