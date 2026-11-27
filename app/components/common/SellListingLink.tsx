"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/apiClient";

interface SellListingLinkProps {
  className?: string;
  children: React.ReactNode;
  onBeforeNavigate?: () => void;
}

/**
 * Checks whether the signed-in user already owns a store (/api/stores/me)
 * and routes to /listings/create when they do, or /onboarding/seller when they do not.
 */
export function SellListingLink({
  className,
  children,
  onBeforeNavigate,
}: SellListingLinkProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (checking) return;
    onBeforeNavigate?.();
    setChecking(true);
    try {
      const res: any = await apiGet("/api/stores/me");
      const stores: any[] = res?.data?.stores || res?.stores || (Array.isArray(res?.data) ? res.data : []);
      const hasActiveStore = stores.some((s) => s && s.status === "active");
      router.push(hasActiveStore ? "/listings/create" : "/onboarding/seller");
    } catch (err: any) {
      if (err?.status === 401) {
        router.push("/login?next=/listings/create");
      } else {
        router.push("/onboarding/seller");
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <Link
      href="/listings/create"
      onClick={handleClick}
      aria-busy={checking}
      className={className}
    >
      {children}
    </Link>
  );
}
