"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { ProfileSettings } from "./sections/ProfileSettings";
import { SecuritySettings } from "./sections/SecuritySettings";
import { PreferencesSettings } from "./sections/PreferencesSettings";
import { BusinessSettings } from "./sections/BusinessSettings";
import { AccountStatusSettings } from "./sections/AccountStatusSettings";
import { SignOutSettings } from "./sections/SignOutSettings";
import { SwitchAccountSettings } from "./sections/SwitchAccountSettings";
import { Breadcrumb } from "../common/Breadcrumb";

type SectionId = "profile" | "business" | "payment" | "security" | "preferences" | "help" | "account-status" | "logout" | "switch-account";

const SIDEBAR_SECTIONS: { id: SectionId; label: string; group: string }[] = [
    { id: "profile", label: "My Profile", group: "Profile" },
    { id: "business", label: "Business", group: "Profile" },
    { id: "payment", label: "My Payment Options", group: "Profile" },
    { id: "security", label: "Security Settings", group: "Account" },
    { id: "preferences", label: "Preferences", group: "Account" },
    { id: "account-status", label: "Deactivation & Deletion", group: "Account" },
    { id: "help", label: "Help & Support", group: "Support" },
    { id: "logout", label: "Log Out", group: "Sign Out" },
    { id: "switch-account", label: "Switch Account", group: "Sign Out" },
];

function SectionPlaceholder({ title }: { title: string }) {
    return (
        <div className="space-y-2">
            <h2 className="text-sm font-semibold text-primary">{title}</h2>
            <p className="text-xs text-muted-foreground">
                This section will be available soon.
            </p>
        </div>
    );
}

export function SettingsLayout() {
    const [activeSection, setActiveSection] = useState<SectionId>("profile");

    const grouped = SIDEBAR_SECTIONS.reduce<Record<string, { id: SectionId; label: string }[]>>((acc, item) => {
        acc[item.group] = acc[item.group] || [];
        acc[item.group].push({ id: item.id, label: item.label });
        return acc;
    }, {});

    return (
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-10 text-sm">
            <div className="flex items-center justify-between gap-3">
                <div className="-my-2">
                    <Breadcrumb items={[{ label: "Settings" }]} />
                </div>
            </div>

            <div className="mt-6 flex flex-col lg:flex-row gap-6 items-start">
                <aside className="w-full lg:w-[220px] shrink-0">
                    <div className="space-y-5">
                        {Object.entries(grouped).map(([group, items]) => (
                            <div key={group}>
                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground mb-1.5">{group}</h3>
                                <ul className="space-y-1">
                                    {items.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => setActiveSection(item.id)}
                                                className={cn(
                                                    "text-left text-[12px] transition-colors",
                                                    activeSection === item.id
                                                        ? "font-semibold text-primary"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {item.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </aside>

                <div className="flex-1 flex justify-center w-full">
                    <main className="w-full max-w-[860px] bg-card border border-border/40 shadow-sm rounded-md px-6 py-5 md:px-8 md:py-6">
                        {activeSection === "profile" && <ProfileSettings />}
                        {activeSection === "business" && <BusinessSettings />}
                        {activeSection === "security" && <SecuritySettings />}
                        {activeSection === "preferences" && <PreferencesSettings />}
                        {activeSection === "account-status" && <AccountStatusSettings />}
                        {activeSection === "logout" && <SignOutSettings />}
                        {activeSection === "switch-account" && <SwitchAccountSettings />}
                        {activeSection === "payment" && <SectionPlaceholder title="My Payment Options" />}
                        {activeSection === "help" && <SectionPlaceholder title="Help & Support" />}
                    </main>
                </div>
            </div>
        </div>
    );
}
