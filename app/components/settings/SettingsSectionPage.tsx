import React, { Suspense } from "react";
import { SectionId } from "./settingsSections";
import {
  RebrandSettingsShell,
  SettingsDestinationId,
} from "./RebrandSettingsShell";

const MAP_LEGACY_SECTION_ID: Record<SectionId, SettingsDestinationId> = {
  profile: "profile",
  business: "marketplace",
  payment: "marketplace",
  security: "security",
  preferences: "privacy",
  help: "verification",
  "account-status": "security",
  "profile-activity": "privacy",
  logout: "security",
  "switch-account": "security",
};

export function SettingsSectionPage({ sectionId }: { sectionId: SectionId }) {
  const mappedDestination = MAP_LEGACY_SECTION_ID[sectionId] || "profile";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015]">
          <div className="w-8 h-8 rounded-full border-2 border-[#171717] dark:border-white border-t-transparent animate-spin" />
        </div>
      }
    >
      <RebrandSettingsShell initialDestination={mappedDestination} />
    </Suspense>
  );
}
