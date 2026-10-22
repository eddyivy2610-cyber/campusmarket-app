"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  SlidersHorizontal,
  Inbox,
  CircleDot,
  MessageSquare,
  ShoppingBag,
  Heart,
  Store,
  Star,
  ShieldCheck,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  BellOff,
  ExternalLink,
} from "lucide-react";

import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandFooter } from "../components/sections/RebrandFooter";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPatch } from "@/lib/apiClient";
import {
  NotificationSkeletons,
  NotificationLoadingDots,
} from "../components/notifications/NotificationLoading";
import { ButtonRing } from "../components/common/LoadingSystem";

const FILTER_CONFIG = [
  { id: "all", label: "All", icon: Inbox },
  { id: "unread", label: "Unread", icon: CircleDot },
] as const;

type FilterId = "all" | "unread";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  category: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

function formatRelativeTime(dateString: string): string {
  try {
    const timestamp = new Date(dateString).getTime();
    if (Number.isNaN(timestamp)) return "Recently";
    const diffMinutes = Math.round((timestamp - Date.now()) / 60000);

    if (Math.abs(diffMinutes) < 1) return "Just now";
    if (Math.abs(diffMinutes) < 60) return `${Math.abs(diffMinutes)}m ago`;

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) return `${Math.abs(diffHours)}h ago`;

    const diffDays = Math.round(diffHours / 24);
    if (Math.abs(diffDays) === 1) return "Yesterday";
    if (Math.abs(diffDays) < 7) return `${Math.abs(diffDays)}d ago`;

    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

function getCategoryMeta(category: string) {
  switch (category) {
    case "orders":
      return {
        label: "Order Milestone",
        icon: ShoppingBag,
        colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    case "messages":
      return {
        label: "Message",
        icon: MessageSquare,
        colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      };
    case "wishlist":
      return {
        label: "Saved Item",
        icon: Heart,
        colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      };
    case "followed_stores":
      return {
        label: "Store Update",
        icon: Store,
        colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    case "reviews":
      return {
        label: "Review",
        icon: Star,
        colorClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      };
    case "account_security":
      return {
        label: "Security Alert",
        icon: ShieldCheck,
        colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      };
    case "announcements":
      return {
        label: "Campus Notice",
        icon: Megaphone,
        colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      };
    default:
      return {
        label: "Activity",
        icon: Bell,
        colorClass: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20",
      };
  }
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async (nextCursor?: string) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (nextCursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const query = new URLSearchParams({ limit: "20" });
      if (activeFilter === "unread") {
        query.set("unread", "true");
      }
      if (nextCursor) {
        query.set("cursor", nextCursor);
      }

      const response: any = await apiGet(`/api/notifications?${query}`);
      const rawList = response.data || [];
      const normalized: NotificationItem[] = rawList.map((item: any) => ({
        _id: String(item._id || item.id),
        title: item.title || "Notification",
        message: item.message || "",
        category: item.category || "activity",
        link: item.link,
        read: Boolean(item.read),
        createdAt: item.createdAt || new Date().toISOString(),
      }));

      setItems((prev) => (nextCursor ? [...prev, ...normalized] : normalized));
      setCursor(response.nextCursor || null);
      if (typeof response.unreadCount === "number") {
        setUnreadCount(response.unreadCount);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [user?.id, activeFilter]);

  const markSingleRead = async (id: string) => {
    try {
      await apiPatch(`/api/notifications/${id}`, {});
      setItems((current) =>
        current.map((item) => (item._id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignored
    }
  };

  const markAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await apiPatch("/api/notifications/read-all", {});
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignored
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased transition-colors"
    >
      <RebrandHeader />

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-7 pb-16">
        {/* Explore/Radar Standard Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[18px] sm:text-[20px] font-bold tracking-[-0.02em] text-[#14171A] dark:text-white shrink-0">
                Notifications
              </h1>
              {user && unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#EF4444]/10 dark:bg-[#EF4444]/20 text-[#EF4444] text-[11px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
              Real-time updates on your orders, buyer messages, followed stores, and campus alerts.
            </p>
          </div>

          <div
            className="hidden lg:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10 mx-2"
            aria-hidden="true"
          />

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {user && unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                disabled={markingAll}
                className="radius-native inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#171717] dark:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {markingAll ? (
                  <ButtonRing size="xs" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span>Mark all as read</span>
              </button>
            )}

            <Link
              href="/settings/preferences"
              className="radius-native inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              title="Notification Preferences"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </Link>
          </div>
        </div>

        {/* Filter Navigation: All & Unread */}
        <div className="flex items-center gap-2 mb-6">
          {FILTER_CONFIG.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`radius-native inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#171717] dark:bg-white text-white dark:text-[#171717] shadow-xs"
                    : "bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:border-[#D5D9E0]"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{filter.label}</span>
                {filter.id === "unread" && unreadCount > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10.5px] font-extrabold ${
                      isActive
                        ? "bg-white text-[#171717] dark:bg-[#171717] dark:text-white"
                        : "bg-[#EF4444] text-white"
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto">
          {/* Case 1: Unauthenticated Guest State */}
          {!user && (
            <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-8 sm:p-12 text-center shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF8E1] dark:bg-[#FFC928]/15 text-[#D99B00] dark:text-[#FFC928] mx-auto flex items-center justify-center">
                <Bell className="w-7 h-7" strokeWidth={1.8} />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="text-[17px] sm:text-[19px] font-bold text-[#171717] dark:text-white">
                  Sign in to view your campus notifications
                </h2>
                <p className="text-[13px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                  Never miss instant buyer messages, counter-offers, order confirmations, or price drops on saved items.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login?next=%2Fnotifications"
                  className="radius-native inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-bold text-[13px] shadow-sm transition-all cursor-pointer"
                >
                  <span>Sign in to Campus Hive</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Case 2: Loading Skeletons */}
          {user && loading && items.length === 0 && (
            <NotificationSkeletons count={4} />
          )}

          {/* Case 3: Empty State */}
          {user && !loading && items.length === 0 && (
            <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-8 sm:p-12 text-center shadow-xs space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-[#F4F5F7] dark:bg-white/5 text-[#8C929C] dark:text-neutral-400 mx-auto flex items-center justify-center">
                {activeFilter === "unread" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" strokeWidth={1.8} />
                ) : (
                  <BellOff className="w-6 h-6" strokeWidth={1.8} />
                )}
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-[16px] sm:text-[18px] font-bold text-[#171717] dark:text-white">
                  {activeFilter === "unread" ? "You're all caught up!" : "No notifications in this view"}
                </h3>
                <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                  {activeFilter === "unread"
                    ? "Zero unread alerts pending. When buyers inquire or orders progress, they'll appear here."
                    : "No activity recorded under this filter yet. You'll receive real-time alerts as campus deals happen."}
                </p>
              </div>

              {activeFilter !== "all" && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className="radius-native inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 text-[12.5px] font-semibold text-[#171717] dark:text-white transition-colors cursor-pointer"
                  >
                    <span>View all notifications</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Case 4: Notifications List */}
          {user && items.length > 0 && (
            <div className="space-y-3">
              {items.map((item) => {
                const meta = getCategoryMeta(item.category);
                const Icon = meta.icon;

                return (
                  <div
                    key={item._id}
                    className={`radius-native rounded-2xl transition-all p-4 sm:p-5 relative ${
                      !item.read
                        ? "bg-[#FDFDFE] dark:bg-[#161822] border-l-[3.5px] border-l-[#F5B800] dark:border-l-[#FFC928] border-y border-r border-[#ECEEF2] dark:border-white/10 shadow-xs"
                        : "bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 hover:border-[#D5D9E0] dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Category Icon Badge */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.colorClass}`}
                      >
                        <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
                      </div>

                      {/* Content Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <h4
                            className={`text-[13.5px] sm:text-[14.5px] leading-snug truncate ${
                              !item.read
                                ? "font-bold text-[#171717] dark:text-white"
                                : "font-semibold text-[#2B3037] dark:text-neutral-200"
                            }`}
                          >
                            {item.title}
                          </h4>
                          <span className="text-[11px] sm:text-[11.5px] text-[#8C929C] dark:text-neutral-400 shrink-0 font-medium">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>

                        <p className="text-[12.5px] sm:text-[13px] text-[#5B636E] dark:text-neutral-300 mt-1 leading-relaxed">
                          {item.message}
                        </p>

                        {/* Card Footer: Category Tag + Context Actions */}
                        <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-[#F2F4F7] dark:border-white/5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F5F7] dark:bg-white/5 text-[11px] font-medium text-[#6B7280] dark:text-neutral-400">
                            {meta.label}
                          </span>

                          <div className="flex items-center gap-2">
                            {!item.read && (
                              <button
                                type="button"
                                onClick={() => void markSingleRead(item._id)}
                                className="radius-native inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-semibold text-[#8C929C] hover:text-[#171717] dark:hover:text-white hover:bg-[#F4F5F7] dark:hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Mark read</span>
                              </button>
                            )}

                            {item.link && (
                              <Link
                                href={item.link}
                                onClick={() => void markSingleRead(item._id)}
                                className="radius-native inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-[11.5px] font-bold hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                <span>View details</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load More Pagination */}
              {cursor && (
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => void loadNotifications(cursor)}
                    disabled={loadingMore}
                    className="radius-native inline-flex items-center gap-2 px-5 py-2 rounded-xl border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-[#14161D] hover:bg-[#F7F8FA] dark:hover:bg-white/5 text-[12.5px] font-semibold text-[#171717] dark:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <ButtonRing size="xs" />
                        <span>Loading older alerts...</span>
                      </>
                    ) : (
                      <span>Load older notifications</span>
                    )}
                  </button>
                </div>
              )}

              {/* Inline refresh feedback */}
              {loading && items.length > 0 && (
                <div className="pt-3 text-center text-[12px] text-[#8C929C] dark:text-neutral-400">
                  <span>Updating in background </span>
                  <NotificationLoadingDots />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
