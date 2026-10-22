"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProfileRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    let savedHandle = "";
    try {
      const raw = localStorage.getItem("ch_profile_identity_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.username) {
          savedHandle = String(parsed.username).replace(/^@/, "").toLowerCase();
        }
      }
    } catch {
      // ignore storage errors
    }
    const targetHandle = savedHandle || user?.handle || "tundebello";
    router.replace(`/profile/${targetHandle}`);
  }, [isLoading, router, user]);

  return null;
}

