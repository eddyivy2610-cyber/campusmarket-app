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
    Check,
    Eye,
    EyeOff,
    Award
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [showSalesMilestone, setShowSalesMilestone] = useState<boolean>(true);

    useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("ch_privacy_show_sales_milestones");
            if (stored !== null) setShowSalesMilestone(stored !== "false");
        }
    });

    const handleToggleSalesMilestone = () => {
        setShowSalesMilestone((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("ch_privacy_show_sales_milestones", String(next));
                window.dispatchEvent(new Event("ch_privacy_update"));
            }
            return next;
        });
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "privacy", label: "Privacy & Trust", icon: Lock },
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

                             <div className="pt-6 border-t border-border/50">
                                 <h3 className="text-sm font-bold text-foreground mb-1">Profile Privacy</h3>
                                 <p className="text-xs text-muted-foreground mb-4">Choose what transaction information appears publicly to other campus members.</p>
                                 <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                             {showSalesMilestone ? <Award className="w-5 h-5 text-amber-500" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                                         </div>
                                         <div>
                                             <div className="text-sm font-bold flex items-center gap-2">
                                                 Sales Milestone Visibility
                                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${showSalesMilestone ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                                                     {showSalesMilestone ? "Public Milestone" : "Private"}
                                                 </span>
                                             </div>
                                             <p className="text-xs text-muted-foreground mt-0.5">
                                                 {showSalesMilestone
                                                     ? "Displaying confirmed sales milestones (e.g. 25+, 50+, 100+) on your profile and trust card."
                                                     : "Sales milestone is hidden. Your reviews & ratings remain visible."}
                                             </p>
                                         </div>
                                     </div>
                                     <button
                                         type="button"
                                         onClick={handleToggleSalesMilestone}
                                         className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                             showSalesMilestone ? "bg-primary" : "bg-muted"
                                         }`}
                                         role="switch"
                                         aria-checked={showSalesMilestone}
                                     >
                                         <span
                                             aria-hidden="true"
                                             className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                 showSalesMilestone ? "translate-x-5" : "translate-x-0"
                                             }`}
                                         />
                                     </button>
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

                    {activeTab === "privacy" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-lg font-bold mb-1 text-foreground">Privacy & Trust Controls</h3>
                                <p className="text-sm text-muted-foreground">Manage your public presence, verified achievements, and profile visibility across campus.</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-secondary/20 border border-border/50 space-y-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Award className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-foreground">Sales Milestone on Profile</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    showSalesMilestone 
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                                        : "bg-muted text-muted-foreground"
                                                }`}>
                                                    {showSalesMilestone ? "Visible" : "Hidden"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                                                Show campus milestone badges (e.g. <strong className="text-foreground font-semibold">25+</strong>, <strong className="text-foreground font-semibold">50+</strong>, <strong className="text-foreground font-semibold">100+</strong> confirmed exchanges) on your profile and trust section instead of raw counts. When toggled off, other students will see &ldquo;Exchange milestone private&rdquo;.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleSalesMilestone}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            showSalesMilestone ? "bg-primary" : "bg-muted"
                                        }`}
                                        role="switch"
                                        aria-checked={showSalesMilestone}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                showSalesMilestone ? "translate-x-5" : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-border/40">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                        Public Profile Trust Card Preview
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            {showSalesMilestone ? <Award className="w-4 h-4 text-amber-500" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                                        </div>
                                        <div className="text-xs">
                                            {showSalesMilestone ? (
                                                <>
                                                    <span className="font-bold text-foreground">25+ confirmed exchanges</span>
                                                    <span className="text-muted-foreground block text-[11px]">Campus verified exchange milestone</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-muted-foreground">Exchange milestone private</span>
                                                    <span className="text-muted-foreground block text-[11px]">Seller chose to keep milestone private</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
