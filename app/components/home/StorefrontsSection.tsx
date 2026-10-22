"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Clock, Store, ArrowUpRight } from "lucide-react";
import { STOREFRONTS_DB } from "../../data/mvpMockData";
import { VerificationBadge } from "../shared/VerificationBadge";
import { OptimizedImage } from "../common/OptimizedImage";

export function StorefrontsSection() {
  return (
    <section className="w-full pt-4 pb-2 font-heading">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-6 bg-[#FFD700]/80 rounded-none shadow-sm" />
          <div>
            <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">
              Student Entrepreneurs &amp; Approved Local Stores
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Recognizable campus storefronts with distinct student vs. local business verification
            </p>
          </div>
        </div>

        <Link
          href="/stores"
          className="px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-secondary text-foreground text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0"
        >
          All Stores
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {STOREFRONTS_DB.map((store) => (
          <div
            key={store.id}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border/50">
                  <OptimizedImage
                    src={store.avatar}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                    {store.category}
                  </span>
                  <h3 className="text-xs md:text-sm font-bold text-foreground truncate">
                    {store.name}
                  </h3>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-1.5 flex-wrap">
                <VerificationBadge type={store.verificationType} />
                <span className="text-[10px] font-bold text-muted-foreground">
                  {store.activeListingsCount} items
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                {store.tagline}
              </p>

              <div className="mt-2.5 flex flex-wrap gap-1">
                {store.featuredProducts.map((fp) => (
                  <span
                    key={fp}
                    className="text-[9px] font-medium bg-secondary px-1.5 py-0.5 rounded text-foreground/80"
                  >
                    {fp}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2.5 border-t border-border/40 flex items-center justify-between gap-2">
              <div className="text-[10px] text-muted-foreground min-w-0">
                <p className="truncate flex items-center gap-1 font-semibold text-foreground/85">
                  <MapPin className="w-2.5 h-2.5 text-[#FFD700] shrink-0" />
                  <span className="truncate">{store.pickupLandmark}</span>
                </p>
                <p className="truncate flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  <span>Replies {store.responseTime}</span>
                </p>
              </div>

              <Link
                href={`/profile/${store.handle}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                <Store className="w-3 h-3" />
                <span>Visit</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
