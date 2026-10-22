"use client";

import React, { useRef, useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { useCampus } from "../../context/CampusContext";
import { useClickOutside } from "../../hooks/useClickOutside";

export function CampusSelectorPill() {
  const { selectedCampus, campuses, selectCampus } = useCampus();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setOpen(false));

  return (
    <div ref={dropdownRef} className="relative z-40 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 bg-black/40 hover:bg-white/10 backdrop-blur-lg border border-white/15 rounded-lg px-2.5 py-1.5 text-white transition-colors cursor-pointer"
        title={`Current campus: ${selectedCampus.name}`}
      >
        <MapPin className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
        <span className="text-[11px] font-bold font-heading tracking-wide whitespace-nowrap">
          {selectedCampus.shortName}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-white/70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border/60 bg-card text-foreground shadow-2xl p-2.5 z-50 font-heading">
          <div className="px-2.5 py-1.5 border-b border-border/50 mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Select University Campus
            </p>
          </div>

          <div className="space-y-1">
            {campuses.map((c) => {
              const active = c.slug === selectedCampus.slug;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    selectCampus(c.slug);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer ${
                    active
                      ? "bg-primary/15 text-foreground font-bold border border-primary/40"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {c.universityName} • {c.landmarks.length} landmarks
                    </p>
                  </div>
                  {active && (
                    <Check className="w-3.5 h-3.5 text-amber-600 dark:text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-border/50 px-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Approved Meetup Landmarks
            </p>
            <div className="flex flex-wrap gap-1">
              {selectedCampus.landmarks.slice(0, 4).map((lm) => (
                <span
                  key={lm.id}
                  className="text-[9px] font-medium bg-secondary px-1.5 py-0.5 rounded text-muted-foreground"
                >
                  {lm.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
