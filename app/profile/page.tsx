"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProfileRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login?next=%2Fprofile");
      return;
    }
    const targetHandle = user.handle || user.id;
    router.replace(`/profile/${targetHandle}`);
  }, [isLoading, router, user]);

  return null;
}

