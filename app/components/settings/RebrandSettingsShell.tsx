"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Shield,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  BadgeCheck,
} from "lucide-react";
import { RebrandHeader } from "../header/RebrandHeader";
import { RebrandFooter } from "../sections/RebrandFooter";

export type SettingsTabId =
  | "profile"
  | "privacy"
  | "security"
  | "marketplace"
  | "verification";

export type SettingsDestinationId = SettingsTabId;

interface SettingsTabItem {
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const SETTINGS_TABS: SettingsTabItem[] = [
  { id: "profile", label: "Profile & Identity", icon: User },
  { id: "privacy", label: "Contact & Privacy", icon: User },
  { id: "security", label: "Account & Security", icon: Shield },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "verification", label: "Trust & Verification", icon: ShieldCheck },
];

interface ProfileIdentityData {
  name: string;
  username: string;
  bio: string;
  school: string;
  major: string;
  year: string;
  avatar: string;
  coverImage?: string;
  location?: string;
}

const DEFAULT_PROFILE_DATA: ProfileIdentityData = {
  name: "Tunde Bello",
  username: "tundebello",
  bio: "Final year Computer Engineering student. Selling neatly used gadgets, engineering textbooks, and lab gear around Samaru campus.",
  school: "Ahmadu Bello University",
  major: "Computer Engineering",
  year: "500 Level",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=80",
  location: "Suleiman Hostel · Samaru Campus",
};

export function RebrandSettingsShell({
  initialDestination = "profile",
}: {
  initialDestination?: SettingsTabId;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySection = searchParams.get("section") as SettingsTabId | null;

  const [activeTab, setActiveTab] = useState<SettingsTabId>(
    querySection && SETTINGS_TABS.some((t) => t.id === querySection)
      ? querySection
      : initialDestination
  );

  const [profileData, setProfileData] =
    useState<ProfileIdentityData>(DEFAULT_PROFILE_DATA);
  const [initialData, setInitialData] =
    useState<ProfileIdentityData>(DEFAULT_PROFILE_DATA);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Contact & Privacy state
  const [messagingPreference, setMessagingPreference] = useState("everyone");
  const [contactChannel, setContactChannel] = useState("in_app");
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // Account & Security state
  const [email, setEmail] = useState("tunde.bello@abu.edu.ng");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved profile data
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ch_profile_identity_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged: ProfileIdentityData = {
          ...DEFAULT_PROFILE_DATA,
          ...parsed,
          school: parsed.school || parsed.faculty || DEFAULT_PROFILE_DATA.school,
          major: parsed.major || parsed.department || DEFAULT_PROFILE_DATA.major,
          year: parsed.year || parsed.level || DEFAULT_PROFILE_DATA.year,
          username: String(parsed.username || DEFAULT_PROFILE_DATA.username).replace(/^@/, "").toLowerCase(),
        };
        setProfileData(merged);
        setInitialData(merged);
      }
    } catch {
      // ignore
    }
  }, []);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);

    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 400));

    const finalData: ProfileIdentityData = {
      ...profileData,
      avatar: avatarPreview || profileData.avatar,
      username: profileData.username.replace(/^@/, "").trim().toLowerCase(),
    };

    try {
      localStorage.setItem("ch_profile_identity_v1", JSON.stringify(finalData));
      setProfileData(finalData);
      setInitialData(finalData);
      setAvatarPreview(null);
      setIsSaving(false);
      setSaveSuccessMsg("Profile & Identity updated successfully.");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch {
      setIsSaving(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileData(initialData);
    setAvatarPreview(null);
    setSaveSuccessMsg(null);
  };

  const effectiveAvatar = avatarPreview || profileData.avatar;
  const backProfileHandle = profileData.username || "tundebello";

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-7 sm:py-9">
        {/* Main Settings Card Container */}
        <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-8 md:p-9">
          <div className="flex flex-col md:flex-row items-stretch gap-8 lg:gap-12 min-h-[520px]">
            {/* Left Sidebar */}
            <aside className="w-full md:w-[220px] lg:w-[240px] shrink-0 flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em] mb-4">
                  Settings
                </h1>

                {/* Navigation items matching reference with Campus Hive blended highlight */}
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

              {/* Back to Profile at the bottom of left sidebar */}
              <div className="pt-4 border-t border-[#ECEEF2] dark:border-white/10 md:border-t-0">
                <Link
                  href={`/profile/${backProfileHandle}`}
                  className="radius-native inline-flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12.5px] font-bold text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-[#F2F4F8] dark:hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Back to Profile</span>
                </Link>
              </div>
            </aside>

            {/* Right Form / Panel */}
            <div className="flex-1 min-w-0 md:pl-8 lg:pl-10 md:border-l border-[#ECEEF2] dark:border-white/10">
              {/* SECTION: Profile & Identity */}
              {activeTab === "profile" && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Title & Divider Line matching reference with cohesive heading */}
                  <div>
                    <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Profile & Identity
                    </h2>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                      Manage your public campus presence, display information, and academic department.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  {saveSuccessMsg && (
                    <div className="radius-native p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[13px] font-semibold flex items-center gap-2 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  {/* Form fields in clean minimalist grid */}
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

                    {/* Username Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
                      <label
                        htmlFor="usernameInput"
                        className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300"
                      >
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13.5px] font-medium text-[#8C929C]">
                          @
                        </span>
                        <input
                          id="usernameInput"
                          type="text"
                          value={profileData.username}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              username: e.target.value.replace(/^@/, "").toLowerCase(),
                            })
                          }
                          placeholder="username"
                          className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] pl-8 pr-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                        />
                      </div>
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

                    {/* Academic Details Section matching reference */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-2.5">
                        <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
                          Academic Details
                        </h3>
                        <span className="text-[11px] font-semibold text-[#8C929C] bg-[#F2F4F8] dark:bg-white/5 px-2 py-0.5 rounded-md">
                          Campus Identity
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <label
                            htmlFor="schoolInput"
                            className="block text-[12px] font-bold text-[#68707A] dark:text-neutral-400 mb-1.5"
                          >
                            School
                          </label>
                          <input
                            id="schoolInput"
                            type="text"
                            value={profileData.school}
                            onChange={(e) =>
                              setProfileData({ ...profileData, school: e.target.value })
                            }
                            placeholder="e.g. Ahmadu Bello University"
                            className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="majorInput"
                            className="block text-[12px] font-bold text-[#68707A] dark:text-neutral-400 mb-1.5"
                          >
                            Major / Department
                          </label>
                          <input
                            id="majorInput"
                            type="text"
                            value={profileData.major}
                            onChange={(e) =>
                              setProfileData({ ...profileData, major: e.target.value })
                            }
                            placeholder="e.g. Computer Science"
                            className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="yearSelect"
                            className="block text-[12px] font-bold text-[#68707A] dark:text-neutral-400 mb-1.5"
                          >
                            Year / Level
                          </label>
                          <select
                            id="yearSelect"
                            value={profileData.year}
                            onChange={(e) =>
                              setProfileData({ ...profileData, year: e.target.value })
                            }
                            className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs cursor-pointer"
                          >
                            <option value="">Select year</option>
                            <option value="100 Level">100 Level</option>
                            <option value="200 Level">200 Level</option>
                            <option value="300 Level">300 Level</option>
                            <option value="400 Level">400 Level</option>
                            <option value="500 Level">500 Level</option>
                            <option value="Graduate">Graduate</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons with Campus Hive signature styling */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="radius-native px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
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
              )}

              {/* SECTION: Contact & Privacy */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Contact & Privacy
                    </h2>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                      Control who can message you and manage your visibility in campus chat.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  {saveSuccessMsg && (
                    <div className="radius-native p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[13px] font-semibold flex items-center gap-2 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2 sm:gap-4">
                      <label className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300">
                        Who can message you
                      </label>
                      <select
                        value={messagingPreference}
                        onChange={(e) => setMessagingPreference(e.target.value)}
                        className="radius-native w-full max-w-md rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs cursor-pointer"
                      >
                        <option value="everyone">Everyone on campus</option>
                        <option value="verified">Verified students only</option>
                        <option value="listings">Inquiries on active listings only</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2 sm:gap-4">
                      <label className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300">
                        Contact channel
                      </label>
                      <select
                        value={contactChannel}
                        onChange={(e) => setContactChannel(e.target.value)}
                        className="radius-native w-full max-w-md rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs cursor-pointer"
                      >
                        <option value="in_app">In-app messages only (Recommended)</option>
                        <option value="whatsapp">Allow WhatsApp handoff after deal starts</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2 sm:gap-4">
                      <label className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300">
                        Online presence
                      </label>
                      <label className="inline-flex items-center gap-2.5 cursor-pointer text-[13px] font-medium text-[#4B5563] dark:text-neutral-300">
                        <input
                          type="checkbox"
                          checked={showOnlineStatus}
                          onChange={(e) => setShowOnlineStatus(e.target.checked)}
                          className="w-4 h-4 rounded border-[#DCE0E6] text-[#FFC928] focus:ring-[#FFC928] accent-[#FFC928] cursor-pointer"
                        />
                        <span>Show when I am active in chat threads</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSaveSuccessMsg("Privacy preferences saved.");
                        setTimeout(() => setSaveSuccessMsg(null), 3000);
                      }}
                      className="radius-native px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="radius-native px-4 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[13px] font-bold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white hover:border-[#171717] dark:hover:border-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: Account & Security */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Account & Security
                    </h2>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                      Update your account credentials, login email, and authentication passwords.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  {saveSuccessMsg && (
                    <div className="radius-native p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[13px] font-semibold flex items-center gap-2 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
                      <label className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="radius-native w-full max-w-md rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
                      <label className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="radius-native w-full max-w-md rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
                      <label className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-300">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="radius-native w-full max-w-md rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                        setSaveSuccessMsg("Security settings updated.");
                        setTimeout(() => setSaveSuccessMsg(null), 3000);
                      }}
                      className="radius-native px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="radius-native px-4 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[13px] font-bold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white hover:border-[#171717] dark:hover:border-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: Marketplace */}
              {activeTab === "marketplace" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Marketplace
                    </h2>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                      Manage your campus inventory, wanted requests, and public seller links.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[13px] text-[#68707A] dark:text-neutral-400">
                      Quick shortcuts to your active campus commerce tools:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <Link
                        href={`/profile/${backProfileHandle}`}
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
              )}

              {/* SECTION: Trust & Verification */}
              {activeTab === "verification" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Trust & Verification
                    </h2>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                      Check your university verification status and buyer trust tier.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  <div className="radius-native p-5 bg-white dark:bg-[#181B24] border border-[#ECEEF2] dark:border-white/10 rounded-2xl space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <BadgeCheck className="w-5 h-5 text-[#171717] fill-[#FFC928] shrink-0" />
                      <span className="text-[14px] font-extrabold text-[#171717] dark:text-white">
                        Verified Student Seller
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8F0] text-[#15803D] dark:bg-emerald-500/10 dark:text-emerald-400 border border-[#A7F3D0] dark:border-emerald-500/20">
                        Active
                      </span>
                    </div>

                    <p className="text-[13px] text-[#4A5058] dark:text-neutral-300 leading-relaxed">
                      Your identity and university standing have been confirmed. Your profile displays the yellow-black verification tick and your product listings carry the green verified check.
                    </p>

                    <div className="pt-3 text-[12px] font-medium text-[#7A818C] dark:text-neutral-400 border-t border-[#ECEEF2] dark:border-white/10 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Institutional email: <strong className="text-[#171717] dark:text-white font-semibold">tunde.bello@abu.edu.ng</strong> • Student ID confirmed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
