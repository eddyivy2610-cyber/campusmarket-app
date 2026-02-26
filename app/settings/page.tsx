"use client";

import React from "react";
import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { SettingsLayout } from "../components/settings/SettingsLayout";

export default function SettingsHubPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-heading">

            <main className="flex-1 bg-secondary/15 relative overflow-hidden">
                {/* Background decorative flairs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[160px] -mr-96 -mt-96 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px] -ml-64 -mb-64 pointer-events-none" />

                <SettingsLayout />
            </main>

            <div className="hidden lg:block">
                <Footer />
            </div>
        </div>
    );
}
