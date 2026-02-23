"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ExternalLink, Handshake } from "lucide-react";
import { useState } from "react";
import { ChatListing } from "../../data/chat";

interface NegotiationBannerProps {
    listing: ChatListing;
    onEnd: () => void;
}

export function NegotiationBanner({ listing, onEnd }: NegotiationBannerProps) {
    const [endConfirm, setEndConfirm] = useState(false);

    return (
        <div className="shrink-0 mx-3 mt-2 mb-0 rounded-xl border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-800/30 shadow-sm">
            {!endConfirm ? (
                <div className="flex items-center gap-3 px-3 py-2.5">
                    {/* Listing thumbnail */}
                    <div className="w-12 h-10 rounded-lg overflow-hidden relative shrink-0 bg-secondary border border-border/30">
                        <Image src={listing.image} alt={listing.title} fill className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Handshake className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">Active Negotiation</span>
                        </div>
                        <p className="text-xs font-bold text-foreground truncate">{listing.title}</p>
                        <p className="text-xs font-bold text-primary">₦{listing.price.toLocaleString()}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                            href={`/listings/${listing.id}`}
                            className="text-[10px] font-bold text-primary border border-primary/30 px-2.5 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                        >
                            View
                        </Link>
                        <button
                            onClick={() => setEndConfirm(true)}
                            className="text-[10px] font-bold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            End
                        </button>
                    </div>
                </div>
            ) : (
                /* Confirmation state */
                <div className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-xs font-bold text-foreground">End this negotiation?</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Both parties must agree. The other user will be asked to confirm.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => { onEnd(); setEndConfirm(false); }}
                            className="text-[10px] font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setEndConfirm(false)}
                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
