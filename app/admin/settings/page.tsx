'use client';

import { Settings, Globe, Shield, Bell, Users, Save, Lock, Mail, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('General');

    const tabs = [
        { name: 'General', icon: Globe },
        { name: 'Moderation', icon: Shield },
        { name: 'Notifications', icon: Bell },
        { name: 'Security', icon: Lock },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">System Settings</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[9px]">Configure Platform Core & Business Rules</p>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
                    <Save size={14} />
                    Save All Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Navigation Sidebar */}
                <aside className="w-full lg:w-56 flex flex-col gap-1.5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={cn(
                                "flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-left",
                                activeTab === tab.name
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/5"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.name}
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <div className="flex-1 space-y-8">
                    {activeTab === 'General' && (
                        <div className="bg-card border border-border/50 rounded-[24px] p-6 space-y-8">
                            <section className="space-y-5">
                                <h2 className="text-lg font-bold text-foreground uppercase tracking-tight flex items-center gap-3">
                                    <Globe size={18} className="text-primary" />
                                    Platform Identity
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">App Name</label>
                                        <input type="text" defaultValue="Campus Market" className="w-full bg-secondary/5 border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Support Email</label>
                                        <input type="email" defaultValue="support@campusmarket.edu" className="w-full bg-secondary/5 border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-5">
                                <h2 className="text-lg font-bold text-foreground uppercase tracking-tight flex items-center gap-3">
                                    <Sliders size={18} className="text-primary" />
                                    Marketplace Rules
                                </h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex items-center justify-between p-6 bg-secondary/5 rounded-[24px]">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-tight">Enable Direct Payments</h4>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">Allow users to pay through the platform</p>
                                        </div>
                                        <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-secondary/5 rounded-2xl">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-tight">Auto-Archive Listings</h4>
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">Remove listings after 30 days of inactivity</p>
                                        </div>
                                        <div className="w-12 h-6 bg-muted rounded-full relative cursor-pointer">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'Moderation' && (
                        <div className="bg-card border border-border/50 rounded-[32px] p-8 space-y-10">
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-foreground uppercase tracking-tight flex items-center gap-3">
                                    <Shield size={20} className="text-primary" />
                                    Moderation Engine
                                </h2>
                                <div className="space-y-6">
                                    <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[24px] flex items-start gap-4">
                                        <AlertCircle className="text-red-500 mt-1" size={20} />
                                        <div>
                                            <h4 className="text-sm font-bold text-red-600 uppercase tracking-tight">Auto-Flag Threshold</h4>
                                            <p className="text-xs font-semibold text-red-700/60 mt-1">Users with more than 3 reports in 24h will be automatically suspended for review.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">Banned Keywords (Comma separated)</label>
                                        <textarea
                                            defaultValue="scam, hack, fake, drug, weapon"
                                            className="w-full bg-secondary/5 border-none rounded-2xl p-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
