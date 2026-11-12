"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, Share2, BadgeCheck } from "lucide-react";

export interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    avatar?: string;
    username?: string;
    campus?: string;
    bio?: string;
    isVerified?: boolean;
    isStore?: boolean;
    shareUrl?: string;
  };
}

export function ProfileShareModal({
  isOpen,
  onClose,
  profile,
}: ProfileShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [instagramFeedback, setInstagramFeedback] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const effectiveShareUrl =
    profile.shareUrl ||
    (typeof window !== "undefined" ? window.location.href : "");

  const shareText = profile.isStore
    ? `Check out ${profile.name} on Campus Hive! Explore their verified campus storefront: ${effectiveShareUrl}`
    : `Connect with ${profile.name} on Campus Hive: ${effectiveShareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(effectiveShareUrl);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(effectiveShareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const handleShareX = () => {
    const url = encodeURIComponent(effectiveShareUrl);
    const text = encodeURIComponent(
      profile.isStore
        ? `Check out ${profile.name} on @CampusHiveNG!`
        : `Connect with ${profile.name} on @CampusHiveNG!`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleShareInstagram = async () => {
    // Copy the profile link & info to clipboard
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${profile.name}${profile.username ? ` (${profile.username})` : ""} on Campus Hive!\n${effectiveShareUrl}`
        );
      }
    } catch {}
    setInstagramFeedback(true);
    setTimeout(() => setInstagramFeedback(false), 5000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="radius-native w-full max-w-md rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#ECEEF2] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF4CC] dark:bg-[#FFC928]/15 flex items-center justify-center text-[#171717] dark:text-[#FFC928] shrink-0">
              <Share2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-[#14171A] dark:text-white leading-tight">
                {profile.isStore ? "Share storefront" : "Share profile"}
              </h2>
              <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400">
                Share via social media or copy direct link
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#8C929C] hover:text-[#171717] dark:hover:text-white hover:bg-[#F2F4F7] dark:hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close share modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Identity Snippet (Clean, no canvas image card) */}
          <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 flex items-center gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#E8E8E8] dark:border-white/10 bg-white"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full bg-[#E8ECF2] dark:bg-white/10 flex items-center justify-center text-[#171717] dark:text-white font-bold text-sm"
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-[14px] font-bold text-[#171717] dark:text-white truncate">
                  {profile.name}
                </h3>
                {profile.isVerified && (
                  <BadgeCheck
                    className="w-4 h-4 text-[#2563EB] fill-[#2563EB]/15 shrink-0"
                    aria-label="Verified user"
                  />
                )}
              </div>

              {profile.username ? (
                <p className="text-[11.5px] font-medium text-[#7A818C] dark:text-neutral-400 truncate">
                  {profile.username}
                </p>
              ) : (
                <p className="text-[11.5px] text-[#7A818C] dark:text-neutral-400 truncate">
                  {profile.campus || "Campus Hive Member"}
                </p>
              )}

              {profile.bio && (
                <p className="text-[11px] text-[#5B636E] dark:text-neutral-400 line-clamp-1 mt-0.5">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Copy URL Input Bar */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C929C]">
              Direct Link
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={effectiveShareUrl}
                className="radius-native flex-1 h-10 px-3 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-[#F9FAFB] dark:bg-white/5 text-[12px] text-[#4A5058] dark:text-neutral-300 font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="radius-native h-10 px-4 rounded-xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-bold text-[12.5px] flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 stroke-[3]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Link Icon Array (Identical to listings array) */}
          <div className="pt-2 border-t border-[#ECEEF2] dark:border-white/10 space-y-2.5">
            <span className="block text-[11.5px] font-bold uppercase tracking-wider text-[#8C929C]">
              Share via
            </span>

            <div className="grid grid-cols-5 gap-2 text-center">
              {/* 1. Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                title="Copy Link"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-108 ${
                    isCopied
                      ? "bg-emerald-500 text-white"
                      : "bg-[#F1F3F6] dark:bg-white/10 text-[#171717] dark:text-white group-hover:bg-[#E4E7EC]"
                  }`}
                >
                  {isCopied ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-4.5 h-4.5" />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-[#5B636E] dark:text-neutral-300 truncate max-w-full">
                  {isCopied ? "Copied" : "Copy link"}
                </span>
              </button>

              {/* 2. WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                title="Share to WhatsApp"
              >
                <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center transition-transform group-hover:scale-108 shadow-xs">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 2C6.5 2 2 6.5 2 12.031c0 1.969.562 3.813 1.562 5.375L2 22l4.781-1.531c1.5 1 3.281 1.563 5.25 1.563 5.531 0 10.031-4.5 10.031-10.031S17.562 2 12.031 2zm0 18.375c-1.781 0-3.406-.531-4.781-1.469l-.344-.219-3.219 1.031 1.063-3.125-.25-.375c-.969-1.438-1.5-3.094-1.5-4.813 0-4.625 3.781-8.375 8.406-8.375 4.625 0 8.375 3.75 8.375 8.375 0 4.625-3.75 8.375-8.375 8.375zm4.781-6.188c-.281-.125-1.594-.781-1.844-.875-.25-.094-.438-.125-.625.125-.188.281-.719.875-.875 1.063-.156.156-.344.188-.625.063-.281-.125-1.188-.438-2.281-1.406-.844-.75-1.406-1.688-1.563-1.969-.156-.281-.031-.438.094-.594.125-.125.281-.344.406-.5.125-.156.188-.281.281-.469.094-.188.031-.344-.031-.5-.063-.156-.625-1.5-.844-2.063-.219-.562-.469-.469-.625-.469h-.531c-.188 0-.5.063-.781.375-.281.281-1.063 1.031-1.063 2.531s1.094 2.938 1.25 3.156c.156.188 2.156 3.281 5.219 4.594.719.313 1.281.5 1.719.625.719.219 1.375.188 1.906.125.594-.094 1.594-.656 1.813-1.281.219-.625.219-1.188.156-1.281-.063-.094-.219-.156-.5-.281z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-[#5B636E] dark:text-neutral-300">
                  WhatsApp
                </span>
              </button>

              {/* 3. Facebook */}
              <button
                type="button"
                onClick={handleShareFacebook}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                title="Share to Facebook"
              >
                <div className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center transition-transform group-hover:scale-108 shadow-xs">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-[#5B636E] dark:text-neutral-300">
                  Facebook
                </span>
              </button>

              {/* 4. X (Twitter) */}
              <button
                type="button"
                onClick={handleShareX}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                title="Share to X"
              >
                <div className="w-11 h-11 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-transform group-hover:scale-108 shadow-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-[#5B636E] dark:text-neutral-300">
                  X (Twitter)
                </span>
              </button>

              {/* 5. Instagram */}
              <button
                type="button"
                onClick={handleShareInstagram}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                title="Share to Instagram"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center transition-transform group-hover:scale-108 shadow-xs">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-[#5B636E] dark:text-neutral-300">
                  Instagram
                </span>
              </button>
            </div>

            {/* Instagram Guidance Feedback */}
            {instagramFeedback && (
              <div className="p-3 rounded-xl bg-[#FFF4CC] dark:bg-[#FFC928]/15 border border-[#FFE082] dark:border-[#FFC928]/30 text-[11.5px] text-[#171717] dark:text-white flex items-center justify-between gap-2 animate-in fade-in">
                <span>
                  ✅ Link copied! Open Instagram to paste in your Bio, Story, or Message.
                </span>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-[#B45309] dark:text-[#FFC928] shrink-0"
                >
                  Open Instagram
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
