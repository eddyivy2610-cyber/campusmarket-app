"use client";

import React from "react";
import { GraduationCap, Building2 } from "lucide-react";
import type { SellerVerificationType } from "../../data/listings";

interface VerificationBadgeProps {
  type?: SellerVerificationType;
  compact?: boolean;
}

/**
 * PRD 3.1.3 & TRUST-01:
 * Visually distinct verification badges for Verified Students vs Approved Local Businesses.
 */
export function VerificationBadge({
  type = "verified_student",
  compact = false,
}: VerificationBadgeProps) {
  if (type === "verified_business") {
    return (
      <span
        title="Approved Local Campus Business"
        className={`inline-flex items-center gap-1 rounded-md font-heading font-bold uppercase tracking-wider border ${
          compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
        } bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25`}
      >
        <Building2 className="w-2.5 h-2.5 shrink-0" />
        <span>{compact ? "Business" : "Approved Business"}</span>
      </span>
    );
  }

  return (
    <span
      title="Verified University Student"
      className={`inline-flex items-center gap-1 rounded-md font-heading font-bold uppercase tracking-wider border ${
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
      } bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25`}
    >
      <GraduationCap className="w-2.5 h-2.5 shrink-0" />
      <span>{compact ? "Student" : "Verified Student"}</span>
    </span>
  );
}
