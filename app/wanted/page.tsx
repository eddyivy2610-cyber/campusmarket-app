"use client";

import React, { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  MessageCircle,
  BadgeCheck,
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

interface OfferReplyItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorDept: string;
  authorTime: string;
  isVerified: boolean;
  message: string;
}

interface RadarPost {
  id: string;
  requesterName: string;
  requesterHandle: string;
  requesterLocation: string;
  requesterAvatar: string;
  timeAgo: string;
  isVerified: boolean;
  requestText: string;
  category: "all" | "urgent" | "course_packs" | "tech_cables";
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
  const desktopTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [posts, setPosts] = useState<RadarPost[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ch_radar_posts");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((p: any) => !String(p.id).startsWith("req-"));
          }
        }
      } catch {}
    }
    return INITIAL_RADAR_POSTS;
  });

  const savePosts = (newPosts: RadarPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem("ch_radar_posts", JSON.stringify(newPosts));
    } catch {}
  };

  const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfile[]>([]);

  // Fetch live active stores/profiles for suggested campus contacts
  React.useEffect(() => {
    let isCancelled = false;
    async function loadLiveSuggestions() {
      try {
        const res = await fetch("/api/stores?status=active&limit=6");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0 && !isCancelled) {
          const mapped: SuggestedProfile[] = json.data.map((store: any) => ({
            id: `sug-${store._id || store.id}`,
            name: store.name,
            handle: `@${store.slug || store._id}`,
            avatar: store.logo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
            isVerified: Boolean(store.isVerified),
            accountType: store.storeType === "student_store" ? "student" : "store",
            similarProducts: store.categoryTags?.slice(0, 3).join(", ") || store.description?.slice(0, 50) || "Campus seller",
            location: store.operatingLocation || store.campus || "Main Campus",
            profileHref: `/stores/${store.slug || store._id}`,
            chatParams: {
              contextType: "store",
              contextId: store.slug || store._id,
              title: store.name,
              price: `${store.metrics?.listingsCount || 0} active listings`,
              status: "Available",
              href: `/stores/${store.slug || store._id}`,
              participantId: `store-${store._id || store.id}`,
              participantName: store.name,
              participantSubtitle: `${store.storeType === "student_store" ? "Student Store" : "Approved Business"} · ${store.operatingLocation || "Campus"}`,
              participantVerified: store.isVerified ? "true" : "false",
            },
          }));
          setSuggestedProfiles(mapped);
        }
      } catch {
        // Retain fallback profiles
      }
    }
    loadLiveSuggestions();
    return () => {
      isCancelled = true;
    };
  }, []);
  const [expandedPostIds, setExpandedPostIds] = useState<
    Record<string, boolean>
  >(() => {
    const initialId = searchParams.get("id");
    return initialId ? { [initialId]: true } : {};
  });
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
  };

  // Submit new compact Radar request
  const handleRadarPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestInput.trim()) return;

    const newPost: RadarPost = {
      id: `post-${Date.now()}`,
      requesterName: "Tunde Bello",
      requesterHandle: "legacy-seller",
      requesterLocation: "Suleiman Hall",
      requesterAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
      timeAgo: "Just now",
      isVerified: true,
      requestText: requestInput.trim(),
      category: "all",
      replies: [],
    };

    savePosts([newPost, ...posts]);
    setRequestInput("");
    setIsPostFormOpen(false);
    showToast("Request posted!");
  };

  // Submit inline reply
  const handleReplySubmit = (post: RadarPost, e: React.FormEvent) => {
    e.preventDefault();
    const text = (replyTextByPost[post.id] || "").trim();
    if (!text) return;

    const newReply: OfferReplyItem = {
      id: `rep-${Date.now()}`,
      authorName: "Tunde Bello",
      authorHandle: "legacy-seller",
      authorDept: "Suleiman Hall",
      authorTime: "Just now",
      isVerified: true,
      message: text,
    };

    const updated = posts.map((p) =>
      p.id === post.id ? { ...p, replies: [...p.replies, newReply] } : p
    );
    savePosts(updated);
    setReplyTextByPost((prev) => ({ ...prev, [post.id]: "" }));
    setExpandedPostIds((prev) => ({ ...prev, [post.id]: true }));
    showToast("Reply posted!");
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
                    className="px-4 py-1.5 rounded-xl bg-[#FFC928] text-[#171717] font-extrabold text-[12px] cursor-pointer"
                  >
                    Post
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
            {posts.length === 0 ? (
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
                  onClick={() => desktopTextareaRef.current?.focus()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC928] text-[#171717] font-bold text-[13px] hover:bg-[#E5B524] transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Post a Request
                </button>
              </div>
            ) : (
              posts.map((post) => {
              const isExpanded = Boolean(expandedPostIds[post.id]);
              const isMenuOpen = openMenuPostId === post.id;
              const postChatHref = `/messages?${new URLSearchParams({
                contextType: "wanted",
                contextId: post.id,
                title: post.requestText.slice(0, 70),
                price: "Radar request",
                status: "Available",
                href: `/wanted?id=${post.id}`,
                participantId: `requester-${post.requesterName
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "-")}`,
                participantName: post.requesterName,
                participantSubtitle: `${post.isVerified ? "Student" : "Campus Seller"} · ${post.requesterLocation}`,
                participantAvatar: post.requesterAvatar,
                participantVerified: post.isVerified ? "true" : "false",
              }).toString()}`;

              return (
                <article
                  key={post.id}
                  className="radius-native rounded-xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 px-4 py-3.5 transition-colors hover:border-[#D0D5DD] dark:hover:border-white/20"
                >
                  <div className="flex items-start gap-3">
                    {/* 1. Avatar */}
                    <Link href={`/profile/${post.requesterHandle}`} className="shrink-0 mt-0.5">
                      <img
                        src={post.requesterAvatar}
                        alt={post.requesterName}
                        className="w-9 h-9 rounded-full object-cover border border-[#E8E8E8] dark:border-white/10"
                      />
                    </Link>

                    {/* Main Compact Body */}
                    <div className="flex-1 min-w-0">
                      {/* Top Row: Name + Timestamp + Three Dots (...) */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Link
                            href={`/profile/${post.requesterHandle}`}
                            className="text-[13.5px] font-bold text-[#171717] dark:text-white hover:underline truncate"
                          >
                            {post.requesterName}
                          </Link>
                          {post.isVerified && (
                            <BadgeCheck
                              className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0"
                              aria-label="Verified student seller"
                            />
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
                            <div className="radius-native absolute right-0 top-7 z-20 w-44 rounded-xl bg-white dark:bg-[#181B24] border border-[#E8E8E8] dark:border-white/10 shadow-lg py-1 text-[12px]">
                              <Link
                                href={postChatHref}
                                className="block px-3.5 py-1.5 hover:bg-[#F7F8FA] dark:hover:bg-white/5 font-semibold text-[#171717] dark:text-white"
                              >
                                Chat with {post.requesterName.split(" ")[0]}
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuPostId(null);
                                  showToast("Link copied to clipboard");
                                }}
                                className="w-full text-left px-3.5 py-1.5 hover:bg-[#F7F8FA] dark:hover:bg-white/5 text-[#5B636E] dark:text-neutral-300"
                              >
                                Copy link
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuPostId(null);
                                  showToast("Reported to Campus Hive team");
                                }}
                                className="w-full text-left px-3.5 py-1.5 hover:bg-[#F7F8FA] dark:hover:bg-white/5 text-rose-600"
                              >
                                Report post
                              </button>
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

                        <Link
                          href={postChatHref}
                          className="text-[12px] font-bold text-[#171717] dark:text-[#FFC928] hover:underline"
                        >
                          Chat
                        </Link>
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

                          {post.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="radius-native px-3 py-2.5 rounded-lg bg-[#F7F8FA] dark:bg-white/[0.03] border border-[#ECEEF2] dark:border-white/5 flex items-start justify-between gap-2.5 text-[12.5px]"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <Link
                                    href={`/profile/${reply.authorHandle}`}
                                    className="font-bold text-[#171717] dark:text-white hover:underline"
                                  >
                                    {reply.authorName}
                                  </Link>
                                  {reply.isVerified && (
                                    <BadgeCheck
                                      className="w-3.5 h-3.5 text-[#171717] fill-[#FFC928] shrink-0"
                                      aria-label="Verified student seller"
                                    />
                                  )}
                                  <span className="text-[11px] text-[#8C929C]">
                                    · {reply.authorTime}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-[#4A5058] dark:text-neutral-300 leading-snug">
                                  {reply.message}
                                </p>
                              </div>

                              <Link
                                href={`/messages?${new URLSearchParams({
                                  contextType: "wanted",
                                  contextId: post.id,
                                  title: post.requestText.slice(0, 70),
                                  price: "Radar request",
                                  status: "Available",
                                  href: `/wanted?id=${post.id}`,
                                  participantId: `wanted-reply-${reply.authorName
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, "-")}`,
                                  participantName: reply.authorName,
                                  participantSubtitle: `${reply.isVerified ? "Student" : "Campus Seller"} · ${reply.authorDept}`,
                                  participantVerified: reply.isVerified ? "true" : "false",
                                }).toString()}`}
                                className="shrink-0 text-[11.5px] font-bold text-[#B45309] dark:text-[#FFC928] hover:underline"
                              >
                                Chat →
                              </Link>
                            </div>
                          ))}
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
                    className="radius-native w-full py-2 px-4 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-extrabold text-[12.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Post</span>
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
                {suggestedProfiles.length === 0 ? (
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
                        <Link href={person.profileHref} className="shrink-0">
                          <img
                            src={person.avatar}
                            alt={person.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#E8E8E8] dark:border-white/10"
                          />
                        </Link>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <Link
                              href={person.profileHref}
                              className="text-[13px] font-bold text-[#171717] dark:text-white hover:underline truncate"
                            >
                              {person.name}
                            </Link>
                            {person.isVerified && person.accountType === "student" && (
                              <BadgeCheck
                                className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0"
                                aria-label="Verified student seller"
                              />
                            )}
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
