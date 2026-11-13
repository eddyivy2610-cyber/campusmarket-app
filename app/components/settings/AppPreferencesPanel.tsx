"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Palette,
  Bell,
  Store,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { DEFAULT_USER_PREFERENCES } from "@/constants/preferences";

export function AppPreferencesPanel() {
  const { setTheme } = useTheme();
  const [, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isSeller, setIsSeller] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "appearance" | "notifications" | "seller"
  >("appearance");
  const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(
    "appearance"
  );

  const [appearance, setAppearance] = useState(DEFAULT_USER_PREFERENCES.appearance);
  const [notifications, setNotifications] = useState(
    DEFAULT_USER_PREFERENCES.notifications
  );
  const [seller, setSeller] = useState(DEFAULT_USER_PREFERENCES.seller);

  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      setIsLoading(true);
      try {
        const res: any = await apiGet("/api/users/preferences");
        if (isMounted && res?.success && res.data) {
          const d = res.data;
          if (d.appearance) {
            const localTheme =
              typeof window !== "undefined" ? localStorage.getItem("theme") : null;
            const hasExplicitLocalTheme =
              localTheme === "light" || localTheme === "dark";
            const dbTheme = d.appearance.theme;
            if (dbTheme === "light" || dbTheme === "dark") {
              setAppearance(d.appearance);
              setTheme(dbTheme);
            } else if (hasExplicitLocalTheme) {
              setAppearance({ ...d.appearance, theme: localTheme });
            } else {
              setAppearance(d.appearance);
              if (dbTheme) setTheme(dbTheme);
            }
          }
          if (d.notifications) setNotifications(d.notifications);
          if (d.seller) setSeller(d.seller);
          setIsSeller(Boolean(res.isSeller));
        }
      } catch {
        // Unauthenticated or offline: keep current defaults
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, [setTheme]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const payload = {
      appearance: {
        theme: appearance.theme,
      },
      notifications: {
        push: Boolean(notifications.push),
        email: Boolean(notifications.email),
        messages: Boolean(notifications.messages),
        orderUpdates: Boolean(notifications.orderUpdates),
        followedStores: Boolean(notifications.followedStores),
        promotions: Boolean(notifications.promotions),
      },
      ...(isSeller
        ? {
            seller: {
              vacationMode: Boolean(seller.vacationMode),
              autoReply: (seller.autoReply || "").trim(),
            },
          }
        : {}),
    };

    try {
      const res: any = await apiPatch("/api/users/preferences", payload);
      if (res?.success) {
        if (appearance.theme) {
          setTheme(appearance.theme);
        }
        setSaveStatus({
          type: "success",
          message: "Preferences saved to your account.",
        });
      } else {
        setSaveStatus({
          type: "error",
          message: res?.error || "Failed to update preferences.",
        });
      }
    } catch {
      if (appearance.theme) {
        setTheme(appearance.theme);
      }
      setSaveStatus({
        type: "success",
        message: "Theme saved to your browser session.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveStatus((prev) => (prev?.type === "success" ? null : prev));
      }, 3500);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset preferences to default values?")) {
      startTransition(() => {
        setAppearance(DEFAULT_USER_PREFERENCES.appearance);
        setNotifications(DEFAULT_USER_PREFERENCES.notifications);
        setSeller(DEFAULT_USER_PREFERENCES.seller);
        if (DEFAULT_USER_PREFERENCES.appearance.theme) {
          setTheme(DEFAULT_USER_PREFERENCES.appearance.theme);
        }
      });
    }
  };

  const SECTIONS = [
    { id: "appearance" as const, label: "Theme", icon: Palette },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    ...(isSeller ? [{ id: "seller" as const, label: "Storefront", icon: Store }] : []),
  ];

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
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
              App Preferences
            </h2>
            <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
              Manage theme, notifications, and storefront availability.
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

        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto py-2.5 mt-2 border-b border-[#ECEEF2] dark:border-white/10 scrollbar-none">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
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

      <div className="md:hidden space-y-2.5">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isOpen = mobileOpenSection === sec.id;
          return (
            <div
              key={sec.id}
              className="radius-native rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] overflow-hidden"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setMobileOpenSection((prev) =>
                    prev === sec.id ? null : sec.id
                  )
                }
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? "bg-[#FFC928] text-[#171717]"
                        : "bg-white dark:bg-white/5 text-[#5B636E] dark:text-neutral-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-[13.5px] font-extrabold text-[#171717] dark:text-white">
                    {sec.label}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#5B636E] dark:text-neutral-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#171717] dark:text-white" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-[#ECEEF2] dark:border-white/10 p-4 bg-white dark:bg-[#14161D] animate-in slide-in-from-top-2 fade-in duration-200">
                  {renderSectionBody(sec.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden md:block">
        {renderSectionBody(activeSection)}
      </div>
    </div>
  );

  function renderSectionBody(sectionId: string) {
    return (
      <>
        {sectionId === "appearance" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5 max-w-md">
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
                      void apiPatch("/api/users/preferences", {
                        appearance: { theme: mode },
                      }).catch(() => {});
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
          </div>
        )}

        {sectionId === "notifications" && (
          <div className="space-y-4 animate-in fade-in duration-200">
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
                description="Receive eligible alerts by email."
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
                description="Alerts when campus stores you follow publish new inventory."
                checked={Boolean(notifications.followedStores)}
                onChange={(c) =>
                  setNotifications((p) => ({ ...p, followedStores: c }))
                }
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
          </div>
        )}

        {sectionId === "seller" && isSeller && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white">
                Storefront Availability & Auto-Reply
              </h3>
              <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
                Put your storefront on break and automatically reply to incoming buyer chats.
              </p>
            </div>

            <div className="divide-y divide-[#ECEEF2] dark:divide-white/10 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] overflow-hidden">
              <ToggleRow
                label="Store Vacation Mode"
                description="Displays a 'Store Temporarily Paused' banner on your storefront so buyers know replies may be delayed."
                checked={Boolean(seller.vacationMode)}
                onChange={(c) =>
                  setSeller((p) => ({ ...p, vacationMode: c }))
                }
              />
            </div>

            <div className="p-4 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] space-y-2.5">
              <label className="text-[12.5px] font-bold text-[#171717] dark:text-white">
                Automated Store Greeting / Auto-Reply
              </label>
              <textarea
                rows={3}
                maxLength={300}
                value={seller.autoReply || ""}
                onChange={(e) =>
                  setSeller((p) => ({ ...p, autoReply: e.target.value }))
                }
                placeholder="e.g. Thanks for reaching out! I usually meet up around the library between 2 PM and 5 PM."
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] resize-y"
              />
              <p className="text-[11px] text-[#68707A] dark:text-neutral-400">
                Sent automatically when a buyer messages you (at most once every 12 hours per thread).
              </p>
            </div>
          </div>
        )}
      </>
    );
  }
}

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
