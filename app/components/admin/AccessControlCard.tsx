"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PlatformSetting {
  key: string;
  value: string;
  description: string;
  updatedAt: string | null;
}

const DISPLAY_LABELS: Record<string, string> = {
  admin_signup_enabled: "Admin Signup Open",
  admin_portal_locked: "Emergency Portal Lock",
};

export function AccessControlCard() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.data) setSettings(json.data);
      })
      .catch(() => toast.error("Failed to load platform settings."))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    setUpdating(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to update setting.");
        return;
      }
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value: newValue } : s))
      );
      toast.success(`${DISPLAY_LABELS[key] ?? key} ${newValue === "true" ? "enabled" : "disabled"}.`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
        <ShieldAlert className="w-4 h-4 text-red-500" />
        Admin Access Control
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading settings...
        </div>
      ) : (
        <div className="space-y-3">
          {settings.map((setting) => {
            const isEnabled = setting.value === "true";
            const isUpdating = updating === setting.key;
            const isDanger = setting.key === "admin_portal_locked";

            return (
              <div
                key={setting.key}
                className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-secondary/30"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {isEnabled ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isDanger ? "text-red-500" : "text-emerald-500"}`} />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-xs font-bold text-foreground">
                      {DISPLAY_LABELS[setting.key] ?? setting.key}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                    {setting.description}
                  </p>
                  {setting.updatedAt && (
                    <p className="text-[10px] text-muted-foreground/60 pl-5">
                      Last changed: {new Date(setting.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggle(setting.key, setting.value)}
                  disabled={isUpdating}
                  className={[
                    "shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 cursor-pointer",
                    isEnabled
                      ? isDanger
                        ? "bg-red-500"
                        : "bg-emerald-500"
                      : "bg-muted-foreground/30",
                  ].join(" ")}
                  aria-label={`Toggle ${DISPLAY_LABELS[setting.key] ?? setting.key}`}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 animate-spin text-white absolute left-1" />
                  ) : (
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                        isEnabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10.5px] text-muted-foreground/70 leading-relaxed">
        Changes take effect immediately. All toggles are audit-logged with the acting admin&apos;s ID.
      </p>
    </div>
  );
}
