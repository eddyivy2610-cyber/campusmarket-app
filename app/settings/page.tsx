import React, { Suspense } from "react";
import { RebrandSettingsShell } from "../components/settings/RebrandSettingsShell";
import { SettingsSkeleton } from "../components/common/LoadingSystem";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] transition-colors">
          <SettingsSkeleton />
        </div>
      }
    >
      <RebrandSettingsShell initialDestination="profile" />
    </Suspense>
  );
}
