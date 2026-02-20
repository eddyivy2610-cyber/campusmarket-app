"use client";

import React from "react";
import { MainHeader } from "@/components/header/MainHeader";
import { VendorListingsArea } from "@/components/profile/VendorListingsArea";
import { VendorPerformanceArea } from "@/components/profile/VendorPerformanceArea";
import { useParams } from "next/navigation";
import { Store, ArrowUpRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Footer } from "@/components/sections/Footer";
import { Breadcrumb } from "@/components/common/Breadcrumb";

export default function VendorDashboardPage() {
    const params = useParams();
    const handle = params.handle as string;

    // For demonstration, only 'tech-hub' is a premium vendor with history
    const isVendor = handle === "tech-hub" || handle === "techhub";

    const vendorData = {
        activeListings: 24,
        soldItems: 156,
        rating: 4.8,
        responseRate: "95%",
        responseTime: "2 hours",
    };

    const breadcrumbItems = [
        { label: "Vendor Control", href: `/vendor/${handle}` },
        { label: "Activity" },
    ];

    return (
        <div className="min-h-screen bg-background">
            <MainHeader />

            <div className="bg-secondary/10 border-b border-border/50">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 pb-20 space-y-10">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/20">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight">
                            Activity
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/profile/${handle}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-black uppercase tracking-wider rounded-xl border-2 border-border/40 transition-all"
                        >
                            View Public Profile
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {!isVendor ? (
                    /* Empty/Upgrade State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full py-20 px-6 bg-secondary/10 rounded-[32px] border-2 border-dashed border-border/30 flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                            <ShieldAlert className="w-10 h-10" />
                        </div>
                        <div className="space-y-2 max-w-md">
                            <h2 className="text-2xl font-black font-heading tracking-tight">No Listing History</h2>
                            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                You haven't started selling yet! Upgrade to a vendor account to list your services, track sales, and reach thousands of students.
                            </p>
                        </div>
                        <button className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all text-xs">
                            Upgrade to Vendor
                        </button>
                    </motion.div>
                ) : (
                    /* Vendor Active Content */
                    <div className="space-y-12">
                        <VendorListingsArea />
                        <VendorPerformanceArea vendor={vendorData} />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
