"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Check,
  Flame,
  Sparkles,
  Clock,
} from "lucide-react";
import { RebrandHeader } from "../header/RebrandHeader";
import { RebrandFooter } from "../sections/RebrandFooter";
import { AppPreferencesPanel } from "./AppPreferencesPanel";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPatch, apiPost } from "@/lib/apiClient";

export type SettingsTabId =
  | "profile"
  | "preferences"
  | "security"
  | "marketplace"
  | "verification";

export type SettingsDestinationId = SettingsTabId;

interface SettingsTabItem {
  id: SettingsTabId;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const SETTINGS_TABS: SettingsTabItem[] = [
  {
    id: "profile",
    label: "Profile & Identity",
    subtitle: "Display name, avatar, bio, and campus",
    icon: User,
  },
  {
    id: "preferences",
    label: "App Preferences",
    subtitle: "Theme, notifications, and storefront vacation mode",
    icon: SlidersHorizontal,
  },
  {
    id: "security",
    label: "Account & Security",
    subtitle: "Login email and password management",
    icon: Lock,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    subtitle: "Home feed preference and quick shortcuts",
    icon: ShoppingBag,
  },
  {
    id: "verification",
    label: "Trust & Verification",
    subtitle: "Email, student, and seller verification status",
    icon: ShieldCheck,
  },
];

interface ProfileIdentityData {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  location?: string;
}

const EMPTY_PROFILE_DATA: ProfileIdentityData = {
  name: "",
  username: "",
  bio: "",
  avatar: "",
  location: "",
};

interface VerificationState {
  emailVerified: boolean;
  isStudent: boolean;
  studentVerified: boolean;
  sellerStatus: "none" | "pending" | "approved" | "rejected";
  accountStatus: string;
  storesCount: number;
  primaryStoreSlug?: string;
}

export function RebrandSettingsShell({
  initialDestination = "profile",
}: {
  initialDestination?: SettingsTabId;
}) {
  const searchParams = useSearchParams();
  const { user, login, logout } = useAuth();
  const querySection = searchParams.get("section") as SettingsTabId | null;

  const validQuerySection =
    querySection && SETTINGS_TABS.some((t) => t.id === querySection)
      ? querySection
      : null;

  // Desktop active tab (always shows one panel on the right)
  const [activeTab, setActiveTab] = useState<SettingsTabId>(
    validQuerySection || initialDestination
  );

  // Mobile accordion state: stays hidden inside until clicked (unless deep-linked via ?section=)
  const [mobileOpenTab, setMobileOpenTab] = useState<SettingsTabId | null>(
    validQuerySection
  );

  const [profileData, setProfileData] =
    useState<ProfileIdentityData>(EMPTY_PROFILE_DATA);
  const [initialData, setInitialData] =
    useState<ProfileIdentityData>(EMPTY_PROFILE_DATA);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasStorefront, setHasStorefront] = useState(false);

  // Account & Security state
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [securityErrorMsg, setSecurityErrorMsg] = useState<string | null>(null);

  // Trust & Verification state
  const [verificationState, setVerificationState] = useState<VerificationState>({
    emailVerified: false,
    isStudent: true,
    studentVerified: false,
    sellerStatus: "none",
    accountStatus: "active",
    storesCount: 0,
  });

  // Marketplace Home Feed content preference: "popular" (default), "recent", or "both"
  const [homeFeedPreference, setHomeFeedPreference] = useState<"popular" | "recent" | "both">("popular");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved profile data
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ch_profile_identity_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged: ProfileIdentityData = {
          ...EMPTY_PROFILE_DATA,
          ...parsed,
          username: String(parsed.username || EMPTY_PROFILE_DATA.username)
            .replace(/^@/, "")
            .toLowerCase(),
        };
        setProfileData(merged);
        setInitialData(merged);
      }
    } catch {}

    try {
      const savedFeedPref = localStorage.getItem("ch_home_feed_preference");
      if (savedFeedPref === "popular" || savedFeedPref === "recent" || savedFeedPref === "both") {
        setHomeFeedPreference(savedFeedPref);
      }
    } catch {}
  }, []);

  const handleHomeFeedPreferenceChange = (pref: "popular" | "recent" | "both") => {
    setHomeFeedPreference(pref);
    try {
      localStorage.setItem("ch_home_feed_preference", pref);
      window.dispatchEvent(
        new CustomEvent("ch_home_feed_preference_update", { detail: { preference: pref } })
      );
    } catch {}
    setSaveSuccessMsg("Home feed preference updated!");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  useEffect(() => {
    if (!user?.id) return;
    apiGet<any>("/api/users/profile")
      .then((response) => {
        const data = response?.data || response?.user;
        if (!data) return;
        const storeObj = data.store;
        const isSellerOrStore = Boolean(
          storeObj ||
            data.storeId ||
            data.role === "seller" ||
            data.sellerStatus === "approved" ||
            user.role === "seller" ||
            user.sellerStatus === "approved"
        );
        setHasStorefront(isSellerOrStore);
        const liveData: ProfileIdentityData = {
          ...EMPTY_PROFILE_DATA,
          name:
            data.name ||
            data.profile?.displayName ||
            user.name ||
            "Campus Student",
          username: String(
            data.profile?.handle || user.handle || ""
          )
            .replace(/^@/, "")
            .toLowerCase(),
          bio: data.profile?.bio || "",
          avatar: data.profile?.avatar || user.avatar || "",
          location: data.campus || "",
        };
        setProfileData(liveData);
        setInitialData(liveData);
        setEmail(data.email || user.email || "");
        setVerificationState({
          emailVerified: Boolean(data.emailVerified),
          isStudent: data.isStudent !== false,
          studentVerified: Boolean(data.studentVerified),
          sellerStatus: data.sellerStatus || (isSellerOrStore ? "approved" : "none"),
          accountStatus: data.accountStatus || "active",
          storesCount: Number(data.storesCount || 0),
          primaryStoreSlug: storeObj?.slug,
        });
      })
      .catch(() => {});
  }, [user?.id, user?.role, user?.sellerStatus]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const isStoreOwner = Boolean(
    hasStorefront ||
      user?.role === "seller" ||
      user?.sellerStatus === "approved"
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      setSaveErrorMsg("Full name is required.");
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    const finalData: ProfileIdentityData = {
      ...profileData,
      avatar: avatarPreview || profileData.avatar,
    };

    try {
      const response = await apiPatch<any>("/api/users/profile", {
        displayName: finalData.name,
        bio: finalData.bio,
        campus: finalData.location,
        avatar: finalData.avatar,
      });
      localStorage.setItem("ch_profile_identity_v1", JSON.stringify(finalData));
      setProfileData(finalData);
      setInitialData(finalData);
      setAvatarPreview(null);
      const saved = response?.data || response?.user;
      if (saved) {
        if (user) {
          login({
            ...user,
            name: saved.name || finalData.name,
            handle:
              saved.store?.slug ||
              saved.profile?.handle ||
              finalData.username ||
              user.handle,
            avatar: saved.profile?.avatar || finalData.avatar,
            image: saved.profile?.avatar || finalData.avatar,
          });
        }
      }
      setIsSaving(false);
      setSaveSuccessMsg("Profile & Identity updated successfully.");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      setIsSaving(false);
      setSaveErrorMsg(
        err?.message || "Could not update profile. Please try again."
      );
    }
  };

  const handleCancelProfile = () => {
    setProfileData(initialData);
    setAvatarPreview(null);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrorMsg(null);
    setSaveSuccessMsg(null);

    if (!currentPassword || !newPassword) {
      setSecurityErrorMsg("Please enter both your current and new password.");
      return;
    }
    if (
      newPassword.length < 8 ||
      !/[a-zA-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setSecurityErrorMsg(
        "New password must be at least 8 characters and include a letter and a number."
      );
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res: any = await apiPost("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setSaveSuccessMsg(res?.message || "Password updated successfully.");
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      setSecurityErrorMsg(
        err?.message || "Could not update password. Please try again."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const effectiveAvatar = avatarPreview || profileData.avatar;
  const backProfileHandle = isStoreOwner
    ? profileData.username || user?.handle || "me"
    : "me";

  const renderCategoryContent = (tabId: SettingsTabId, isMobileAccordion = false) => {
    switch (tabId) {
      case "profile":
        return (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {!isMobileAccordion && (
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                  Profile & Identity
                </h2>
                <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                  Manage your campus identity, display information, and academic department.
                </p>
                <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
              </div>
            )}

            {saveSuccessMsg && (
              <div className="radius-native p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[13px] font-semibold flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {saveErrorMsg && (
              <div className="radius-native p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-[13px] font-semibold flex items-center gap-2 shadow-xs">
                <span>{saveErrorMsg}</span>
              </div>
            )}

            <div className="space-y-4 sm:space-y-5">
              {/* Avatar Row */}
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
                <label className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300">
                  Avatar
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#ECEEF2] dark:ring-white/15 ring-offset-2 ring-offset-white dark:ring-offset-[#14161D] bg-[#F3F4F6] dark:bg-white/5 flex items-center justify-center shrink-0">
                    {effectiveAvatar ? (
                      <img
                        src={effectiveAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-[#9CA3AF]" />
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="radius-native px-3.5 py-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[12.5px] font-bold text-[#171717] dark:text-white hover:border-[#FFC928] dark:hover:border-[#FFC928] hover:bg-[#FFC928]/10 transition-colors cursor-pointer"
                  >
                    Change photo
                  </button>
                </div>
              </div>

              {/* Display Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
                <label
                  htmlFor="displayNameInput"
                  className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300"
                >
                  Display Name
                </label>
                <input
                  id="displayNameInput"
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Enter your display name"
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                />
              </div>

              {/* Bio Row */}
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-2 sm:gap-4">
                <label
                  htmlFor="bioInput"
                  className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300 pt-2.5"
                >
                  Bio
                </label>
                <div>
                  <textarea
                    id="bioInput"
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    placeholder="Tell others about what you sell or study..."
                    className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs resize-y"
                  />
                  <div className="text-right text-[11px] text-[#8C929C] mt-1 font-medium">
                    {profileData.bio.length}/180 characters
                  </div>
                </div>
              </div>

              {/* Campus Row */}
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
                <label
                  htmlFor="campusInput"
                  className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300"
                >
                  Campus
                </label>
                <input
                  id="campusInput"
                  type="text"
                  value={profileData.location || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g. UNILAG, OAU, UI..."
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={isSaving || !profileData.name.trim()}
                className="radius-native px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancelProfile}
                className="radius-native px-4 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[13px] font-bold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white hover:border-[#171717] dark:hover:border-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case "preferences":
        return <AppPreferencesPanel />;

      case "security":
        return (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            {!isMobileAccordion && (
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                  Account & Security
                </h2>
                <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                  View your login email and update your account password.
                </p>
                <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
              </div>
            )}

            {saveSuccessMsg && (
              <div className="radius-native p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[13px] font-semibold flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {securityErrorMsg && (
              <div className="radius-native p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-[13px] font-semibold flex items-center gap-2 shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{securityErrorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                <label className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300 sm:pt-2.5">
                  Email Address
                </label>
                <div className="w-full max-w-md space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={email}
                      readOnly
                      disabled
                      className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-[#F3F4F6] dark:bg-white/5 px-3.5 py-2.5 text-[13.5px] text-[#5B636E] dark:text-neutral-300 cursor-not-allowed"
                    />
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        verificationState.emailVerified
                          ? "bg-[#E8F8F0] text-[#15803D] border-[#A7F3D0] dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                      }`}
                    >
                      {verificationState.emailVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68707A] dark:text-neutral-400">
                    Your primary login email cannot be changed directly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
                <label
                  htmlFor="currentPasswordInput"
                  className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300"
                >
                  Current Password
                </label>
                <input
                  id="currentPasswordInput"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="radius-native w-full max-w-md rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                <label
                  htmlFor="newPasswordInput"
                  className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300 sm:pt-2.5"
                >
                  New Password
                </label>
                <div className="w-full max-w-md space-y-1">
                  <input
                    id="newPasswordInput"
                    type="password"
                    placeholder="At least 8 chars, letter & number"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={isUpdatingPassword || !currentPassword || !newPassword}
                className="radius-native px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setSecurityErrorMsg(null);
                  setSaveSuccessMsg(null);
                }}
                className="radius-native px-4 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[13px] font-bold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white hover:border-[#171717] dark:hover:border-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case "marketplace":
        return (
          <div className="space-y-6">
            {!isMobileAccordion && (
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                  Marketplace
                </h2>
                <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                  Manage your campus inventory, wanted requests, and public seller links.
                </p>
                <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
              </div>
            )}

            {/* Home Feed Content Discovery Preferences */}
            <div className="radius-native p-5 bg-white dark:bg-[#181B24] border border-[#ECEEF2] dark:border-white/10 rounded-2xl space-y-4 shadow-xs">
              <div>
                <h3 className="text-[15px] font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
                  <span>Home Feed Content</span>
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FFC928]/20 text-[#B45309] dark:text-[#FFC928]">
                    Customizable
                  </span>
                </h3>
                <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                  Choose what listings are prioritized and displayed in your campus home feed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Popular Only (Default) */}
                <button
                  type="button"
                  onClick={() => handleHomeFeedPreferenceChange("popular")}
                  className={`radius-native p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    homeFeedPreference === "popular"
                      ? "border-[#FFC928] bg-[#FFFBF0] dark:bg-[#FFC928]/10 ring-1 ring-[#FFC928]"
                      : "border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-[#DCE0E6]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13.5px] font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Popular Only</span>
                      </span>
                      {homeFeedPreference === "popular" && (
                        <Check className="w-4 h-4 text-[#B45309] dark:text-[#FFC928]" />
                      )}
                    </div>
                    <span className="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-[#FFC928] text-[#171717] mb-2">
                      Default (Recommended)
                    </span>
                    <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400 leading-snug">
                      Most engaged items viewed first based on buyer interest, views, and likes.
                    </p>
                  </div>
                </button>

                {/* 2. Recently Listed */}
                <button
                  type="button"
                  onClick={() => handleHomeFeedPreferenceChange("recent")}
                  className={`radius-native p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    homeFeedPreference === "recent"
                      ? "border-[#FFC928] bg-[#FFFBF0] dark:bg-[#FFC928]/10 ring-1 ring-[#FFC928]"
                      : "border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-[#DCE0E6]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13.5px] font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#68707A]" />
                        <span>Recently Added</span>
                      </span>
                      {homeFeedPreference === "recent" && (
                        <Check className="w-4 h-4 text-[#B45309] dark:text-[#FFC928]" />
                      )}
                    </div>
                    <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400 leading-snug mt-1">
                      Newest campus products and services listed in reverse chronological order.
                    </p>
                  </div>
                </button>

                {/* 3. Both */}
                <button
                  type="button"
                  onClick={() => handleHomeFeedPreferenceChange("both")}
                  className={`radius-native p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    homeFeedPreference === "both"
                      ? "border-[#FFC928] bg-[#FFFBF0] dark:bg-[#FFC928]/10 ring-1 ring-[#FFC928]"
                      : "border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-[#DCE0E6]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13.5px] font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Both Streams</span>
                      </span>
                      {homeFeedPreference === "both" && (
                        <Check className="w-4 h-4 text-[#B45309] dark:text-[#FFC928]" />
                      )}
                    </div>
                    <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400 leading-snug mt-1">
                      Balanced discovery feed highlighting trending popular items followed by newest.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[13px] text-[#68707A] dark:text-neutral-400">
                Quick shortcuts to your active campus commerce tools:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <Link
                  href="/profile"
                  className="radius-native p-4 bg-white dark:bg-[#181B24] border border-[#ECEEF2] dark:border-white/10 rounded-xl hover:border-[#FFC928] dark:hover:border-[#FFC928] transition-colors shadow-xs group"
                >
                  <h4 className="text-[13.5px] font-extrabold text-[#171717] dark:text-white group-hover:text-[#D97706] dark:group-hover:text-[#FFC928] transition-colors">
                    My Listings
                  </h4>
                  <p className="text-[12px] text-[#68707A] dark:text-neutral-400 mt-1 leading-snug">
                    View and manage items listed for sale
                  </p>
                </Link>

                <Link
                  href="/wanted"
                  className="radius-native p-4 bg-white dark:bg-[#181B24] border border-[#ECEEF2] dark:border-white/10 rounded-xl hover:border-[#FFC928] dark:hover:border-[#FFC928] transition-colors shadow-xs group"
                >
                  <h4 className="text-[13.5px] font-extrabold text-[#171717] dark:text-white group-hover:text-[#D97706] dark:group-hover:text-[#FFC928] transition-colors">
                    My Requests
                  </h4>
                  <p className="text-[12px] text-[#68707A] dark:text-neutral-400 mt-1 leading-snug">
                    Track requests on Campus Radar
                  </p>
                </Link>

                <Link
                  href="/stores"
                  className="radius-native p-4 bg-white dark:bg-[#181B24] border border-[#ECEEF2] dark:border-white/10 rounded-xl hover:border-[#FFC928] dark:hover:border-[#FFC928] transition-colors shadow-xs group"
                >
                  <h4 className="text-[13.5px] font-extrabold text-[#171717] dark:text-white group-hover:text-[#D97706] dark:group-hover:text-[#FFC928] transition-colors">
                    Store Directory
                  </h4>
                  <p className="text-[12px] text-[#68707A] dark:text-neutral-400 mt-1 leading-snug">
                    Browse verified campus stores
                  </p>
                </Link>
              </div>
            </div>
          </div>
        );

      case "verification": {
        const sellerLabel =
          verificationState.sellerStatus === "approved"
            ? "Approved"
            : verificationState.sellerStatus === "pending"
            ? "Pending Review"
            : verificationState.sellerStatus === "rejected"
            ? "Rejected"
            : "Not Applied";

        const sellerBadgeClass =
          verificationState.sellerStatus === "approved"
            ? "bg-[#E8F8F0] text-[#15803D] dark:bg-emerald-500/10 dark:text-emerald-400 border-[#A7F3D0] dark:border-emerald-500/20"
            : verificationState.sellerStatus === "pending"
            ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
            : verificationState.sellerStatus === "rejected"
            ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
            : "bg-[#F3F4F6] text-[#5B636E] dark:bg-white/5 dark:text-neutral-400 border-[#DCE0E6] dark:border-white/10";

        return (
          <div className="space-y-6">
            {!isMobileAccordion && (
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                  Trust & Verification
                </h2>
                <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                  Review your live email, student, and storefront verification standing.
                </p>
                <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
              </div>
            )}

            <div className="divide-y divide-[#ECEEF2] dark:divide-white/10 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#181B24] overflow-hidden shadow-xs">
              {/* 1. Email Verification */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className={`w-4 h-4 shrink-0 ${
                        verificationState.emailVerified
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-500"
                      }`}
                    />
                    <span className="text-[14px] font-extrabold text-[#171717] dark:text-white">
                      Email Verification
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
                    {email || "No email on file"}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                    verificationState.emailVerified
                      ? "bg-[#E8F8F0] text-[#15803D] dark:bg-emerald-500/10 dark:text-emerald-400 border-[#A7F3D0] dark:border-emerald-500/20"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                  }`}
                >
                  {verificationState.emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>

              {/* 2. Student Identity */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[14px] font-extrabold text-[#171717] dark:text-white">
                    Student Standing
                  </span>
                  <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
                    {verificationState.studentVerified
                      ? "Your campus student status is verified."
                      : verificationState.isStudent
                      ? "Student account pending verification."
                      : "Registered as a non-student account."}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                    verificationState.studentVerified
                      ? "bg-[#E8F8F0] text-[#15803D] dark:bg-emerald-500/10 dark:text-emerald-400 border-[#A7F3D0] dark:border-emerald-500/20"
                      : "bg-[#F3F4F6] text-[#5B636E] dark:bg-white/5 dark:text-neutral-400 border-[#DCE0E6] dark:border-white/10"
                  }`}
                >
                  {verificationState.studentVerified
                    ? "Verified Student"
                    : verificationState.isStudent
                    ? "Pending"
                    : "Standard"}
                </span>
              </div>

              {/* 3. Seller / Storefront Standing */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[14px] font-extrabold text-[#171717] dark:text-white">
                    Storefront Verification
                  </span>
                  <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
                    {verificationState.sellerStatus === "approved"
                      ? `Active storefront (${verificationState.storesCount || 1} store${
                          verificationState.storesCount === 1 ? "" : "s"
                        }).`
                      : verificationState.sellerStatus === "pending"
                      ? "Your storefront application is under review."
                      : verificationState.sellerStatus === "rejected"
                      ? "Your previous storefront application was not approved."
                      : "Apply to open a verified campus storefront."}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sellerBadgeClass}`}
                  >
                    {sellerLabel}
                  </span>
                  {verificationState.sellerStatus === "approved" &&
                  verificationState.primaryStoreSlug ? (
                    <Link
                      href={`/store/${verificationState.primaryStoreSlug}`}
                      className="radius-native px-3 py-1.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[12px] font-bold transition-colors"
                    >
                      View Store
                    </Link>
                  ) : verificationState.sellerStatus !== "approved" &&
                    verificationState.sellerStatus !== "pending" ? (
                    <Link
                      href="/stores/onboarding"
                      className="radius-native px-3 py-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#171717] dark:text-white text-[12px] font-bold hover:border-[#FFC928] transition-colors"
                    >
                      Apply
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-9">
        <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-8 md:p-9">
          {/* =============================================================== */}
          {/* MOBILE VIEW (< md): Facebook-Style Dropdown Accordion           */}
          {/* =============================================================== */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between pb-2">
              <h1 className="text-[20px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                Settings
              </h1>
              <Link
                href="/profile"
                className="radius-native inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-bold text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white bg-[#F7F8FA] dark:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Back to Profile</span>
              </Link>
            </div>

            <div className="space-y-2.5">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isOpen = mobileOpenTab === tab.id;

                return (
                  <div
                    key={tab.id}
                    className={`radius-native rounded-2xl border transition-colors overflow-hidden ${
                      isOpen
                        ? "border-[#FFC928]/60 bg-white dark:bg-[#14161D] shadow-xs"
                        : "border-[#ECEEF2] dark:border-white/10 bg-[#F9FAFB] dark:bg-white/[0.02]"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => {
                        setMobileOpenTab((prev) =>
                          prev === tab.id ? null : tab.id
                        );
                        setActiveTab(tab.id);
                        setSaveSuccessMsg(null);
                      }}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isOpen
                              ? "bg-[#FFC928] text-[#171717]"
                              : "bg-white dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[#5B636E] dark:text-neutral-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-extrabold text-[#171717] dark:text-white truncate">
                            {tab.label}
                          </div>
                          <div className="text-[11.5px] text-[#68707A] dark:text-neutral-400 truncate">
                            {tab.subtitle}
                          </div>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-[#8C929C] shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#171717] dark:text-[#FFC928]" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 pt-2 border-t border-[#ECEEF2] dark:border-white/10 animate-in fade-in slide-in-from-top-1 duration-200">
                        {renderCategoryContent(tab.id, true)}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Mobile Log Out Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="radius-native w-full flex items-center justify-between gap-3 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/15 text-rose-600 dark:text-rose-400">
                      <LogOut className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-extrabold truncate">
                        Log Out
                      </div>
                      <div className="text-[11.5px] text-rose-600/80 dark:text-rose-400/80 truncate">
                        Sign out of your CampusHive account
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* DESKTOP VIEW (md+): Left Sidebar + Right Active Category Panel   */}
          {/* =============================================================== */}
          <div className="hidden md:flex flex-row items-stretch gap-8 lg:gap-12 min-h-[520px]">
            <aside className="w-[220px] lg:w-[240px] shrink-0 flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em] mb-4">
                  Settings
                </h1>

                <nav className="space-y-1.5" aria-label="Settings navigation">
                  {SETTINGS_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSaveSuccessMsg(null);
                        }}
                        className={`radius-native w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#FFC928]/15 dark:bg-[#FFC928]/20 border border-[#FFC928]/40 font-bold text-[#171717] dark:text-white shadow-xs"
                            : "border border-transparent text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-[#F2F4F8] dark:hover:bg-white/5 font-semibold"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? "text-[#171717] dark:text-[#FFC928]"
                              : "text-[#8C929C] dark:text-neutral-500"
                          }`}
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 space-y-2 border-t border-[#ECEEF2] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="radius-native w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" strokeWidth={2.2} />
                  <span>Log Out</span>
                </button>

                <Link
                  href="/profile"
                  className="radius-native w-full inline-flex items-center gap-3 px-3.5 py-2 rounded-xl text-[12.5px] font-bold text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-[#F2F4F8] dark:hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Back to Profile</span>
                </Link>
              </div>
            </aside>

            <div className="flex-1 min-w-0 pl-8 lg:pl-10 border-l border-[#ECEEF2] dark:border-white/10">
              {renderCategoryContent(activeTab, false)}
            </div>
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
