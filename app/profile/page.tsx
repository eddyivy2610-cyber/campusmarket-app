"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Store,
  Settings,
  Plus,
  Mail,
  GraduationCap,
  MapPin,
  Lock,
  ExternalLink,
  BadgeCheck,
  User as UserIcon,
} from "lucide-react";
import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandFooter } from "../components/sections/RebrandFooter";
import { useAuth } from "../context/AuthContext";
import { MAX_STORES_PER_USER } from "../constants/enums";

export default function PrivateAccountPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [ownedStores, setOwnedStores] = useState<any[]>([]);
  const [storesQuota, setStoresQuota] = useState<{
    storesCount: number;
    maxStores: number;
    canCreateMore: boolean;
  }>({
    storesCount: 0,
    maxStores: MAX_STORES_PER_USER,
    canCreateMore: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?next=%2Fprofile");
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetch("/api/users/profile", { credentials: "include" })
        .then((r) => r.json())
        .catch(() => null),
      fetch("/api/stores/me", { credentials: "include" })
        .then((r) => r.json())
        .catch(() => null),
    ])
      .then(([profRes, storesRes]) => {
        if (cancelled) return;
        if (profRes?.data) {
          setProfileData(profRes.data);
        }
        if (storesRes?.success && storesRes?.data) {
          const list = Array.isArray(storesRes.data.stores)
            ? storesRes.data.stores
            : storesRes.data.store
            ? [storesRes.data.store]
            : [];
          setOwnedStores(list);
          setStoresQuota({
            storesCount: storesRes.data.storesCount ?? list.length,
            maxStores: storesRes.data.maxStores ?? MAX_STORES_PER_USER,
            canCreateMore:
              storesRes.data.canCreateMore ?? list.length < MAX_STORES_PER_USER,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, router, user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015]">
        <RebrandHeader />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-[#171717] dark:border-white border-t-transparent animate-spin" />
        </main>
        <RebrandFooter />
      </div>
    );
  }

  if (!user) return null;

  const displayName =
    profileData?.profile?.displayName || profileData?.name || user.name || "Campus Member";
  const email = profileData?.email || user.email || "";
  const campus = profileData?.campus || user.campus || "Main Campus";
  const isStudentVerified = Boolean(
    profileData?.studentVerified ?? user.studentVerified
  );
  const avatarUrl =
    profileData?.profile?.avatar || user.avatar || user.image || "";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white">
      <RebrandHeader />
      <main className="flex-1 max-w-[980px] w-full mx-auto px-5 sm:px-8 py-8 space-y-6">
        {/* Privacy Banner */}
        <div className="radius-native rounded-2xl bg-[#171717] text-white p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFC928]/20 text-[#FFC928] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-[14px] font-extrabold">
                Private Account Identity
              </h1>
              <p className="text-[12px] text-neutral-300">
                Your personal account details are private and visible only to you. Public marketplace presence belongs exclusively to your stores.
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="radius-native inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[12px] font-bold shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account Settings</span>
          </Link>
        </div>

        {/* Personal Identity Card */}
        <section className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover border border-[#ECEEF2] dark:border-white/10"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#FFC928] text-[#171717] flex items-center justify-center font-black text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[20px] font-extrabold tracking-tight">
                  {displayName}
                </h2>
                {isStudentVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Verified Student</span>
                  </span>
                )}
                {ownedStores.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFC928]/20 text-[#855B00] dark:text-[#FFC928]">
                    <Store className="w-3 h-3" />
                    <span>Seller ({ownedStores.length}/{storesQuota.maxStores} stores)</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-[#68707A] dark:text-neutral-400">
                {email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{email}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{campus}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Owned Stores Section (Max 3) */}
        <section className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-extrabold">Your Stores</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F2F4F7] dark:bg-white/10">
                  {ownedStores.length} of {storesQuota.maxStores} used
                </span>
              </div>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                You can own up to {storesQuota.maxStores} stores (at most 1 Student Store; each Business Store requires verification).
              </p>
            </div>

            {storesQuota.canCreateMore && (
              <Link
                href="/stores?tab=my-store&create=1"
                className="radius-native inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] text-[12.5px] font-extrabold shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {ownedStores.length === 0 ? "Open a Store" : "Create Another Store"}
                </span>
              </Link>
            )}
          </div>

          {ownedStores.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#DCE0E6] dark:border-white/15 p-8 text-center space-y-2">
              <Store className="w-8 h-8 mx-auto text-[#8C929C]" />
              <p className="text-[14px] font-bold">No stores opened yet</p>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 max-w-md mx-auto">
                Every listing on Campus Hive belongs to a store. Open a student store or apply for a business store to start selling.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ownedStores.map((st: any) => {
                const stId = st._id || st.id;
                return (
                  <div
                    key={stId}
                    className="rounded-xl border border-[#ECEEF2] dark:border-white/10 p-4 flex flex-col justify-between gap-4 bg-[#F9FAFC] dark:bg-white/[0.02]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-extrabold truncate">
                            {st.name}
                          </h4>
                          <p className="text-[11.5px] text-[#7A818C] truncate">
                            /store/{st.slug}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold capitalize ${
                            st.status === "active"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {st.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#68707A]">
                        <span>
                          {st.storeType === "student_store"
                            ? "Student Store"
                            : "Business Store"}
                        </span>
                        <span>·</span>
                        <span>{st.metrics?.listingsCount ?? 0} listings</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#ECEEF2] dark:border-white/10">
                      <Link
                        href={`/stores?tab=my-store&storeId=${encodeURIComponent(stId)}`}
                        className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-[11.5px] font-bold"
                      >
                        Manage
                      </Link>
                      <Link
                        href={`/store/${encodeURIComponent(st.slug)}`}
                        className="py-1.5 px-2.5 rounded-lg border border-[#DCE0E6] dark:border-white/15 text-[11.5px] font-bold inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <RebrandFooter />
    </div>
  );
}
