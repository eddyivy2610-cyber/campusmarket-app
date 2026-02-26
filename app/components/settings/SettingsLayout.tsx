"use client";

import React, { useState, useEffect } from "react";
import {
    ChevronRight,
    X,
    Menu,
    ShoppingBasket,
    ArrowLeft,
    Settings,
    Edit3,
    Camera,
    Check
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { AccountSettings } from "./sections/AccountSettings";
import { ProfileSettings } from "./sections/ProfileSettings";
import { PrivacySettings } from "./sections/PrivacySettings";
import { NotificationSettings } from "./sections/NotificationSettings";
import { SecuritySettings } from "./sections/SecuritySettings";
import { PaymentSettings } from "./sections/PaymentSettings";
import { BlockedUsers } from "./sections/BlockedUsers";
import { HelpSettings } from "./sections/HelpSettings";

type SettingsSection =
    | "account"
    | "profile"
    | "privacy"
    | "notifications"
    | "security"
    | "payments"
    | "blocked"
    | "help";

interface NavItem {
    id: SettingsSection;
    label: string;
}

const NAV_ITEMS: (NavItem & { icon: any })[] = [
    { id: "account", label: "Personal Information", icon: Settings },
    { id: "profile", label: "Public Profile", icon: Edit3 },
    { id: "security", label: "Account Security", icon: Settings },
    { id: "privacy", label: "Privacy Settings", icon: Settings },
    { id: "notifications", label: "Preferences", icon: Settings },
    { id: "payments", label: "Payments", icon: Settings },
    { id: "blocked", label: "Blocked Users", icon: Settings },
    { id: "help", label: "Help & Support", icon: Settings },
];

export function SettingsLayout() {
    const [activeSection, setActiveSection] = useState<SettingsSection | "menu">("account");
    const [isMobile, setIsMobile] = useState(false);

    // Initial check and resize listener for mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile && activeSection !== "menu") {
                // Stay in section if mobile
            } else if (!mobile && activeSection === "menu") {
                setActiveSection("account");
            }
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [activeSection]);

    // On mobile, if we load settings, we might want to start at "menu"
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setActiveSection("menu");
        }
    }, []);

    const activeItem = NAV_ITEMS.find(item => item.id === activeSection);

    return (
        <div className="max-w-[1240px] mx-auto lg:px-6 lg:py-12 min-h-screen lg:min-h-0 bg-background lg:bg-transparent font-heading">
            {/* Desktop Header Navigation */}
            <div className="hidden lg:flex mb-12 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-primary">
                        <ShoppingBasket className="w-6 h-6" />
                    </span>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 font-heading">
                        CampusMarket
                    </span>
                </Link>

                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>
            </div>

            {/* Mobile Local Header */}
            <div className="lg:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/10 px-4 py-4 flex items-center justify-between">
                <button
                    onClick={() => activeSection === "menu" ? window.history.back() : setActiveSection("menu")}
                    className="p-2 -ml-2 text-foreground/80 hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-bold">
                    {activeSection === "menu" ? "My Profile" : activeItem?.label}
                </h2>
                <div className="w-10 flex justify-end">
                    {activeSection === "menu" ? (
                        <Settings className="w-6 h-6 text-foreground/80" />
                    ) : (
                        <Check className="w-6 h-6 text-primary" />
                    )}
                </div>
            </div>

            <h1 className="hidden lg:block text-4xl font-bold tracking-tight mb-10">Settings</h1>

            <div className="flex flex-col lg:flex-row gap-12 items-start relative">
                {/* Desktop Sidebar Navigation */}
                <aside className="hidden lg:block w-56 shrink-0 sticky top-24">
                    <nav className="flex flex-col space-y-4">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={cn(
                                    "text-left text-sm font-medium transition-colors duration-200",
                                    activeSection === item.id
                                        ? "text-primary font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 w-full min-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: isMobile ? 20 : 0, y: isMobile ? 0 : 5 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: isMobile ? -20 : 0, y: isMobile ? 0 : -5 }}
                            transition={{ duration: 0.2 }}
                            className={cn(isMobile ? "px-0" : "space-y-12")}
                        >
                            {activeSection === "menu" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                                    {/* Profile Hero Mobile */}
                                    <div className="px-6 py-4 flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full border-2 border-background shadow-xl overflow-hidden">
                                                <img
                                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte"
                                                    alt="User"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-lg border border-border/20 flex items-center justify-center text-foreground/80 hover:text-primary transition-colors">
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <h3 className="text-2xl font-bold">Lucky John</h3>
                                                <p className="text-sm text-muted-foreground font-medium">lucky@john.com</p>
                                            </div>
                                            <button
                                                onClick={() => setActiveSection("profile")}
                                                className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
                                            >
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile List Navigation */}
                                    <div className="bg-card/50 lg:hidden px-2">
                                        <div className="space-y-1">
                                            {NAV_ITEMS.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveSection(item.id)}
                                                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/50 active:bg-secondary transition-colors group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                                            <item.icon className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[15px] font-semibold text-foreground/90">{item.label}</span>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-8 px-4 pb-12">
                                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 active:bg-red-100 transition-colors">
                                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                                    <X className="w-5 h-5" />
                                                </div>
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection !== "menu" && (
                                <div className={cn(isMobile ? "px-6 py-6" : "")}>
                                    {activeSection === "account" && <AccountSettings />}
                                    {activeSection === "profile" && <ProfileSettings />}
                                    {activeSection === "privacy" && <PrivacySettings />}
                                    {activeSection === "notifications" && <NotificationSettings />}
                                    {activeSection === "security" && <SecuritySettings />}
                                    {activeSection === "payments" && <PaymentSettings />}
                                    {activeSection === "blocked" && <BlockedUsers />}
                                    {activeSection === "help" && <HelpSettings />}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
