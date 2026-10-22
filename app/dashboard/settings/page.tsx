"use client";

import { useState } from "react";
import { 
    User, 
    Shield, 
    Bell, 
    Lock, 
    CreditCard, 
    Palette, 
    Globe,
    Check
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "permissions", label: "Permissions & Tier", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Lock },
    ];

    const tiers = [
        { id: "new", name: "New Vendor", color: "bg-slate-500", limit: "Limited listings", analytics: "30 days" },
        { id: "rising", name: "Rising Vendor", color: "bg-blue-500", limit: "50 listings", analytics: "90 days" },
        { id: "trusted", name: "Trusted Vendor", color: "bg-green-500", limit: "100 listings", analytics: "1 year" },
        { id: "elite", name: "Elite Vendor", color: "bg-primary font-bold text-black", limit: "Unlimited", analytics: "All time" },
    ];

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2 text-foreground">Settings</h1>
                <p className="text-muted-foreground text-sm">Manage your account settings, permissions, and vendor status.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 shrink-0 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    active 
                                    ? "bg-primary text-black shadow-lg shadow-primary/20 scale-[1.02]" 
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm transition-colors duration-300">
                    {activeTab === "profile" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center gap-6 pb-6 border-b border-border/50">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-primary/40 flex items-center justify-center text-3xl font-bold text-black border-4 border-secondary shadow-xl">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{user?.name}</h2>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    <button className="mt-2 text-xs font-bold text-primary hover:underline">Change Avatar</button>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        defaultValue={user?.name}
                                        className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        defaultValue={user?.email}
                                        className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                             </div>

                             <div className="pt-6 flex justify-end">
                                <button className="bg-primary hover:bg-primary/90 text-black px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                                    Save Changes
                                </button>
                             </div>
                        </div>
                    )}

                    {activeTab === "permissions" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div>
                                <h3 className="text-lg font-bold mb-4 text-foreground">Vendor Tier Support</h3>
                                <p className="text-sm text-muted-foreground mb-6">Your account permissions are tied to your vendor tier. Tiers are earned based on your performance and history.</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {tiers.map((tier) => {
                                        const isCurrent = (user?.tier || 'new') === tier.id;
                                        return (
                                            <div 
                                                key={tier.id} 
                                                className={`p-4 rounded-2xl border transition-all ${
                                                    isCurrent 
                                                    ? "border-primary bg-primary/5 shadow-inner" 
                                                    : "border-border/50 bg-secondary/20 grayscale opacity-60"
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg ${tier.color} flex items-center justify-center mb-3 shadow-md`}>
                                                    {isCurrent && <Check className="w-5 h-5 text-white" />}
                                                </div>
                                                <h4 className="font-bold text-sm mb-1">{tier.name}</h4>
                                                <div className="space-y-2 mt-2">
                                                    <div className="flex items-center gap-2 text-[10px]">
                                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                                        <span className="font-medium">{tier.limit}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px]">
                                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                                        <span className="font-medium">{tier.analytics} Analytics</span>
                                                    </div>
                                                </div>
                                                {isCurrent && (
                                                    <div className="mt-4 px-2 py-1 bg-primary text-black text-[9px] font-black uppercase text-center rounded-full leading-none">
                                                        Active Plan
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                             </div>

                             <div className="bg-secondary/30 p-6 rounded-3xl border border-border/50">
                                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" />
                                    How to upgrade?
                                </h4>
                                <ul className="text-xs text-muted-foreground space-y-2 ml-1">
                                    <li>• Complete at least 50 successful sales to reach <span className="text-foreground font-bold italic">Rising Vendor</span></li>
                                    <li>• Maintain a rating above 4.5 and 100+ sales for <span className="text-foreground font-bold italic">Trusted Vendor</span></li>
                                    <li>• Achieve <span className="text-foreground font-bold italic">Elite Vendor</span> status through consistent high performance and campus trust</li>
                                </ul>
                             </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                         <div className="p-8 text-center text-muted-foreground italic animate-in fade-in slide-in-from-right-4 duration-300">
                             Notification preferences coming soon...
                         </div>
                    )}

                    {activeTab === "security" && (
                         <div className="p-8 text-center text-muted-foreground italic animate-in fade-in slide-in-from-right-4 duration-300">
                             Security settings coming soon...
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
}
