"use client";

import React, { useState } from "react";
import { ProfessionalProfileHeader } from "@/components/profile/ProfessionalProfileHeader";
import { ProfessionalProfileTabs } from "@/components/profile/ProfessionalProfileTabs";
import { MainHeader } from "@/components/header/MainHeader";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Footer } from "@/components/sections/Footer";
import { ProfessionalListingsArea } from "@/components/profile/ProfessionalListingsArea";
import { Eye, User, Store } from "lucide-react";

import { PROFILES } from "@/data/profiles";
import { notFound } from "next/navigation";

type ViewAs = "private" | "public";

export default function ProfilePage() {
    const params = useParams();
    const handle = params.handle as string;
    const [viewAs, setViewAs] = useState<ViewAs>("private");

    // Fetch master profile data
    const profile = PROFILES.find(p => p.handle === handle);

    if (!profile) {
        return notFound();
    }

    const breadcrumbItems = [
        { label: "Profile", href: "/profile" },
        { label: profile.name },
    ];

    return (
        <div className="min-h-screen bg-background">
            <MainHeader />

            <div className="bg-secondary/10 border-b border-border/50">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">
                    <Breadcrumb items={breadcrumbItems} />

                    {/* View As Toggle */}
                    <div className="flex items-center gap-2 py-2">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hidden sm:block">
                            View as
                        </span>
                        <div className="flex items-center bg-secondary/40 border border-border/40 rounded-full p-0.5 gap-0.5">
                            <button
                                onClick={() => setViewAs("private")}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewAs === "private"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Store className="w-3 h-3" />
                                Private
                            </button>
                            <button
                                onClick={() => setViewAs("public")}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewAs === "public"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <User className="w-3 h-3" />
                                Public
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 pb-20 space-y-12">
                <ProfessionalProfileHeader profile={profile} viewAs={viewAs} />

                <div className="space-y-12">
                    <ProfessionalProfileTabs profile={profile} viewAs={viewAs} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
