"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  MoreHorizontal,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";

import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandFooter } from "../components/sections/RebrandFooter";
import { RadarSkeleton } from "../components/common/LoadingSystem";
import { useAuth } from "../context/AuthContext";
import { getDefaultAvatarUrl } from "@/lib/avatarUtils";

interface OfferReplyItem {
  id: string;
  userId?: string;
  authorName: string;
  authorHandle: string;
  authorDept: string;
  authorAvatar?: string;
  authorStoreSlug?: string | null;
  parentReplyId?: string | null;
  replyToName?: string | null;
  authorTime: string;
  isVerified: boolean;
  message: string;
}

interface RadarPost {
  id: string;
  userId?: string;
  requesterName: string;
  requesterHandle: string;
  requesterLocation: string;
  requesterAvatar: string;
  requesterStoreSlug?: string | null;
  timeAgo: string;
  isVerified: boolean;
  requestText: string;
  category: "all" | "urgent" | "course_packs" | "tech_cables" | string;
  replies: OfferReplyItem[];
}

interface SuggestedProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isVerified: boolean;
  accountType: "student" | "store";
  similarProducts: string;
  location: string;
  profileHref: string;
  chatParams: Record<string, string>;
}

const SUGGESTED_FOR_YOU: SuggestedProfile[] = [];

const INITIAL_RADAR_POSTS: RadarPost[] = [];

export default function WantedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] transition-colors">
          <RebrandHeader />
          <RadarSkeleton count={5} />
        </div>
      }
    >
      <RadarContent />
    </Suspense>
  );
}

function RadarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const desktopTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Fallback to cached user in localStorage if AuthContext is still loading
  const effectiveUser = user || (() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("campus_user");
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return null;
  })();

  const currentUserId = String(effectiveUser?.id || (effectiveUser as any)?._id || "");
  const currentHandle = String(effectiveUser?.handle || "").replace(/^@/, "").toLowerCase();
  const currentName = String(effectiveUser?.name || "").trim().toLowerCase();
  const currentEmail = String(effectiveUser?.email || "").trim().toLowerCase();
  const currentEmailPrefix = currentEmail.split("@")[0];

  // Track locally created/owned radar post IDs to guarantee 100% reliable ownership detection
  const [myPostIds, setMyPostIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ch_my_radar_ids");
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return [];
  });

  const [posts, setPosts] = useState<RadarPost[]>(INITIAL_RADAR_POSTS);

  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [userStoreInfo, setUserStoreInfo] = useState<{ id?: string; slug?: string; name?: string } | null>(null);

  // Check user's own store to guarantee self-exclusion from "Suggested for you"
  useEffect(() => {
    let isCancelled = false;
    async function checkMyStore() {
      try {
        const res = await fetch("/api/stores/me", { credentials: "include", cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const ownedStore = data?.data?.store || data?.store;
          if (ownedStore && !isCancelled) {
            setUserStoreInfo({
              id: String(ownedStore._id || ownedStore.id || ""),
              slug: String(ownedStore.slug || "").toLowerCase(),
              name: String(ownedStore.name || "").toLowerCase(),
            });
          }
        }
      } catch {}
    }
    if (effectiveUser) {
      checkMyStore();
    }
    return () => {
      isCancelled = true;
    };
  }, [currentUserId]);

  // Fetch live radar posts from database (purge any legacy cached/hardcoded localStorage entries)
  useEffect(() => {
    let isCancelled = false;
    try {
      localStorage.removeItem("ch_radar_posts");
    } catch {}
    async function fetchRadarPosts() {
      try {
        setIsLoadingPosts(true);
        const res = await fetch("/api/radar", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && !isCancelled) {
          setPosts(json.data);
        }
      } catch (err) {
        console.warn("Could not fetch live radar posts:", err);
      } finally {
        if (!isCancelled) setIsLoadingPosts(false);
      }
    }
    fetchRadarPosts();
    return () => {
      isCancelled = true;
    };
  }, []);

  const savePosts = (newPosts: RadarPost[]) => {
    setPosts(newPosts);
  };

  const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfile[]>([]);

  // Fetch and rank suggested campus contacts based on user profile, location (first), and preferred categories (second)
  // Strictly excludes the logged-in user's own profile and store.
  React.useEffect(() => {
    let isCancelled = false;

    async function loadLiveSuggestions() {
      try {
        setIsLoadingSuggestions(true);
        let localUser: any = null;
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("campus_user");
            if (raw) localUser = JSON.parse(raw);
          } catch {}
        }
        const effectiveUser = user || localUser;
        const currentUserId = String(effectiveUser?.id || (effectiveUser as any)?._id || "");
        const currentHandle = String(effectiveUser?.handle || "").replace(/^@/, "").toLowerCase();
        const currentName = String(effectiveUser?.name || "").toLowerCase();
        const currentEmailPrefix = String(effectiveUser?.email || "").split("@")[0].toLowerCase();

        const excludeParam = currentUserId ? `&excludeOwner=${encodeURIComponent(currentUserId)}` : "";
        const res = await fetch(`/api/stores?status=active&limit=30${excludeParam}`);
        const json = await res.json();
        if (!json.success || !Array.isArray(json.data) || isCancelled) return;

        // 1. Resolve User's Location (Location comes FIRST)
        const userCampus = (
          effectiveUser?.campus ||
          effectiveUser?.preferences?.discovery?.preferredCampus ||
          (effectiveUser as any)?.profile?.campus ||
          (typeof window !== "undefined"
            ? localStorage.getItem("preferred_campus") || localStorage.getItem("campus_name") || ""
            : "")
        ).trim().toLowerCase();

        // 2. Resolve User's Preferred Categories (from sign up, preferences, or local storage)
        const userPreferredCategories: string[] = [
          ...(effectiveUser?.preferences?.discovery?.preferredCategories || []),
          ...(effectiveUser?.preferences?.preferredCategories || []),
          ...((effectiveUser as any)?.category ? [(effectiveUser as any).category] : []),
        ];

        if (typeof window !== "undefined") {
          try {
            const rawStoredCats =
              localStorage.getItem("preferred_categories") ||
              localStorage.getItem("campus_preferred_categories");
            if (rawStoredCats) {
              const parsed = JSON.parse(rawStoredCats);
              if (Array.isArray(parsed)) userPreferredCategories.push(...parsed);
            }
          } catch {}
        }

        const targetCategories = Array.from(
          new Set(userPreferredCategories.map((c) => String(c).trim().toLowerCase()).filter(Boolean))
        );

        // 3. Filter Out Own Store / Profile (Self-exclusion)
        const otherStores = json.data.filter((store: any) => {
          if (!effectiveUser) return true;

          const ownerId = String(store.ownerId || store.userId || "");
          const storeId = String(store._id || store.id || "");
          const storeSlug = String(store.slug || "").toLowerCase();
          const storeName = String(store.name || "").toLowerCase();

          // Exclude if user has a confirmed store matching this ID, slug or name
          if (userStoreInfo?.id && (storeId === userStoreInfo.id || ownerId === userStoreInfo.id)) {
            return false;
          }
          if (userStoreInfo?.slug && storeSlug === userStoreInfo.slug) {
            return false;
          }
          if (userStoreInfo?.name && storeName === userStoreInfo.name) {
            return false;
          }

          // Exclude if user is owner of this store
          if (currentUserId && (ownerId === currentUserId || storeId === currentUserId)) {
            return false;
          }
          // Exclude if store slug matches user's handle or email prefix
          if (currentHandle && (storeSlug === currentHandle || storeSlug.startsWith(`${currentHandle}-`) || currentHandle.startsWith(`${storeSlug}-`))) {
            return false;
          }
          if (currentEmailPrefix && (storeSlug === currentEmailPrefix || storeSlug.startsWith(`${currentEmailPrefix}-`))) {
            return false;
          }
          // Exclude if store name matches user's name exactly
          if (currentName && storeName === currentName) {
            return false;
          }
          return true;
        });

        // 4. Rank Candidates: Location Score FIRST, Category Score SECOND
        const scoredCandidates = otherStores.map((store: any) => {
          let score = 0;
          const storeCampus = String(store.campus || "").trim().toLowerCase();
          const storeOperatingLoc = String(store.operatingLocation || store.campusCity || "").trim().toLowerCase();
          const storeCombinedLoc = `${storeCampus} ${storeOperatingLoc}`;

          // PRIORITY 1: LOCATION (Weight 1000 - 2000 points)
          if (userCampus) {
            if (storeCampus && (storeCampus === userCampus || storeOperatingLoc === userCampus)) {
              score += 2000;
            } else if (storeCombinedLoc.includes(userCampus) || userCampus.includes(storeCampus)) {
              score += 1500;
            } else {
              // Word/token match (e.g. "ABU", "Zaria", "Samaru", "Unilag")
              const tokens = userCampus.split(/[\s,()\-]+/).filter((t: string) => t.length > 2);
              const matchedTokens = tokens.filter((t: string) => storeCombinedLoc.includes(t));
              if (matchedTokens.length > 0) {
                score += 1000 + matchedTokens.length * 100;
              }
            }
          }

          // PRIORITY 2: PREFERRED CATEGORIES (Weight 60 - 300 points)
          const storeCategory = String(store.category || "").trim().toLowerCase();
          const storeTags = Array.isArray(store.categoryTags)
            ? store.categoryTags.map((t: string) => String(t).trim().toLowerCase())
            : [];
          const storeDescription = String(store.description || "").trim().toLowerCase();

          if (targetCategories.length > 0) {
            for (const cat of targetCategories) {
              if (storeCategory === cat) {
                score += 300;
              } else if (storeCategory.includes(cat) || cat.includes(storeCategory)) {
                score += 200;
              }
              if (storeTags.some((t: string) => t === cat || t.includes(cat) || cat.includes(t))) {
                score += 150;
              }
              if (storeDescription.includes(cat)) {
                score += 60;
              }
            }
          }

          // Quality / Verification tie-breakers (up to 50 points)
          if (store.isVerified) score += 30;
          score += Math.min(20, Number(store.metrics?.rating || 4.5) * 4);

          return { store, score };
        });

        scoredCandidates.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
        const topStores = scoredCandidates.slice(0, 5).map((item: { store: any }) => item.store);

        const mapped: SuggestedProfile[] = topStores.map((store: any) => ({
          id: `sug-${store._id || store.id}`,
          name: store.name,
          handle: `@${store.slug || store._id}`,
          avatar: store.logo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          isVerified: Boolean(store.isVerified),
          accountType: store.storeType === "student_store" ? "student" : "store",
          similarProducts: store.categoryTags?.slice(0, 3).join(", ") || store.description?.slice(0, 50) || "Campus seller",
          location: store.operatingLocation || store.campus || "Main Campus",
          profileHref: `/store/${store.slug || store.publicId || store._id}`,
          chatParams: {
            from: "store",
            contextType: "store",
            participantId: store.ownerId || `store-${store._id || store.id}`,
            participantName: store.name,
            participantAvatar: store.logo || "",
            participantSubtitle: `${store.storeType === "student_store" ? "Student Store" : "Approved Business"} · ${store.operatingLocation || store.campus || "Main Campus"}`,
            participantVerified: store.isVerified ? "true" : "false",
          },
        }));

        if (!isCancelled) {
          setSuggestedProfiles(mapped);
        }
      } catch {
        // Retain fallback profiles
      } finally {
        if (!isCancelled) {
          setIsLoadingSuggestions(false);
        }
      }
    }

    loadLiveSuggestions();
    return () => {
      isCancelled = true;
    };
  }, [user?.id, user?.campus, userStoreInfo, JSON.stringify(user?.preferences?.discovery)]);
  const REPLIES_PAGE_SIZE = 3;
  const [expandedPostIds, setExpandedPostIds] = useState<
    Record<string, boolean>
  >(() => {
    const initialId = searchParams.get("id");
    return initialId ? { [initialId]: true } : {};
  });
  const [visibleReplyCountByPost, setVisibleReplyCountByPost] = useState<
    Record<string, number>
  >({});
  const [expandedThreadIds, setExpandedThreadIds] = useState<Record<string, boolean>>({});
  const [visibleSubReplyCountByThread, setVisibleSubReplyCountByThread] = useState<
    Record<string, number>
  >({});
  const [activeReplyTargetByPost, setActiveReplyTargetByPost] = useState<
    Record<string, { replyId: string; rootReplyId: string; authorName: string } | null>
  >({});
  const [nestedReplyTextByPost, setNestedReplyTextByPost] = useState<
    Record<string, string>
  >({});
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  // Compact Request Form State (Hidden by default until "+ Post a request" is clicked)
  const [requestInput, setRequestInput] = useState("");
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);

  // Inline Reply Comment State
  const [replyTextByPost, setReplyTextByPost] = useState<
    Record<string, string>
  >({});
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const toggleExpandReplies = (id: string) => {
    setExpandedPostIds((prev) => ({ ...prev, [id]: !prev[id] }));
    setVisibleReplyCountByPost((counts) => ({
      ...counts,
      [id]: REPLIES_PAGE_SIZE,
    }));
  };

  const showMoreReplies = (id: string, total: number) => {
    setVisibleReplyCountByPost((prev) => ({
      ...prev,
      [id]: Math.min(total, (prev[id] ?? REPLIES_PAGE_SIZE) + REPLIES_PAGE_SIZE),
    }));
  };

  const resetVisibleReplies = (id: string) => {
    setVisibleReplyCountByPost((prev) => ({
      ...prev,
      [id]: REPLIES_PAGE_SIZE,
    }));
  };

  const toggleExpandThread = (rootReplyId: string) => {
    setExpandedThreadIds((prev) => ({ ...prev, [rootReplyId]: !prev[rootReplyId] }));
    setVisibleSubReplyCountByThread((counts) => ({
      ...counts,
      [rootReplyId]: REPLIES_PAGE_SIZE,
    }));
  };

  const showMoreSubReplies = (rootReplyId: string, total: number) => {
    setVisibleSubReplyCountByThread((prev) => ({
      ...prev,
      [rootReplyId]: Math.min(total, (prev[rootReplyId] ?? REPLIES_PAGE_SIZE) + REPLIES_PAGE_SIZE),
    }));
  };

  // Submit new compact Radar request
  const handleRadarPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestInput.trim()) return;

    if (!user) {
      router.push("/register");
      return;
    }

    try {
      setIsSubmittingPost(true);

      const res = await fetch("/api/radar", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestText: requestInput.trim(),
          category: "all",
          location: user.campus || "Main Campus",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        savePosts([json.data, ...posts]);
        const newIds = [json.data.id, ...myPostIds];
        setMyPostIds(newIds);
        try {
          localStorage.setItem("ch_my_radar_ids", JSON.stringify(newIds));
        } catch {}
        setRequestInput("");
        setIsPostFormOpen(false);
        showToast("Request posted!");
        return;
      }
      if (json.error) {
        showToast(json.error);
      }
    } catch {
      showToast("Could not post request. Please check your connection and try again.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setOpenMenuPostId(null);
    const confirmed = window.confirm("Are you sure you want to delete this Radar request?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/radar/${encodeURIComponent(postId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = await res.json();
      if (json.success) {
        const next = posts.filter((p) => p.id !== postId);
        savePosts(next);
        const nextIds = myPostIds.filter((id) => id !== postId);
        setMyPostIds(nextIds);
        try {
          localStorage.setItem("ch_my_radar_ids", JSON.stringify(nextIds));
        } catch {}
        showToast("Radar request deleted");
      } else {
        showToast(json.error || "Failed to delete post");
      }
    } catch {
      showToast("Error deleting post");
    }
  };

  // Submit a real moderation report for a Radar post
  const handleReportPost = async (postId: string) => {
    setOpenMenuPostId(null);
    if (!user) {
      router.push("/register");
      return;
    }
    const details = window.prompt("Why are you reporting this request? (optional)");
    if (details === null) return; // cancelled

    try {
      const trimmed = details.trim().slice(0, 1000);
      const res = await fetch("/api/reports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "radar",
          targetId: postId,
          reason: trimmed ? "other" : "spam",
          details: trimmed,
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        showToast("Reported to Campus Hive team");
      } else {
        showToast(json?.error || json?.message || "Could not submit report");
      }
    } catch {
      showToast("Could not submit report");
    }
  };

  // Submit inline reply (top-level or reply-to-reply)
  const submitRadarReply = async (
    post: RadarPost,
    rawText: string,
    target?: { replyId: string; rootReplyId: string; authorName: string } | null
  ) => {
    const text = rawText.trim();
    if (!text) return;

    if (!user) {
      router.push("/register");
      return;
    }

    try {
      const res = await fetch(`/api/radar/${encodeURIComponent(post.id)}/replies`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          ...(target?.replyId ? { parentReplyId: target.replyId } : {}),
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success || !json?.data) {
        showToast(json?.error || "Could not post reply");
        return;
      }
      const newReply: OfferReplyItem = json.data;

      const updated = posts.map((p) =>
        p.id === post.id ? { ...p, replies: [...p.replies, newReply] } : p
      );
      savePosts(updated);

      if (target) {
        setNestedReplyTextByPost((prev) => ({ ...prev, [post.id]: "" }));
        setActiveReplyTargetByPost((prev) => ({ ...prev, [post.id]: null }));
        setExpandedThreadIds((prev) => ({ ...prev, [target.rootReplyId]: true }));
        setVisibleSubReplyCountByThread((prev) => ({
          ...prev,
          [target.rootReplyId]: Math.max(prev[target.rootReplyId] ?? REPLIES_PAGE_SIZE, 999),
        }));
      } else {
        setReplyTextByPost((prev) => ({ ...prev, [post.id]: "" }));
      }
      setExpandedPostIds((prev) => ({ ...prev, [post.id]: true }));
      showToast("Reply posted!");
    } catch {
      showToast("Could not post reply");
    }
  };

  const handleReplySubmit = async (post: RadarPost, e: React.FormEvent) => {
    e.preventDefault();
    await submitRadarReply(post, replyTextByPost[post.id] || "");
  };

  const handleNestedReplySubmit = async (post: RadarPost, e: React.FormEvent) => {
    e.preventDefault();
    const target = activeReplyTargetByPost[post.id];
    if (!target) return;
    await submitRadarReply(post, nestedReplyTextByPost[post.id] || "", target);
  };

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 radius-native bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-[12.5px] font-semibold border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#FFC928]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      <main className="flex-1 w-full py-6 sm:py-8">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 space-y-6">
          {/* ============================================================= */}
          {/* SECTION HEADER: Identical to Explore and Stores               */}
          {/* ============================================================= */}
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-[18px] sm:text-[20px] font-bold tracking-[-0.02em] text-[#14171A] dark:text-white shrink-0">
                Campus Radar
              </h1>
              <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
                Live student requests and instant campus connections.
              </p>
            </div>

            <div
              className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={() => {
                setIsPostFormOpen((prev) => {
                  const next = !prev;
                  if (next) {
                    setTimeout(() => {
                      desktopTextareaRef.current?.focus();
                    }, 30);
                  }
                  return next;
                });
              }}
              aria-expanded={isPostFormOpen}
              className="radius-native inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#171717] dark:text-white shrink-0 transition-colors cursor-pointer"
            >
              <Plus
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isPostFormOpen ? "rotate-45" : ""
                }`}
              />
              <span>{isPostFormOpen ? "Close" : "Post a request"}</span>
            </button>
          </div>

          {/* Mobile Drop-Down Post Box */}
          {isPostFormOpen && (
            <div className="lg:hidden radius-native rounded-xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 p-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <form onSubmit={handleRadarPostSubmit} className="space-y-2.5">
                <textarea
                  rows={2}
                  required
                  value={requestInput}
                  onChange={(e) => setRequestInput(e.target.value)}
                  placeholder="What do you need? Include your budget and meetup spot in your text..."
                  className="w-full rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#E8E8E8] dark:border-white/10 px-3 py-2 text-[12.5px] focus:outline-none focus:border-[#FFC928] resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="px-4 py-1.5 rounded-xl bg-[#FFC928] text-[#171717] font-extrabold text-[12px] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPost ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================= */}
          {/* DESKTOP TWO-COLUMN LAYOUT                                     */}
          {/* Left: Compact Posts starting right after heading              */}
          {/* Right: Sticky Post Form at Top + "Suggested for you" Below    */}
          {/* ============================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ----------------------------------------------------------- */}
            {/* LEFT COLUMN: ULTRA-COMPACT RADAR POSTS (7/8 Cols)           */}
            {/* ----------------------------------------------------------- */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-2.5">
            {isLoadingPosts ? (
              <div
                role="status"
                aria-busy="true"
                aria-label="Loading Campus Radar requests..."
                className="space-y-2.5"
              >
                {Array.from({ length: 5 }, (_, idx) => (
                  <div
                    key={idx}
                    className="radius-native rounded-xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 px-4 py-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="hive-skeleton w-9 h-9 rounded-full shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="hive-skeleton h-3.5 w-28 rounded" />
                            <div className="hive-skeleton h-2.5 w-12 rounded" />
                          </div>
                          <div className="hive-skeleton h-4 w-4 rounded" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="hive-skeleton h-3.5 w-full rounded" />
                          <div className="hive-skeleton h-3.5 w-3/4 rounded" />
                        </div>
                        <div className="pt-1 flex items-center justify-between">
                          <div className="hive-skeleton h-3 w-16 rounded" />
                          <div className="hive-skeleton h-3 w-10 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 p-10 text-center">
                <Radio className="w-10 h-10 mx-auto text-[#8C929C] mb-3 opacity-60" />
                <h3 className="text-[16px] font-bold text-[#171717] dark:text-white">
                  No radar requests yet
                </h3>
                <p className="text-[13px] text-[#667085] dark:text-neutral-400 max-w-md mx-auto mt-1 mb-5">
                  Looking for a textbook, gadget, or campus service? Broadcast your request and let campus peers find you.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsPostFormOpen(true);
                    setTimeout(() => desktopTextareaRef.current?.focus(), 30);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC928] text-[#171717] font-bold text-[13px] hover:bg-[#E5B524] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Post a Request
                </button>
              </div>
            ) : (
              posts.map((post) => {
              const isExpanded = Boolean(expandedPostIds[post.id]);
              const isMenuOpen = openMenuPostId === post.id;
              const postUserId = String(post.userId || "");
              const postHandle = String(post.requesterHandle || "").replace(/^@/, "").toLowerCase();
              const postName = String(post.requesterName || "").trim().toLowerCase();

              const isOwnPost = Boolean(
                (post.id && myPostIds.includes(post.id)) ||
                (effectiveUser && (
                  (currentUserId && postUserId && currentUserId === postUserId) ||
                  (currentHandle && postHandle && currentHandle === postHandle) ||
                  (currentName && postName && currentName === postName) ||
                  (currentEmailPrefix && postHandle && currentEmailPrefix === postHandle)
                ))
              );
              const targetParticipantId = post.userId || `requester-${post.requesterName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

              const postChatHref = `/messages?${new URLSearchParams({
                from: "radar",
                contextType: "wanted",
                contextId: post.id,
                title: post.requestText.slice(0, 70),
                price: "Radar request",
                status: "Available",
                href: `/wanted?id=${post.id}`,
                participantId: targetParticipantId,
              }).toString()}`;

              const cleanHandle = (post.requesterHandle || "").replace(/^@/, "");
              const resolvedRequesterAvatar =
                post.requesterAvatar ||
                getDefaultAvatarUrl(cleanHandle || post.requesterName || "student");
              const userProfileHref = post.requesterStoreSlug
                ? `/profile/${post.requesterStoreSlug}`
                : null;

              const postAvatarImg = (
                <img
                  src={resolvedRequesterAvatar}
                  alt={post.requesterName}
                  className={`w-9 h-9 rounded-full object-cover border border-[#E8E8E8] dark:border-white/10 bg-[#FFF8E1] dark:bg-white/5 ${
                    post.isVerified
                      ? "ring-2 ring-[#FFC928] ring-offset-1 ring-offset-white dark:ring-offset-[#14161D]"
                      : ""
                  }`}
                />
              );

              return (
                <article
                  key={post.id}
                  className="radius-native rounded-xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 px-4 py-3.5 transition-colors hover:border-[#D0D5DD] dark:hover:border-white/20"
                >
                  <div className="flex items-start gap-3">
                    {/* 1. Avatar */}
                    {userProfileHref ? (
                      <Link href={userProfileHref} className="shrink-0 mt-0.5">
                        {postAvatarImg}
                      </Link>
                    ) : (
                      <div className="shrink-0 mt-0.5">{postAvatarImg}</div>
                    )}

                    {/* Main Compact Body */}
                    <div className="flex-1 min-w-0">
                      {/* Top Row: Name + Timestamp + Three Dots (...) */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {userProfileHref ? (
                            <Link
                              href={userProfileHref}
                              className="text-[13.5px] font-bold text-[#171717] dark:text-white hover:underline truncate"
                            >
                              {post.requesterName}
                            </Link>
                          ) : (
                            <span className="text-[13.5px] font-bold text-[#171717] dark:text-white truncate">
                              {post.requesterName}
                            </span>
                          )}
                          <span className="text-[12px] text-[#8C929C] shrink-0">
                            · {post.timeAgo}
                          </span>
                        </div>

                        {/* Three Dots Menu */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuPostId(isMenuOpen ? null : post.id)
                            }
                            aria-label="Post options"
                            className="p-1 rounded-md text-[#8C929C] hover:text-[#171717] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="radius-native absolute right-0 top-7 z-20 flex flex-col w-max min-w-[140px] overflow-hidden rounded-xl bg-white dark:bg-[#181B24] border border-[#E8E8E8] dark:border-white/10 shadow-lg p-1 text-[12px] whitespace-nowrap">
                              {!isOwnPost && (
                                <Link
                                  href={postChatHref}
                                  className="block w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-white/5 font-semibold text-[#171717] dark:text-white"
                                >
                                  Chat with {post.requesterName.split(" ")[0]}
                                </Link>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuPostId(null);
                                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                                    navigator.clipboard.writeText(`${window.location.origin}/wanted?id=${post.id}`);
                                  }
                                  showToast("Link copied to clipboard");
                                }}
                                className="block w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-white/5 text-[#5B636E] dark:text-neutral-300 font-medium cursor-pointer"
                              >
                                Copy link
                              </button>
                              {isOwnPost ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="block w-full text-left px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 font-semibold cursor-pointer"
                                >
                                  Delete
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void handleReportPost(post.id)}
                                  className="block w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-white/5 text-rose-600 font-medium cursor-pointer"
                                >
                                  Report post
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Unified Request Text (All info in one compact block, no separate header/budget/image) */}
                      <p className="mt-1 text-[13.5px] text-[#171717] dark:text-neutral-200 leading-relaxed">
                        {post.requestText}
                      </p>

                      {/* 3. Compact Replies Trigger & Chat Action */}
                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExpandReplies(post.id)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>
                            {post.replies.length}{" "}
                            {post.replies.length === 1 ? "reply" : "replies"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isOwnPost ? (
                          <span className="text-[11.5px] font-semibold text-[#8C929C] dark:text-neutral-400">
                            Your post
                          </span>
                        ) : (
                          <Link
                            href={postChatHref}
                            className="text-[12px] font-bold text-[#171717] dark:text-[#FFC928] hover:underline"
                          >
                            Chat
                          </Link>
                        )}
                      </div>

                      {/* Expandable Inline Replies + Comment Textbox */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#F1F3F6] dark:border-white/10 space-y-2.5">
                          <form
                            onSubmit={(e) => handleReplySubmit(post, e)}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={replyTextByPost[post.id] || ""}
                              onChange={(e) =>
                                setReplyTextByPost((prev) => ({
                                  ...prev,
                                  [post.id]: e.target.value,
                                }))
                              }
                              placeholder="Write a reply..."
                              className="radius-native flex-1 rounded-lg bg-[#F7F8FA] dark:bg-white/5 border border-[#E8E8E8] dark:border-white/10 px-3 py-1.5 text-[12.5px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none focus:border-[#FFC928]"
                            />
                            <button
                              type="submit"
                              className="radius-native px-3 py-1.5 rounded-lg bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-bold text-[12px] shrink-0 cursor-pointer"
                            >
                              Reply
                            </button>
                          </form>

                          {(() => {
                            const topLevelReplies = [
                              ...post.replies.filter((r) => !r.parentReplyId),
                            ].reverse();
                            const childRepliesByRoot: Record<string, OfferReplyItem[]> = {};
                            for (const r of post.replies) {
                              if (r.parentReplyId) {
                                if (!childRepliesByRoot[r.parentReplyId]) {
                                  childRepliesByRoot[r.parentReplyId] = [];
                                }
                                childRepliesByRoot[r.parentReplyId].push(r);
                              }
                            }

                            const visibleCount = visibleReplyCountByPost[post.id] ?? REPLIES_PAGE_SIZE;
                            const visibleReplies = topLevelReplies.slice(0, visibleCount);
                            const remainingCount = topLevelReplies.length - visibleReplies.length;
                            const nextBatchSize = Math.min(REPLIES_PAGE_SIZE, remainingCount);
                            const activeTarget = activeReplyTargetByPost[post.id] || null;

                            const renderReplyCard = (
                              reply: OfferReplyItem,
                              rootReplyId: string,
                              isChild = false
                            ) => {
                              const isOwnReply = Boolean(
                                user && reply.userId && String(reply.userId) === String(user.id)
                              );
                              const replyChatHref = `/messages?${new URLSearchParams({
                                from: "radar",
                                contextType: "wanted",
                                contextId: post.id,
                                title: post.requestText.slice(0, 70),
                                price: "Radar request",
                                status: "Available",
                                href: `/wanted?id=${post.id}`,
                                participantId:
                                  reply.userId ||
                                  `wanted-reply-${reply.authorName
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, "-")}`,
                              }).toString()}`;

                              const replyAvatarImg = (
                                <img
                                  src={
                                    reply.authorAvatar ||
                                    getDefaultAvatarUrl(
                                      (reply.authorHandle || "").replace(/^@/, "") ||
                                        reply.authorName ||
                                        "student"
                                    )
                                  }
                                  alt={reply.authorName}
                                  className={`${
                                    isChild ? "w-5 h-5" : "w-6 h-6"
                                  } rounded-full object-cover shrink-0 mt-0.5 bg-[#FFF8E1] dark:bg-white/5`}
                                />
                              );

                              return (
                                <div
                                  key={reply.id}
                                  className={`radius-native px-3 py-2.5 rounded-lg bg-[#F7F8FA] dark:bg-white/[0.03] border border-[#ECEEF2] dark:border-white/5 flex items-start justify-between gap-2.5 text-[12.5px] ${
                                    isChild ? "text-[12px]" : ""
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    {reply.authorStoreSlug ? (
                                      <Link
                                        href={`/profile/${reply.authorStoreSlug}`}
                                        className="shrink-0"
                                      >
                                        {replyAvatarImg}
                                      </Link>
                                    ) : (
                                      replyAvatarImg
                                    )}
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {reply.authorStoreSlug ? (
                                          <Link
                                            href={`/profile/${reply.authorStoreSlug}`}
                                            className="font-bold text-[#171717] dark:text-white hover:underline"
                                          >
                                            {reply.authorName}
                                          </Link>
                                        ) : (
                                          <span className="font-bold text-[#171717] dark:text-white">
                                            {reply.authorName}
                                          </span>
                                        )}
                                        {isChild && reply.replyToName && (
                                          <span className="text-[11px] font-medium text-[#68707A] dark:text-neutral-400">
                                            → {reply.replyToName}
                                          </span>
                                        )}
                                        <span className="text-[11px] text-[#8C929C]">
                                          · {reply.authorTime}
                                        </span>
                                      </div>
                                      <p className="mt-0.5 text-[#4A5058] dark:text-neutral-300 leading-snug">
                                        {reply.message}
                                      </p>
                                      <div className="mt-1 flex items-center gap-3">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setActiveReplyTargetByPost((prev) => ({
                                              ...prev,
                                              [post.id]:
                                                prev[post.id]?.replyId === reply.id
                                                  ? null
                                                  : {
                                                      replyId: reply.id,
                                                      rootReplyId,
                                                      authorName: reply.authorName,
                                                    },
                                            }))
                                          }
                                          className="text-[11px] font-semibold text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {isOwnReply ? (
                                    <span className="shrink-0 text-[11px] font-medium text-[#8C929C] dark:text-neutral-400">
                                      Your reply
                                    </span>
                                  ) : (
                                    <Link
                                      href={replyChatHref}
                                      className="shrink-0 text-[11.5px] font-bold text-[#B45309] dark:text-[#FFC928] hover:underline"
                                    >
                                      Chat →
                                    </Link>
                                  )}
                                </div>
                              );
                            };

                            return (
                              <>
                                {visibleReplies.map((reply) => {
                                  const children = childRepliesByRoot[reply.id] || [];
                                  const isThreadExpanded = Boolean(expandedThreadIds[reply.id]);
                                  const visibleSubCount =
                                    visibleSubReplyCountByThread[reply.id] ?? REPLIES_PAGE_SIZE;
                                  const visibleChildren = children.slice(0, visibleSubCount);
                                  const remainingSubCount = children.length - visibleChildren.length;
                                  const nextSubBatch = Math.min(REPLIES_PAGE_SIZE, remainingSubCount);
                                  const isReplyingInThisThread =
                                    activeTarget?.rootReplyId === reply.id;

                                  return (
                                    <div key={reply.id} className="space-y-1.5">
                                      {renderReplyCard(reply, reply.id, false)}

                                      {/* Inline Reply-to-Reply Composer for this thread */}
                                      {isReplyingInThisThread && activeTarget && (
                                        <form
                                          onSubmit={(e) => handleNestedReplySubmit(post, e)}
                                          className="ml-6 pl-2.5 border-l-2 border-[#FFC928]/70 flex items-center gap-1.5 pt-0.5"
                                        >
                                          <input
                                            type="text"
                                            autoFocus
                                            value={nestedReplyTextByPost[post.id] || ""}
                                            onChange={(e) =>
                                              setNestedReplyTextByPost((prev) => ({
                                                ...prev,
                                                [post.id]: e.target.value,
                                              }))
                                            }
                                            placeholder={`Reply to ${activeTarget.authorName}...`}
                                            className="radius-native flex-1 rounded-lg bg-[#F7F8FA] dark:bg-white/5 border border-[#E8E8E8] dark:border-white/10 px-2.5 py-1.5 text-[12px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none focus:border-[#FFC928]"
                                          />
                                          <button
                                            type="submit"
                                            className="radius-native px-2.5 py-1.5 rounded-lg bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-bold text-[11.5px] shrink-0 cursor-pointer"
                                          >
                                            Reply
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setActiveReplyTargetByPost((prev) => ({
                                                ...prev,
                                                [post.id]: null,
                                              }))
                                            }
                                            className="px-2 py-1.5 rounded-lg text-[11.5px] font-medium text-[#8C929C] hover:text-[#171717] dark:hover:text-white cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </form>
                                      )}

                                      {/* Nested Sub-Replies Toggle & Paginated Thread */}
                                      {children.length > 0 && (
                                        <div className="ml-6 pl-2.5 border-l-2 border-[#ECEEF2] dark:border-white/10 space-y-1.5">
                                          <button
                                            type="button"
                                            onClick={() => toggleExpandThread(reply.id)}
                                            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                                          >
                                            {isThreadExpanded ? (
                                              <ChevronUp className="w-3 h-3" />
                                            ) : (
                                              <ChevronDown className="w-3 h-3" />
                                            )}
                                            <span>
                                              {isThreadExpanded
                                                ? "Hide replies"
                                                : `View ${children.length} ${
                                                    children.length === 1 ? "reply" : "replies"
                                                  }`}
                                            </span>
                                          </button>

                                          {isThreadExpanded && (
                                            <div className="space-y-1.5">
                                              {visibleChildren.map((child) =>
                                                renderReplyCard(child, reply.id, true)
                                              )}
                                              {remainingSubCount > 0 && (
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    showMoreSubReplies(reply.id, children.length)
                                                  }
                                                  className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                                                >
                                                  <ChevronDown className="w-3 h-3" />
                                                  <span>
                                                    Show {nextSubBatch} more{" "}
                                                    {nextSubBatch === 1 ? "reply" : "replies"} (
                                                    {remainingSubCount} left)
                                                  </span>
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {(remainingCount > 0 || visibleCount > REPLIES_PAGE_SIZE) && (
                                  <div className="pt-0.5 flex items-center justify-between gap-3">
                                    {remainingCount > 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => showMoreReplies(post.id, topLevelReplies.length)}
                                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                        <span>
                                          Show {nextBatchSize} more{" "}
                                          {nextBatchSize === 1 ? "reply" : "replies"} ({remainingCount} left)
                                        </span>
                                      </button>
                                    ) : (
                                      <span />
                                    )}

                                    {visibleCount > REPLIES_PAGE_SIZE && (
                                      <button
                                        type="button"
                                        onClick={() => resetVisibleReplies(post.id)}
                                        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#8C929C] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                        <span>Show less</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT SIDEBAR COLUMN (5/4 Cols on Desktop)                    */}
          {/* 1. Top: Compact Request Form                                  */}
          {/* 2. Below: "Suggested for you"                                 */}
          {/* ------------------------------------------------------------- */}
          <aside className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-[88px] lg:self-start">
            {/* TOP CARD: COMPACT REQUEST FORM (Drops down when "+ Post a request" is clicked) */}
            {isPostFormOpen && (
              <div className="hidden lg:block radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 p-4 shadow-[0_2px_14px_rgba(15,23,42,0.02)] animate-in fade-in slide-in-from-top-2 duration-150">
                <form onSubmit={handleRadarPostSubmit} className="space-y-2.5">
                  <textarea
                    ref={desktopTextareaRef}
                    rows={3}
                    required
                    value={requestInput}
                    onChange={(e) => setRequestInput(e.target.value)}
                    placeholder="What do you need? Include your budget and campus meetup point directly in the text..."
                    className="radius-native w-full rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#E8E8E8] dark:border-white/10 px-3.5 py-2.5 text-[12.5px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none focus:border-[#FFC928] resize-none leading-relaxed"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="radius-native w-full py-2 px-4 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-extrabold text-[12.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmittingPost ? "Posting..." : "Post"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* BOTTOM CARD: SUGGESTED FOR YOU */}
            <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 p-4 shadow-[0_2px_14px_rgba(15,23,42,0.02)]">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F2F4F7] dark:border-white/10">
                <div>
                  <h2 className="text-[14.5px] font-extrabold text-[#171717] dark:text-white">
                    Suggested for you
                  </h2>
                  <p className="text-[11px] text-[#8C929C] mt-0.5">
                    Profiles &amp; stores with items similar to your activity
                  </p>
                </div>
                <User className="w-4 h-4 text-[#8C929C] shrink-0" />
              </div>

              <div className="divide-y divide-[#F2F4F7] dark:divide-white/5">
                {isLoadingSuggestions ? (
                  <div
                    role="status"
                    aria-busy="true"
                    aria-label="Loading suggested campus contacts..."
                    className="divide-y divide-[#F2F4F7] dark:divide-white/5"
                  >
                    {Array.from({ length: 3 }, (_, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="hive-skeleton w-9 h-9 rounded-full shrink-0" />
                          <div className="space-y-1.5 flex-1">
                            <div className="hive-skeleton h-3.5 w-28 rounded" />
                            <div className="hive-skeleton h-2.5 w-36 rounded" />
                          </div>
                        </div>
                        <div className="hive-skeleton h-6 w-16 rounded-lg shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : suggestedProfiles.length === 0 ? (
                  <div className="py-6 text-center text-[12px] text-[#8C929C]">
                    No campus stores or contacts suggested yet.
                  </div>
                ) : (
                  suggestedProfiles.map((person) => (
                    <div
                      key={person.id}
                      className="py-3 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Link href={person.profileHref || "/explore"} className="shrink-0">
                          <img
                            src={person.avatar}
                            alt={person.name}
                            className={`w-9 h-9 rounded-full object-cover border border-[#E8E8E8] dark:border-white/10 ${
                              person.isVerified
                                ? "ring-2 ring-[#FFC928] ring-offset-1 ring-offset-white dark:ring-offset-[#14161D]"
                                : ""
                            }`}
                          />
                        </Link>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <Link
                              href={person.profileHref || "/explore"}
                              className="text-[13px] font-bold text-[#171717] dark:text-white hover:underline truncate"
                            >
                              {person.name}
                            </Link>
                          </div>
                          <p className="text-[11px] text-[#68707A] dark:text-neutral-400 truncate">
                            {person.similarProducts}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/messages?${new URLSearchParams(
                          person.chatParams
                        ).toString()}`}
                        className="radius-native shrink-0 px-2.5 py-1 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] text-[11px] font-bold text-[#171717] dark:text-white transition-colors"
                      >
                        Message
                      </Link>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2.5 border-t border-[#F2F4F7] dark:border-white/10">
                <Link
                  href="/stores"
                  className="inline-flex items-center justify-between w-full text-[12px] font-bold text-[#171717] dark:text-white hover:text-[#68707A] transition-colors"
                >
                  <span>View more suggestions</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8C929C]" />
                </Link>
              </div>
            </div>
          </aside>
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
