"use client";

import React, { useState, useEffect } from "react";
import { ProfessionalProfileHeader } from "@/components/profile/ProfessionalProfileHeader";
import { ProfessionalProfileTabs } from "@/components/profile/ProfessionalProfileTabs";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Eye, User, Store, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/apiClient";
import { mapUserToProfile, type Profile } from "@/data/profiles";
import { useAuth } from "../../context/AuthContext";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";

type ViewAs = "private" | "public";

export default function ProfilePage() {
    const params = useParams();
    const handle = params?.handle as string;
    const { user: authUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [viewAs, setViewAs] = useState<ViewAs>("public");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!authUser) {
            const nextPath = handle ? `/profile/${handle}` : "/profile";
            router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
            return;
        }
        const fetchProfile = async () => {
            if (!handle) return;
            try {
                setIsLoading(true);
                const response = await apiGet<any>(`/auth/profile/${handle}`);
                
                const profileData = response?.data || response?.user;
                if (profileData) {
                    const mappedProfile = mapUserToProfile(profileData);
                    setProfile(mappedProfile);
                    
                    // If authorized user is viewing their own profile, default to private
                    if (authUser && authUser.handle === mappedProfile.handle) {
                        setViewAs("private");
                    }
                } else {
                    setError("Profile not found");
                }
            } catch (err) {
                console.error("[ProfilePage] Fetch failed", err);
                setError("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [handle, authUser, authLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return notFound();
    }

    const breadcrumbItems = [
        { label: "Profile", href: "/profile" },
        { label: profile.name },
    ];

    const isOwnProfile = authUser && authUser.handle === profile.handle;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="bg-secondary/10 border-b border-border/50">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">
                    <Breadcrumb items={breadcrumbItems} />

                    {/* View As Toggle  - Only show if it's the owner's profile */}
                    {isOwnProfile && (
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
                                    Owner
                                </button>
                                <button
                                    onClick={() => setViewAs("public")}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewAs === "public"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <User className="w-3 h-3" />
                                    Visitor
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 pb-20 space-y-12">
                <ProfessionalProfileHeader profile={profile} viewAs={viewAs} />

                <div className="space-y-12">
                    <ProfessionalProfileTabs profile={profile} viewAs={viewAs} />
                </div>
            </main>
        </div>
    );
}
