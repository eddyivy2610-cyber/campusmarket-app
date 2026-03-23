import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../common/Breadcrumb";
import { Footer } from "../sections/Footer";
import { ProfileSettings } from "./sections/ProfileSettings";
import { SecuritySettings } from "./sections/SecuritySettings";
import { PreferencesSettings } from "./sections/PreferencesSettings";
import { BusinessSettings } from "./sections/BusinessSettings";
import { AccountStatusSettings } from "./sections/AccountStatusSettings";
import { SignOutSettings } from "./sections/SignOutSettings";
import { SwitchAccountSettings } from "./sections/SwitchAccountSettings";
import { ProfileActivitySettings } from "./sections/ProfileActivitySettings";
import { SETTINGS_SECTIONS, SectionId } from "./settingsSections";

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

const SECTION_COMPONENTS: Record<SectionId, React.ReactNode> = {
    profile: <ProfileSettings />,
    business: <BusinessSettings />,
    payment: <SectionPlaceholder title="My Payment Options" />,
    security: <SecuritySettings />,
    preferences: <PreferencesSettings />,
    help: <SectionPlaceholder title="Help & Support" />,
    "account-status": <AccountStatusSettings />,
    "profile-activity": <ProfileActivitySettings />,
    logout: <SignOutSettings />,
    "switch-account": <SwitchAccountSettings />,
};

export function SettingsSectionPage({ sectionId }: { sectionId: SectionId }) {
    const section = SETTINGS_SECTIONS.find((item) => item.id === sectionId);

    if (!section) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-[15px]">
            <main className="flex-1 bg-secondary/15 relative overflow-hidden">
                {/* Background decorative flairs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[160px] -mr-96 -mt-96 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px] -ml-64 -mb-64 pointer-events-none" />

                <div className="max-w-[1000px] mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-12 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="-my-2">
                            <Breadcrumb
                                items={[
                                    { label: "Settings", href: "/settings" },
                                    { label: section.label },
                                ]}
                            />
                        </div>
                        <Link
                            href="/settings"
                            className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Back to Settings
                        </Link>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <div className="w-full max-w-[860px] bg-card border border-border/40 shadow-sm rounded-md px-6 py-5 md:px-8 md:py-6">
                            {SECTION_COMPONENTS[sectionId]}
                        </div>
                    </div>
                </div>
            </main>

            <div className="hidden lg:block">
                <Footer />
            </div>
        </div>
    );
}

