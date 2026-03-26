/**
 * @BACKEND: SETTINGS PAGE — Form inputs are UI-only, no data is persisted.
 *
 * Replace with:
 *   - GET /api/users/me/settings   → pre-fill forms with current user settings
 *   - PUT /api/users/me/settings   → save updated settings (notifications, privacy, etc.)
 *   - PUT /api/users/me            → update profile details (name, bio, social links)
 *   - DELETE /api/users/me         → account deletion
 */

import React from "react";
import Link from "next/link";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { groupSettingsSections } from "../components/settings/settingsSections";

export default function SettingsHubPage() {
    const grouped = groupSettingsSections();

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-[15px]">
            <main className="flex-1 bg-secondary/15 relative overflow-hidden">
                {/* Background decorative flairs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[160px] -mr-96 -mt-96 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px] -ml-64 -mb-64 pointer-events-none" />

                <div className="max-w-[760px] mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-12 text-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="-my-2">
                            <Breadcrumb items={[{ label: "Settings" }]} />
                        </div>
                    </div>

                    <div className="mt-3">
                        <h1 className="text-lg font-semibold text-foreground">Account Settings</h1>
                        <p className="text-[12px] text-muted-foreground mt-1">
                            Choose a category to manage your account details.
                        </p>
                    </div>

                    <div className="mt-6 space-y-6">
                        {Object.entries(grouped).map(([group, items]) => (
                            <section key={group} className="bg-card/80 border border-border/40 rounded-md shadow-sm px-5 py-4">
                                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground mb-3">
                                    {group}
                                </h2>
                                <ul className="space-y-2">
                                    {items.map((item) => (
                                        <li key={item.id}>
                                            <Link
                                                href={`/settings/${item.id}`}
                                                className="group flex items-center justify-between rounded-md border border-transparent bg-secondary/20 px-4 py-3 text-sm text-foreground transition-all hover:border-primary/20 hover:bg-secondary/40"
                                            >
                                                <span className="font-medium">{item.label}</span>
                                                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                                                    Manage
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                </div>
            </main>

            <div className="hidden lg:block">
                            </div>
        </div>
    );
}
