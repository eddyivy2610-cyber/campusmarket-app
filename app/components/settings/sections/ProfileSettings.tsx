"use client";

import React, { useState } from "react";
import { ChevronDown, Twitter, Instagram, Globe } from "lucide-react";
import { cn } from "../../../lib/utils";

export function ProfileSettings() {
    const [charCount, setCharCount] = useState(124);

    return (
        <div className="max-w-4xl space-y-12 pb-12">
            {/* Public Profile Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Public Profile</h2>
                </div>

                <div className="space-y-8">
                    {/* Display Name & Bio */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                            <input
                                type="text"
                                defaultValue="John Doe"
                                className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-muted-foreground">Short Bio</label>
                                <span className="text-[10px] text-muted-foreground">{charCount}/500</span>
                            </div>
                            <textarea
                                onChange={(e) => setCharCount(e.target.value.length)}
                                defaultValue="CS student at ABU Zaria. Love tech and photography. Selling gently used gadgets."
                                rows={4}
                                className="w-full bg-muted/30 border-none rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed font-medium"
                            />
                        </div>
                    </div>

                    {/* Location & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Location</label>
                            <div className="relative">
                                <select className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium">
                                    <option>Zaria, Nigeria</option>
                                    <option>Kaduna, Nigeria</option>
                                    <option>Abuja, Nigeria</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Student Status</label>
                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10">Yes, I am a student</button>
                                <button className="flex-1 py-3 bg-muted/40 border border-border/10 rounded-xl text-xs font-bold hover:bg-muted/60 transition-colors">No</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Social Presence</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Twitter className="w-3.5 h-3.5" /> Twitter (X)
                        </label>
                        <input
                            type="text"
                            defaultValue="@johndoe"
                            className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Instagram className="w-3.5 h-3.5" /> Instagram
                        </label>
                        <input
                            type="text"
                            defaultValue="@johns_tech"
                            className="w-full bg-transparent border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-6">
                <button className="w-full lg:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98]">
                    Update Profile
                </button>
            </div>
        </div>
    );
}
