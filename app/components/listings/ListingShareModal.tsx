"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Store,
  Image as ImageIcon,
  Link2,
} from "lucide-react";

interface ListingShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    priceFormatted: string;
    price: number;
    category?: string;
    conditionLabel?: string;
    location?: string;
    images: string[];
    seller: {
      name: string;
      handle?: string;
      avatar?: string;
      department?: string;
      isVerified?: boolean;
    };
  };
}

export function ListingShareModal({
  isOpen,
  onClose,
  listing,
}: ListingShareModalProps) {
  const [shareMode, setShareMode] = useState<"card" | "link">("card");
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [cardPngUrl, setCardPngUrl] = useState<string | null>(null);
  const [instagramFeedback, setInstagramFeedback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getShareUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/listings/${listing.id}`;
    }
    return `https://campushive.ng/listings/${listing.id}`;
  }, [listing.id]);

  const shareText = `Check out "${listing.title}" for ${listing.priceFormatted} on Campus Hive! Listed by ${listing.seller.name}.`;

  // Draw High-Resolution PNG on an off-screen/hidden HTML5 Canvas
  const generatePngCard = useCallback(async (): Promise<string | null> => {
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // High quality canvas dimensions (1080 x 1200 - Ideal for Instagram, WhatsApp & Twitter)
    const W = 1080;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;

    // 1. Background gradient (Rich premium dark slate)
    const bgGradient = ctx.createLinearGradient(0, 0, W, H);
    bgGradient.addColorStop(0, "#0F1218");
    bgGradient.addColorStop(0.5, "#141720");
    bgGradient.addColorStop(1, "#0A0C10");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Subtle golden ambient top-right glow
    const glowGradient = ctx.createRadialGradient(W - 100, 100, 10, W - 100, 100, 500);
    glowGradient.addColorStop(0, "rgba(255, 201, 40, 0.18)");
    glowGradient.addColorStop(1, "rgba(255, 201, 40, 0)");
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, W, H);

    // Subtle bottom-left glow
    const bottomGlow = ctx.createRadialGradient(100, H - 100, 10, 100, H - 100, 450);
    bottomGlow.addColorStop(0, "rgba(255, 201, 40, 0.08)");
    bottomGlow.addColorStop(1, "rgba(255, 201, 40, 0)");
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, W, H);

    // Outer subtle border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // 2. Brand Header: Campus Hive
    // Yellow Hive Logo Icon
    const brandX = 60;
    const brandY = 80;
    ctx.fillStyle = "#FFC928";
    ctx.beginPath();
    ctx.arc(brandX + 22, brandY + 22, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#171717";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("H", brandX + 22, brandY + 23);

    // Brand Name Text
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("Campus Hive", brandX + 58, brandY + 24);

    ctx.fillStyle = "#FFC928";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("CAMPUS MARKETPLACE", brandX + 58, brandY + 46);

    // 3. Main Product Image (Hero)
    const imgX = 60;
    const imgY = 160;
    const imgW = W - 120;
    const imgH = 560;
    const imgRadius = 28;

    // Draw Image Placeholder first
    ctx.fillStyle = "#1A1E26";
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgW, imgH, imgRadius);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const productImgUrl = listing.images && listing.images[0];
    if (productImgUrl) {
      try {
        const loadedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Image failed to load"));
          img.src = productImgUrl;
        });

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, imgRadius);
        ctx.clip();

        // Object-cover calculation
        const aspectTarget = imgW / imgH;
        const aspectImg = loadedImg.width / loadedImg.height;
        let sWidth = loadedImg.width;
        let sHeight = loadedImg.height;
        let sx = 0;
        let sy = 0;

        if (aspectImg > aspectTarget) {
          sWidth = loadedImg.height * aspectTarget;
          sx = (loadedImg.width - sWidth) / 2;
        } else {
          sHeight = loadedImg.width / aspectTarget;
          sy = (loadedImg.height - sHeight) / 2;
        }

        ctx.drawImage(loadedImg, sx, sy, sWidth, sHeight, imgX, imgY, imgW, imgH);
        ctx.restore();
      } catch {
        // Fallback placeholder text if CORS blocks external image load
        ctx.fillStyle = "#8C929C";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(listing.category || "Campus Hive Listing", imgX + imgW / 2, imgY + imgH / 2);
      }
    }

    // Overlay Tag on top of image (Category / Condition)
    if (listing.conditionLabel || listing.category) {
      const tagText = listing.conditionLabel || listing.category || "Featured";
      ctx.font = "bold 18px sans-serif";
      const tagTextW = ctx.measureText(tagText).width;
      const tagW = tagTextW + 36;
      const tagH = 38;
      const tagX = imgX + 24;
      const tagY = imgY + 24;

      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tagH, 19);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText(tagText, tagX + tagW / 2, tagY + 25);
    }

    // 4. Content Area below Image
    const contentY = imgY + imgH + 46;

    // Price Badge (Pill in Campus Hive Signature Gold)
    const priceText = listing.priceFormatted;
    ctx.font = "bold 44px sans-serif";
    const priceTextW = ctx.measureText(priceText).width;
    const pricePillW = priceTextW + 48;
    const pricePillH = 68;
    const pricePillX = 60;
    const pricePillY = contentY;

    ctx.fillStyle = "#FFC928";
    ctx.beginPath();
    ctx.roundRect(pricePillX, pricePillY, pricePillW, pricePillH, 20);
    ctx.fill();

    ctx.fillStyle = "#171717";
    ctx.textAlign = "left";
    ctx.fillText(priceText, pricePillX + 24, pricePillY + 49);

    // Product Title (Large bold white)
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 46px sans-serif";
    const titleY = pricePillY + pricePillH + 62;

    // Truncate title if too long to fit in 1 line
    let displayTitle = listing.title;
    if (ctx.measureText(displayTitle).width > W - 120) {
      while (displayTitle.length > 3 && ctx.measureText(displayTitle + "...").width > W - 120) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle += "...";
    }
    ctx.fillText(displayTitle, 60, titleY);

    // 5. Seller & Store Info Card (Bottom bar)
    const storeCardY = titleY + 42;
    const storeCardH = 120;
    const storeCardW = W - 120;

    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.beginPath();
    ctx.roundRect(60, storeCardY, storeCardW, storeCardH, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Store Avatar circle
    const avatarX = 86;
    const avatarY = storeCardY + storeCardH / 2;
    const avatarR = 36;
    ctx.fillStyle = "#FFC928";
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#171717";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const initial = (listing.seller.name || "S").charAt(0).toUpperCase();
    ctx.fillText(initial, avatarX, avatarY + 1);

    // Store Name & Campus Details
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(listing.seller.name, avatarX + avatarR + 24, storeCardY + 52);

    ctx.fillStyle = "#9AA1AC";
    ctx.font = "22px sans-serif";
    const subText = listing.location || listing.seller.department || "Campus Verified Seller";
    ctx.fillText(subText, avatarX + avatarR + 24, storeCardY + 88);

    // Website Call to Action (Right side of store card)
    ctx.textAlign = "right";
    ctx.fillStyle = "#FFC928";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("campushive.ng", W - 86, storeCardY + 54);

    ctx.fillStyle = "#7A818C";
    ctx.font = "18px sans-serif";
    ctx.fillText("Tap link or scan to view", W - 86, storeCardY + 84);

    const dataUrl = canvas.toDataURL("image/png");
    setCardPngUrl(dataUrl);
    return dataUrl;
  }, [listing]);

  // Generate PNG on modal open
  useEffect(() => {
    if (isOpen) {
      setIsCopied(false);
      setInstagramFeedback(false);
      setIsGeneratingPng(true);
      generatePngCard().finally(() => setIsGeneratingPng(false));
    }
  }, [isOpen, generatePngCard]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPng = async () => {
    let url = cardPngUrl;
    if (!url) {
      url = await generatePngCard();
    }
    if (!url) return;

    const link = document.createElement("a");
    const safeTitle = listing.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);
    link.download = `${safeTitle}-campushive.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShareCard = async () => {
    const url = cardPngUrl || (await generatePngCard());
    if (!url) return;

    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const safeTitle = listing.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 30);
      const file = new File([blob], `${safeTitle}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: listing.title,
          text: `${shareText}\n${getShareUrl()}`,
        });
        return;
      }
    } catch {
      // Fall through to standard download
    }

    // Desktop or non-supported fallback
    handleDownloadPng();
  };

  const handleShareWhatsApp = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(
      `🔥 *${listing.title}*\n💰 ${listing.priceFormatted}\n📍 Store: ${listing.seller.name}\n\nView details on Campus Hive:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const handleShareX = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(
      `Check out "${listing.title}" for ${listing.priceFormatted} on @CampusHiveNG! Listed by ${listing.seller.name}.`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleShareInstagram = async () => {
    // 1. Download the crisp PNG card for the user's Story or Post
    await handleDownloadPng();
    // 2. Copy the caption text to clipboard
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${listing.title} - ${listing.priceFormatted} on @campushive.ng!\nStore: ${listing.seller.name}\nCheck it out at ${getShareUrl()}`
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="radius-native w-full max-w-lg rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#ECEEF2] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF4CC] dark:bg-[#FFC928]/15 flex items-center justify-center text-[#171717] dark:text-[#FFC928]">
              <Share2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-[#14171A] dark:text-white leading-tight">
                Share listing
              </h2>
              <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400">
                Share high-quality card or direct social link
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
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Choice Switcher: PNG Card vs Link */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F4F6F8] dark:bg-white/5 text-[12.5px] font-bold">
            <button
              type="button"
              onClick={() => setShareMode("card")}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                shareMode === "card"
                  ? "bg-white dark:bg-[#1D212B] text-[#171717] dark:text-white shadow-xs"
                  : "text-[#68707A] dark:text-neutral-400 hover:text-[#171717]"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>PNG Card (Stories & Feeds)</span>
            </button>

            <button
              type="button"
              onClick={() => setShareMode("link")}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                shareMode === "link"
                  ? "bg-white dark:bg-[#1D212B] text-[#171717] dark:text-white shadow-xs"
                  : "text-[#68707A] dark:text-neutral-400 hover:text-[#171717]"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Direct Link & Text</span>
            </button>
          </div>

          {/* MODE 1: PNG Card Showcase */}
          {shareMode === "card" ? (
            <div className="space-y-3">
              {/* Card Live Preview Container */}
              <div className="relative rounded-2xl overflow-hidden border border-[#ECEEF2] dark:border-white/10 bg-[#0F1218] p-4 text-white shadow-inner">
                {cardPngUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={cardPngUrl}
                      alt={listing.title}
                      className="w-full max-h-[290px] object-contain rounded-xl shadow-lg border border-white/10"
                    />
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#9AA1AC]">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFC928]" />
                      <span>Retina PNG · Optimized for WhatsApp, Instagram & X</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-2 border-[#FFC928] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[12px] text-neutral-400">Rendering high-res card...</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for the PNG Card */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isGeneratingPng || !cardPngUrl}
                  className="radius-native py-2.5 px-4 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-bold text-[12.5px] shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 stroke-[2.2]" />
                  <span>Download PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShareCard}
                  disabled={isGeneratingPng || !cardPngUrl}
                  className="radius-native py-2.5 px-4 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#1D212B] hover:border-[#171717] dark:hover:border-white text-[#171717] dark:text-white font-bold text-[12.5px] flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4 stroke-[2]" />
                  <span>Share Card</span>
                </button>
              </div>
            </div>
          ) : (
            /* MODE 2: Direct Link & Crafted Text */
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 space-y-2">
                <div className="flex items-start gap-3">
                  {listing.images && listing.images[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-14 h-14 rounded-lg object-cover border border-[#E8E8E8] dark:border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-neutral-500" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13.5px] font-bold text-[#14171A] dark:text-white truncate">
                      {listing.title}
                    </h3>
                    <div className="text-[14px] font-extrabold text-[#171717] dark:text-[#FFC928]">
                      {listing.priceFormatted}
                    </div>
                    <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400 mt-0.5 truncate">
                      Store: {listing.seller.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Copy URL input bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
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
          )}

          {/* Social Link Icon Array (Always available below) */}
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
                title="Share Card & Caption to Instagram"
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
                  ✅ PNG Card downloaded & caption copied! Open Instagram to paste into your Story or Post.
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
