"use client";

import React from "react";
import { Instagram, Twitter, Linkedin, Phone } from "lucide-react";
import { PROFILES } from "../../../data/profiles";

const SOCIAL_OPTIONS = [
    { id: "whatsapp", label: "WhatsApp", icon: Phone, placeholder: "https://wa.me/234..." },
    { id: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/" },
    { id: "twitter", label: "Twitter", icon: Twitter, placeholder: "https://twitter.com/" },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/" },
] as const;

export function ProfileSettings() {
    const profile = PROFILES[0];

    return (
        <div className="space-y-5">
            <h2 className="text-sm font-semibold text-primary">Edit Your Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">First Name</label>
                    <input
                        type="text"
                        defaultValue="Md"
                        className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">Last Name</label>
                    <input
                        type="text"
                        defaultValue="Rimel"
                        className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">Email</label>
                    <input
                        type="email"
                        defaultValue="rimellll@gmail.com"
                        className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">Address</label>
                    <input
                        type="text"
                        defaultValue="Kingston, 5236, United State"
                        className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-[12px] font-semibold text-foreground">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SOCIAL_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const defaultValue = profile.socialLinks?.[option.id] || "";
                        return (
                            <div key={option.id} className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-foreground flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5" /> {option.label}
                                </label>
                                <input
                                    type="url"
                                    defaultValue={defaultValue}
                                    placeholder={option.placeholder}
                                    className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
                <button className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                </button>
                <button className="px-5 py-2 bg-primary text-white text-[12px] font-semibold shadow-sm hover:opacity-90 transition-all">
                    Save Changes
                </button>
            </div>

        </div>
    );
}
