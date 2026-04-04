"use client";

import React, { useState, useEffect } from "react";
import { Instagram, Twitter, Linkedin, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiGet, apiPatch } from "@/lib/apiClient";

const SOCIAL_OPTIONS = [
    { id: "whatsapp", label: "WhatsApp", icon: Phone, placeholder: "https://wa.me/234..." },
    { id: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/" },
    { id: "twitter", label: "Twitter", icon: Twitter, placeholder: "https://twitter.com/" },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/" },
] as const;

export function ProfileSettings() {
    const { user, login } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        bio: "",
        socialLinks: {
            whatsapp: "",
            instagram: "",
            twitter: "",
            linkedin: ""
        }
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) return;
            try {
                const response: any = await apiGet(`/api/user/${user.id}`);
                const data = response?.data;
                if (data) {
                    const fullName = data.personalDetails?.fullName || "";
                    const parts = fullName.split(" ");
                    
                    setFormData({
                        firstName: parts[0] || "",
                        lastName: parts.slice(1).join(" ") || "",
                        email: data.email || "",
                        address: data.personalDetails?.address || "",
                        bio: data.profile?.bio || "",
                        socialLinks: {
                            whatsapp: data.socialLinks?.whatsapp || "",
                            instagram: data.socialLinks?.instagram || "",
                            twitter: data.socialLinks?.twitter || "",
                            linkedin: data.socialLinks?.linkedin || ""
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to fetch user data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        setSuccessMsg("");
        setError("");
        
        try {
            const payload = {
                personalDetails: {
                    fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                    address: formData.address
                },
                profile: {
                    bio: formData.bio
                },
                socialLinks: formData.socialLinks
            };

            const response: any = await apiPatch(`/api/user/update/${user.id}`, payload);
            
            if (response.success || response.data) {
                setSuccessMsg("Profile updated successfully!");
                // Optionally update the local auth context if name changed
                if (payload.personalDetails.fullName !== user.name) {
                    login({ ...user, name: payload.personalDetails.fullName });
                }
            }
        } catch (err: any) {
            setError(err?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-primary">Edit Your Profile</h2>
                {successMsg && (
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-emerald-100 italic">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {successMsg}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground uppercase tracking-widest opacity-60">First Name</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-secondary/20 border border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg font-medium"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground uppercase tracking-widest opacity-60">Last Name</label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-secondary/20 border border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg font-medium"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground uppercase tracking-widest opacity-60">Email (Read-only)</label>
                    <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-secondary/10 border border-border/20 px-3 py-2 text-sm text-foreground/50 cursor-not-allowed rounded-lg font-medium"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground uppercase tracking-widest opacity-60">Location / Address</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g. Hostels, Off-campus area"
                        className="w-full bg-secondary/20 border border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg font-medium"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-foreground uppercase tracking-widest opacity-60">Short Bio</label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-secondary/20 border border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl font-medium resize-none"
                />
            </div>

            <div className="space-y-3">
                <h3 className="text-[12px] font-bold text-foreground border-b border-border/40 pb-2 flex items-center gap-2">
                    Social Links <span className="text-[10px] font-normal text-muted-foreground opacity-60">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SOCIAL_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                            <div key={option.id} className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-foreground flex items-center gap-2 opacity-60">
                                    <Icon className="w-3.5 h-3.5" /> {option.label}
                                </label>
                                <input
                                    type="url"
                                    value={formData.socialLinks[option.id]}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        socialLinks: { ...formData.socialLinks, [option.id]: e.target.value } 
                                    })}
                                    placeholder={option.placeholder}
                                    className="w-full bg-secondary/20 border border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg font-medium"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-semibold">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                    disabled={isSaving}
                    onClick={() => window.location.reload()}
                    className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                >
                    Discard Changes
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-primary text-white text-[12px] font-bold shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all rounded-xl flex items-center gap-2 uppercase tracking-widest"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
                </button>
            </div>
        </div>
    );
}
