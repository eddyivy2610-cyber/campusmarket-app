import React from "react";
import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandHero } from "../components/home/RebrandHero";
import { RebrandPopularOnCampus } from "../components/home/RebrandPopularOnCampus";
import { RebrandLowerSections } from "../components/home/RebrandLowerSections";
import { RebrandFooter } from "../components/sections/RebrandFooter";

export default function Home() {
  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />
      <main className="flex-1">
        <RebrandHero />
        <RebrandPopularOnCampus />
        <RebrandLowerSections />
      </main>
      <RebrandFooter />
    </div>
  );
}
