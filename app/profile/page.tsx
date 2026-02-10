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
                        <ProfileHeader isOwner={true} />
                    </div>

                    {/* Profile Navigation & Content */}
                    <div className="bg-secondary/30 rounded-[2rem] border border-white/5 p-5 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden group reveal">
                        {/* Decorative Background Glow */}
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>

                        <div className="relative z-10">
                            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} isOwner={true} />

                            <div className="mt-8 min-h-[400px]">
                                {activeTab === "listings" && <ListingGrid />}
                                {activeTab === "reviews" && <ReviewsSection />}
                                {activeTab === "about" && <AboutSection />}
                                {activeTab === "wallet" && <AccountUtilities />}
                                {activeTab === "orders" && (
                                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <h3 className="text-xl font-bold text-foreground mb-2 uppercase tracking-tighter">Your Orders Hub</h3>
                                        <p className="text-gray-500 text-sm max-w-xs mx-auto font-medium">You haven't made any purchases or sales orders yet. Active transactions will appear here.</p>
                                    </div>
                                )}
                                {activeTab === "settings" && <AccountUtilities />}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
