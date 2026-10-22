"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  CalendarClock,
  Sparkles,
  MapPin,
  MessageSquareReply,
  PlusCircle,
  GraduationCap,
} from "lucide-react";
import { WANTED_REQUESTS_DB, type WantedRequestItem } from "../../data/mvpMockData";
import { useCampus } from "../../context/CampusContext";
import { CATEGORIES } from "../../data/products";

export function WantedRequestsSection({ showAll = false }: { showAll?: boolean }) {
  const { selectedCampus } = useCampus();
  const [requests, setRequests] = useState<WantedRequestItem[]>(WANTED_REQUESTS_DB);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academics");
  const [budgetMax, setBudgetMax] = useState("12000");
  const [urgency, setUrgency] = useState<"Urgent" | "This Week" | "Flexible">("This Week");
  const [landmark, setLandmark] = useState(
    selectedCampus.landmarks[0]?.name || "Kashim Ibrahim Library (KIL) Entrance"
  );

  const displayedRequests = showAll ? requests : requests.slice(0, 4);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const nextItem: WantedRequestItem = {
      id: `want-${Date.now()}`,
      title: title.trim(),
      description:
        description.trim() ||
        `Looking for ${title.trim()} around ${selectedCampus.shortName}.`,
      budgetMin: Math.max(1000, Math.round(Number(budgetMax) * 0.75)),
      budgetMax: Number(budgetMax) || 10000,
      category,
      campusSlug: selectedCampus.slug,
      campusShortName: selectedCampus.shortName,
      preferredLandmark: landmark,
      urgency,
      status: "Open",
      requesterName: "Campus Student",
      requesterHandle: "student_member",
      requesterDepartment: selectedCampus.shortName,
      responsesCount: 0,
      postedAt: "Just now",
    };
    setRequests((prev) => [nextItem, ...prev]);
    setTitle("");
    setDescription("");
    setIsPostModalOpen(false);
  };

  return (
    <section className="w-full pt-4 pb-2 font-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-6 bg-[#FFD700]/80 rounded-none shadow-sm" />
          <div>
            <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">
              Looking For — Campus Wanted Requests
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Reverse marketplace • Students post what they need &amp; verified sellers respond with offers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPostModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD700] hover:bg-[#FFD700]/90 text-black text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Request</span>
          </button>
          {!showAll && (
            <Link
              href="/wanted"
              className="px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-secondary text-foreground text-[11px] font-bold uppercase tracking-wider transition-colors"
            >
              View All
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {displayedRequests.map((req) => (
          <div
            key={req.id}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-amber-800 dark:text-amber-300">
                  {req.category}
                </span>
                {req.urgency === "Urgent" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                    <Flame className="w-3 h-3" />
                    <span>Urgent</span>
                  </span>
                ) : req.urgency === "This Week" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
                    <CalendarClock className="w-3 h-3" />
                    <span>This Week</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                    <Sparkles className="w-3 h-3" />
                    <span>Flexible</span>
                  </span>
                )}
              </div>

              <h3 className="text-xs md:text-sm font-bold text-foreground line-clamp-2">
                {req.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                {req.description}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-secondary/40 px-3 py-2 border border-border/40">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">
                    Budget Range
                  </span>
                  <span className="text-xs md:text-sm font-black text-amber-800 dark:text-amber-300">
                    ₦{req.budgetMin.toLocaleString()} – ₦{req.budgetMax.toLocaleString()}
                  </span>
                </div>
                <div className="text-right min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">
                    Preferred Meetup
                  </span>
                  <span className="text-[11px] font-bold text-foreground truncate block max-w-[165px]">
                    {req.preferredLandmark}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-foreground truncate">
                    @{req.requesterHandle}
                  </span>
                  <GraduationCap
                    className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                    aria-label="Verified Student"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-[#FFD700] shrink-0" />
                  <span>
                    {req.campusShortName} • {req.postedAt}
                  </span>
                </p>
              </div>

              <Link
                href={`/messages?wanted=${req.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                <MessageSquareReply className="w-3.5 h-3.5" />
                <span>Respond ({req.responsesCount})</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Post Wanted Request Modal */}
      {isPostModalOpen && (
        <div
          className="fixed inset-0 z-[950] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsPostModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Post a &ldquo;Looking For&rdquo; Request
              </h3>
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  What are you looking for?
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Fairly used 18-inch standing fan or Casio fx-991EX"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-foreground"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Max Budget (₦)
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) =>
                      setUrgency(
                        e.target.value as "Urgent" | "This Week" | "Flexible"
                      )
                    }
                    className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-foreground"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="This Week">This Week</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Pickup Landmark
                  </label>
                  <select
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-foreground"
                  >
                    {selectedCampus.landmarks.map((lm) => (
                      <option key={lm.id} value={lm.name}>
                        {lm.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  Additional Details
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Condition preferences, course code, or meetup time..."
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-foreground"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-bold uppercase tracking-widest text-[11px] cursor-pointer"
              >
                Publish Wanted Request ({selectedCampus.shortName})
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
