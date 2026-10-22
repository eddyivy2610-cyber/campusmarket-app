import React, { Suspense } from "react";
import { RebrandSettingsShell } from "../components/settings/RebrandSettingsShell";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015]">
          <div className="w-8 h-8 rounded-full border-2 border-[#171717] dark:border-white border-t-transparent animate-spin" />
        </div>
      }
    >
      <RebrandSettingsShell initialDestination="profile" />
    </Suspense>
  );
}
