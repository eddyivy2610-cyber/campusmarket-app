"use client";

import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileTabs } from "../components/profile/ProfileTabs";
import { ListingGrid } from "../components/profile/ListingGrid";
import { ReviewsSection, AboutSection } from "../components/profile/ProfileContent";
import { AccountUtilities } from "../components/profile/AccountUtilities";
import { useState } from "react";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("listings");

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 w-full py-4 flex flex-col items-center">
                <div className="w-full max-w-[1780px] px-4 md:px-12 space-y-6">

                    {/* Profile Identity & Reputation Section */}
                    <div className="reveal">
                        <ProfileHeader isOwner={false} />
                    </div>

                    {/* Profile Navigation & Content */}
                    <div className="mt-12">
                        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} isOwner={false} />

                        <div className="mt-8 min-h-[400px]">
                            {activeTab === "listings" && <ListingGrid />}
                            {activeTab === "reviews" && <ReviewsSection />}
                            {activeTab === "about" && <AboutSection />}
                            {activeTab === "wallet" && <AccountUtilities />}
                            {activeTab === "orders" && (
                                <div className="flex flex-col items-center justify-center py-32 text-center bg-secondary/30 rounded-[2.5rem] border border-dashed border-border animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <h3 className="text-xl font-bold text-foreground mb-2 uppercase tracking-tighter">Your Orders Hub</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto font-medium">You haven't made any purchases or sales orders yet. Active transactions will appear here.</p>
                                </div>
                            )}
                            {activeTab === "settings" && <AccountUtilities />}
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
