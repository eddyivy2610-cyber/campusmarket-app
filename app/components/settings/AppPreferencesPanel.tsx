"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Palette,
  Compass,
  Bell,
  Shield,
  MessageSquare,
  Accessibility,
  Store,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  Check,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { DEFAULT_USER_PREFERENCES } from "@/constants/preferences";

const CATEGORY_CHOICES = [
  "Textbooks & Academic",
  "Laptops & Tech Gear",
  "Phones & Accessories",
  "Hostel & Room Gear",
  "Fashion & Footwear",
  "Campus Services",
  "Food & Provisions",
  "Stationery & Art",
];

const ACCENT_COLORS = [
  { id: "amber", label: "Hive Amber", hex: "#FFC928", border: "#F59E0B" },
  { id: "emerald", label: "Emerald", hex: "#10B981", border: "#059669" },
  { id: "indigo", label: "Indigo", hex: "#6366F1", border: "#4F46E5" },
  { id: "rose", label: "Rose", hex: "#F43F5E", border: "#E11D48" },
  { id: "sky", label: "Sky Blue", hex: "#0EA5E9", border: "#0284C7" },
  { id: "violet", label: "Violet", hex: "#8B5CF6", border: "#7C3AED" },
] as const;

export function AppPreferencesPanel() {
  const { theme, setTheme } = useTheme();
  const [, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isSeller, setIsSeller] = useState(false);
  const [activeSection, setActiveSection] = useState<
    | "appearance"
    | "discovery"
    | "notifications"
    | "privacy"
    | "messaging"
    | "accessibility"
    | "seller"
  >("appearance");

  // State matching IUserPreferences
  const [appearance, setAppearance] = useState(DEFAULT_USER_PREFERENCES.appearance);
  const [discovery, setDiscovery] = useState(DEFAULT_USER_PREFERENCES.discovery);
  const [notifications, setNotifications] = useState(
    DEFAULT_USER_PREFERENCES.notifications
  );
  const [privacy, setPrivacy] = useState(DEFAULT_USER_PREFERENCES.privacy);
  const [messaging, setMessaging] = useState(DEFAULT_USER_PREFERENCES.messaging);
  const [accessibility, setAccessibility] = useState(
    DEFAULT_USER_PREFERENCES.accessibility
  );
  const [seller, setSeller] = useState(DEFAULT_USER_PREFERENCES.seller);

  // Load preferences from API on mount, with graceful localStorage fallbacks
  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      setIsLoading(true);
      try {
        const res: any = await apiGet("/api/users/preferences");
        if (isMounted && res?.success && res.data) {
          const d = res.data;
          if (d.appearance) setAppearance(d.appearance);
          if (d.discovery) setDiscovery(d.discovery);
          if (d.notifications) setNotifications(d.notifications);
          if (d.privacy) setPrivacy(d.privacy);
          if (d.messaging) setMessaging(d.messaging);
          if (d.accessibility) setAccessibility(d.accessibility);
          if (d.seller) setSeller(d.seller);
          setIsSeller(Boolean(res.isSeller));

          // Apply client-side cosmetic sync
          applyClientCosmetics(d.appearance, d.accessibility, d.privacy);
        }
      } catch {
        // Fall back to localStorage if offline or unauthenticated
        if (typeof window !== "undefined") {
          const storedAccent = localStorage.getItem("ch_pref_accent");
          if (storedAccent) {
            setAppearance((prev) => ({
              ...prev,
              accentColor: storedAccent as any,
            }));
          }
          const storedSalesPrivacy = localStorage.getItem(
            "ch_privacy_show_sales_milestones"
          );
          if (storedSalesPrivacy !== null) {
            setPrivacy((prev) => ({
              ...prev,
              showSalesMilestones: storedSalesPrivacy !== "false",
            }));
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to apply instant cosmetic styling
  const applyClientCosmetics = (
    appr: typeof appearance,
    acc: typeof accessibility,
    priv: typeof privacy
  ) => {
    if (typeof window === "undefined") return;

    if (appr.theme) {
      setTheme(appr.theme);
    }
    if (appr.accentColor) {
      localStorage.setItem("ch_pref_accent", appr.accentColor);
      document.documentElement.setAttribute("data-accent", appr.accentColor);
    }
    if (appr.textSize) {
      localStorage.setItem("ch_pref_text_size", appr.textSize);
      document.documentElement.setAttribute("data-text-size", appr.textSize);
    }
    if (appr.displayDensity) {
      localStorage.setItem("ch_pref_density", appr.displayDensity);
      document.documentElement.setAttribute("data-density", appr.displayDensity);
    }
    if (acc.reduceMotion !== undefined) {
      localStorage.setItem("ch_pref_reduce_motion", String(acc.reduceMotion));
      document.documentElement.setAttribute(
        "data-reduced-motion",
        String(acc.reduceMotion)
      );
    }
    if (priv.showSalesMilestones !== undefined) {
      localStorage.setItem(
        "ch_privacy_show_sales_milestones",
        String(priv.showSalesMilestones)
      );
      window.dispatchEvent(new Event("ch_privacy_update"));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const payload = {
      appearance,
      discovery,
      notifications,
      privacy,
      messaging,
      accessibility,
      ...(isSeller ? { seller } : {}),
    };

    try {
      const res: any = await apiPatch("/api/users/preferences", payload);
      if (res?.success) {
        applyClientCosmetics(appearance, accessibility, privacy);
        setSaveStatus({
          type: "success",
          message: "Preferences updated and saved to your account.",
        });
      } else {
        setSaveStatus({
          type: "error",
          message: res?.error || "Failed to update preferences.",
        });
      }
    } catch (err: any) {
      // If unauthorized (guest), still apply locally
      applyClientCosmetics(appearance, accessibility, privacy);
      setSaveStatus({
        type: "success",
        message: "Preferences saved to your browser session.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveStatus((prev) => (prev?.type === "success" ? null : prev));
      }, 3500);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all settings to default values?")) {
      startTransition(() => {
        setAppearance(DEFAULT_USER_PREFERENCES.appearance);
        setDiscovery(DEFAULT_USER_PREFERENCES.discovery);
        setNotifications(DEFAULT_USER_PREFERENCES.notifications);
        setPrivacy(DEFAULT_USER_PREFERENCES.privacy);
        setMessaging(DEFAULT_USER_PREFERENCES.messaging);
        setAccessibility(DEFAULT_USER_PREFERENCES.accessibility);
        setSeller(DEFAULT_USER_PREFERENCES.seller);
        applyClientCosmetics(
          DEFAULT_USER_PREFERENCES.appearance,
          DEFAULT_USER_PREFERENCES.accessibility,
          DEFAULT_USER_PREFERENCES.privacy
        );
      });
    }
  };

  const toggleCategory = (cat: string) => {
    setDiscovery((prev) => {
      const current = prev.preferredCategories || [];
      const next = current.includes(cat)
        ? current.filter((c) => c !== cat)
        : [...current, cat];
      return { ...prev, preferredCategories: next };
    });
  };

  const SECTIONS = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "discovery", label: "Discovery", icon: Compass },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Trust", icon: Shield },
    { id: "messaging", label: "Messaging", icon: MessageSquare },
    { id: "accessibility", label: "Accessibility", icon: Accessibility },
    ...(isSeller ? [{ id: "seller", label: "Storefront", icon: Store }] : []),
  ] as const;

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-7 h-7 rounded-full border-2 border-[#171717] dark:border-white border-t-transparent animate-spin" />
        <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
          Loading preferences...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
              App Preferences
            </h2>
            <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
              Customize your Campus Hive experience, discovery defaults, alerts, and privacy rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="radius-native inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[12px] font-bold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="radius-native inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[12.5px] font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>

        {saveStatus && (
          <div
            className={`radius-native mt-3 p-3 rounded-xl text-[12.5px] font-semibold flex items-center gap-2 ${
              saveStatus.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-300"
            }`}
          >
            {saveStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{saveStatus.message}</span>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 mt-2 border-b border-[#ECEEF2] dark:border-white/10 scrollbar-none">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id as any)}
                className={`radius-native inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FFC928] text-[#171717] shadow-xs"
                    : "bg-[#F3F4F6] dark:bg-white/5 text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: Appearance */}
      {activeSection === "appearance" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white">
              Display & Color Theme
            </h3>
            <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
              Personalize colors, mode, and layout density for your device.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Theme Mode */}
            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Theme Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["system", "light", "dark"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setAppearance((p) => ({ ...p, theme: mode }));
                      setTheme(mode);
                    }}
                    className={`radius-native py-2 px-3 rounded-lg text-[12px] font-bold capitalize transition-all border cursor-pointer ${
                      appearance.theme === mode
                        ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-transparent shadow-xs"
                        : "bg-white dark:bg-white/5 border-[#DCE0E6] dark:border-white/10 text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Density */}
            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Display Density
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["comfortable", "compact"] as const).map((den) => (
                  <button
                    key={den}
                    type="button"
                    onClick={() =>
                      setAppearance((p) => ({ ...p, displayDensity: den }))
                    }
                    className={`radius-native py-2 px-3 rounded-lg text-[12px] font-bold capitalize transition-all border cursor-pointer ${
                      appearance.displayDensity === den
                        ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-transparent shadow-xs"
                        : "bg-white dark:bg-white/5 border-[#DCE0E6] dark:border-white/10 text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                    }`}
                  >
                    {den}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Accent Color Palette */}
          <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-3">
            <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
              Signature Accent Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {ACCENT_COLORS.map((c) => {
                const isSelected = appearance.accentColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setAppearance((p) => ({ ...p, accentColor: c.id as any }));
                      if (typeof window !== "undefined") {
                        document.documentElement.setAttribute(
                          "data-accent",
                          c.id
                        );
                      }
                    }}
                    className={`radius-native p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#171717] dark:border-white bg-white dark:bg-white/10 shadow-xs"
                        : "border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-xs flex items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                      )}
                    </span>
                    <span className="text-[11.5px] font-bold text-[#171717] dark:text-white truncate">
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Size */}
          <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
            <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
              Text Scaling
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["compact", "normal", "large"] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setAppearance((p) => ({ ...p, textSize: sz }))}
                  className={`radius-native py-2 px-3 rounded-lg text-[12px] font-bold capitalize transition-all border cursor-pointer ${
                    appearance.textSize === sz
                      ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-transparent shadow-xs"
                      : "bg-white dark:bg-white/5 border-[#DCE0E6] dark:border-white/10 text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                  }`}
                >
                  {sz === "compact" && "Compact (90%)"}
                  {sz === "normal" && "Normal (100%)"}
                  {sz === "large" && "Large (110%)"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Discovery Preferences */}
      {activeSection === "discovery" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white">
              Discovery & Marketplace Feeds
            </h3>
            <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
              Configure your default landing tab, preferred campus, and item sorting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Landing Page */}
            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Default Landing Tab
              </label>
              <select
                value={discovery.defaultLanding}
                onChange={(e) =>
                  setDiscovery((p) => ({
                    ...p,
                    defaultLanding: e.target.value as any,
                  }))
                }
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
              >
                <option value="explore">Marketplace Explore (Default)</option>
                <option value="feed">Following Store Feed</option>
                <option value="radar">Campus Radar / Wanted Requests</option>
              </select>
            </div>

            {/* Default Sort */}
            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Default Item Sorting
              </label>
              <select
                value={discovery.defaultSort}
                onChange={(e) =>
                  setDiscovery((p) => ({
                    ...p,
                    defaultSort: e.target.value as any,
                  }))
                }
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
              >
                <option value="recent">Latest Arrivals First</option>
                <option value="popular">Most Popular & In-Demand</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Preferred Campus & Price Budget Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Primary Campus / Location Filter
              </label>
              <input
                type="text"
                value={discovery.preferredCampus || ""}
                onChange={(e) =>
                  setDiscovery((p) => ({
                    ...p,
                    preferredCampus: e.target.value,
                  }))
                }
                placeholder="e.g. Ahmadu Bello University, Samaru"
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928]"
              />
            </div>

            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Preferred Price Filter (NGN)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  value={discovery.priceRange?.min || ""}
                  onChange={(e) =>
                    setDiscovery((p) => ({
                      ...p,
                      priceRange: {
                        ...p.priceRange,
                        min: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="Min ₦"
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928]"
                />
                <input
                  type="number"
                  min={0}
                  value={discovery.priceRange?.max || ""}
                  onChange={(e) =>
                    setDiscovery((p) => ({
                      ...p,
                      priceRange: {
                        ...p.priceRange,
                        max: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="Max ₦"
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928]"
                />
              </div>
            </div>
          </div>

          {/* Preferred Categories Multi-Select */}
          <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-3">
            <div>
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Preferred Campus Categories
              </label>
              <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400">
                Choose the departments and item types you want to prioritize in your feed.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORY_CHOICES.map((cat) => {
                const isSelected = (discovery.preferredCategories || []).includes(
                  cat
                );
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`radius-native px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-[#FFC928] text-[#171717] border-[#F59E0B] shadow-xs"
                        : "bg-white dark:bg-white/5 border-[#DCE0E6] dark:border-white/10 text-[#5B636E] dark:text-neutral-400 hover:border-[#CBD5E1]"
                    }`}
                  >
                    {isSelected ? `✓ ${cat}` : `+ ${cat}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Notifications */}
      {activeSection === "notifications" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white">
              Notification & Alert Toggles
            </h3>
            <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
              Choose which in-app updates, deal alerts, and seller notifications you receive.
            </p>
          </div>

          <div className="divide-y divide-[#ECEEF2] dark:divide-white/10 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] overflow-hidden">
            <ToggleRow
              label="In-app notification center"
              description="Keep essential and activity alerts in the Campus Hive notification center."
              checked={true}
              disabled
              onChange={() => undefined}
            />
            <ToggleRow
              label="Push notifications"
              description="Receive browser or device alerts for eligible notifications."
              checked={Boolean(notifications.push)}
              onChange={(c) => setNotifications((p) => ({ ...p, push: c }))}
            />
            <ToggleRow
              label="Email notifications"
              description="Receive eligible alerts by email; marketing remains separately opt-in."
              checked={Boolean(notifications.email)}
              onChange={(c) => setNotifications((p) => ({ ...p, email: c }))}
            />
            <ToggleRow
              label="Direct Chat & Inquiries"
              description="Alerts when students send you messages or deal proposals."
              checked={Boolean(notifications.messages)}
              onChange={(c) =>
                setNotifications((p) => ({ ...p, messages: c }))
              }
            />
            <ToggleRow
              label="Order Status Updates"
              description="Confirmations, milestone handoffs, and completion notices."
              checked={Boolean(notifications.orderUpdates)}
              onChange={(c) =>
                setNotifications((p) => ({ ...p, orderUpdates: c }))
              }
            />
            <ToggleRow
              label="Followed Stores & Sellers"
              description="Instant alerts when campus stores you follow publish new inventory."
              checked={Boolean(notifications.followedStores)}
              onChange={(c) =>
                setNotifications((p) => ({ ...p, followedStores: c }))
              }
            />
            <ToggleRow
              label="Wishlist & Price Drop Alerts"
              description="Notifications when bookmarked items drop in price or get relisted."
              checked={Boolean(notifications.wishlistAlerts)}
              onChange={(c) =>
                setNotifications((p) => ({ ...p, wishlistAlerts: c }))
              }
            />
            <ToggleRow
              label="Reviews & trust activity"
              description="New reviews, replies, and relevant trust updates."
              checked={Boolean(notifications.reviews)}
              onChange={(c) => setNotifications((p) => ({ ...p, reviews: c }))}
            />
            <ToggleRow
              label="Account & security alerts"
              description="Approval decisions, restrictions, and security alerts cannot be disabled."
              checked={true}
              disabled
              onChange={() => undefined}
            />
            <ToggleRow
              label="Campus Community & Promotions"
              description="Campus Radar updates, student vendor showcases, and platform features."
              checked={Boolean(notifications.promotions)}
              onChange={(c) =>
                setNotifications((p) => ({ ...p, promotions: c }))
              }
            />
          </div>
          <div className="p-4 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D]">
            <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">Delivery frequency</label>
            <select value={notifications.frequency} onChange={(e) => setNotifications((p) => ({ ...p, frequency: e.target.value as any }))} className="mt-2 w-full max-w-sm rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white">
              <option value="instant">Instant alerts</option><option value="daily">Daily digest for eligible alerts</option><option value="weekly">Weekly digest for eligible alerts</option>
            </select>
            <ToggleRow label="Quiet hours" description="Pause eligible push and email delivery during your quiet hours." checked={Boolean(notifications.quietHoursEnabled)} onChange={(c) => setNotifications((p) => ({ ...p, quietHoursEnabled: c }))} />
          </div>
        </div>
      )}

      {/* SECTION 4: Privacy & Security */}
      {activeSection === "privacy" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white">
              Privacy, Trust & Visibility
            </h3>
            <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
              Control your campus visibility, online status, and public exchange badges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profile Visibility */}
            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Profile Visibility
              </label>
              <select
                value={privacy.profileVisibility}
                onChange={(e) =>
                  setPrivacy((p) => ({
                    ...p,
                    profileVisibility: e.target.value as any,
                  }))
                }
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
              >
                <option value="public">Public (Visible across all universities)</option>
                <option value="campus_only">Campus Only (Students from my university)</option>
              </select>
            </div>

            {/* Who Can Message You */}
            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Who Can Message You
              </label>
              <select
                value={privacy.messagePermission}
                onChange={(e) =>
                  setPrivacy((p) => ({
                    ...p,
                    messagePermission: e.target.value as any,
                  }))
                }
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
              >
                <option value="everyone">Everyone on campus</option>
                <option value="verified">Verified students only</option>
                <option value="listings">Inquiries on active listings only</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-[#ECEEF2] dark:divide-white/10 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] overflow-hidden">
            <ToggleRow
              label="Active Online Presence"
              description="Displays a green presence indicator when you are active in chat threads."
              checked={Boolean(privacy.showOnlineStatus)}
              onChange={(c) =>
                setPrivacy((p) => ({ ...p, showOnlineStatus: c }))
              }
            />
            <ToggleRow
              label="Sales Milestone Visibility"
              description="Displays confirmed sales milestones (25+, 50+, 100+) on your profile and trust card."
              checked={Boolean(privacy.showSalesMilestones)}
              onChange={(c) => {
                setPrivacy((p) => ({ ...p, showSalesMilestones: c }));
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "ch_privacy_show_sales_milestones",
                    String(c)
                  );
                  window.dispatchEvent(new Event("ch_privacy_update"));
                }
              }}
            />
          </div>
        </div>
      )}

      {/* SECTION 5: Messaging */}
      {activeSection === "messaging" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white">
              Messaging & Communication
            </h3>
            <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
              Manage how conversations and deal negotiations behave.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
            <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
              Preferred Contact Channel
            </label>
            <select
              value={messaging.contactChannel}
              onChange={(e) =>
                setMessaging((p) => ({
                  ...p,
                  contactChannel: e.target.value as any,
                }))
              }
              className="radius-native w-full max-w-md rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
            >
              <option value="in_app">In-App Chat Only (Recommended & Escrow-Safe)</option>
              <option value="whatsapp">Allow WhatsApp handoff after inquiry starts</option>
            </select>
          </div>

          <div className="divide-y divide-[#ECEEF2] dark:divide-white/10 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] overflow-hidden">
            <ToggleRow
              label="Message Previews"
              description="Show incoming message snippets in toast banners and push headers."
              checked={Boolean(messaging.messagePreviews)}
              onChange={(c) =>
                setMessaging((p) => ({ ...p, messagePreviews: c }))
              }
            />
            <ToggleRow
              label="Read Receipts"
              description="Let buyers and sellers see when their message was read."
              checked={Boolean(messaging.readReceipts)}
              onChange={(c) =>
                setMessaging((p) => ({ ...p, readReceipts: c }))
              }
            />
          </div>
        </div>
      )}

      {/* SECTION 6: Accessibility & Data Saver */}
      {activeSection === "accessibility" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white">
              Accessibility & Mobile Data
            </h3>
            <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
              Settings designed for low-bandwidth campus networks and reduced animation comfort.
            </p>
          </div>

          <div className="divide-y divide-[#ECEEF2] dark:divide-white/10 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] overflow-hidden">
            <ToggleRow
              label="Reduced Motion"
              description="Minimizes smooth page transitions, carousel animations, and spin effects."
              checked={Boolean(accessibility.reduceMotion)}
              onChange={(c) => {
                setAccessibility((p) => ({ ...p, reduceMotion: c }));
                if (typeof window !== "undefined") {
                  document.documentElement.setAttribute(
                    "data-reduced-motion",
                    String(c)
                  );
                }
              }}
            />
            <ToggleRow
              label="High Contrast Mode"
              description="Strengthens border contrast and typography clarity across dark/light surfaces."
              checked={Boolean(accessibility.highContrast)}
              onChange={(c) =>
                setAccessibility((p) => ({ ...p, highContrast: c }))
              }
            />
            <ToggleRow
              label="Data Saver (Campus Bandwidth)"
              description="Compresses listing thumbnails and defers heavy media until tapped."
              checked={Boolean(accessibility.dataSaver)}
              onChange={(c) => {
                setAccessibility((p) => ({ ...p, dataSaver: c }));
                if (typeof window !== "undefined") {
                  localStorage.setItem("ch_pref_data_saver", String(c));
                }
              }}
            />
          </div>
        </div>
      )}

      {/* SECTION 7: Storefront Settings (Eligible Sellers Only) */}
      {activeSection === "seller" && isSeller && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white">
              Storefront & Vendor Preferences
            </h3>
            <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
              Manage automatic buyer greetings and vacation status for your store.
            </p>
          </div>

          <div className="divide-y divide-[#ECEEF2] dark:divide-white/10 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] overflow-hidden">
            <ToggleRow
              label="Store Vacation Mode"
              description="Temporarily marks items as 'On Break' so buyers know you cannot meet right now."
              checked={Boolean(seller.vacationMode)}
              onChange={(c) =>
                setSeller((p) => ({ ...p, vacationMode: c }))
              }
            />
            <ToggleRow
              label="Instant Deal Inquiry Alerts"
              description="Prioritize deal requests and offer notifications from campus buyers."
              checked={Boolean(seller.inquiryAlerts)}
              onChange={(c) =>
                setSeller((p) => ({ ...p, inquiryAlerts: c }))
              }
            />
          </div>

          <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
            <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
              Automated Store Greeting / Auto-Reply
            </label>
            <textarea
              rows={3}
              value={seller.autoReply || ""}
              onChange={(e) =>
                setSeller((p) => ({ ...p, autoReply: e.target.value }))
              }
              placeholder="e.g. Thanks for checking out my store! I usually meet up around the library between 2 PM and 5 PM."
              className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable toggle row for preference settings.
 */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="p-4 sm:p-4.5 flex items-center justify-between gap-4">
      <div className="space-y-0.5 pr-2">
        <h4 className="text-[13px] font-bold text-[#171717] dark:text-white">
          {label}
        </h4>
        <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400 leading-snug">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          (checked ? "bg-[#FFC928]" : "bg-[#D1D5DB] dark:bg-white/20") +
          (disabled ? " opacity-60 cursor-not-allowed" : "")
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-[#181B24] shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
