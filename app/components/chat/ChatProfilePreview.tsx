"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Star, Package, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { ChatParticipant } from "../../data/chat";

interface ChatProfilePreviewProps {
    participant: ChatParticipant | null;
}

export function ChatProfilePreview({ participant }: ChatProfilePreviewProps) {
    if (!participant) {
        return (
            <div className="flex flex-col min-h-0 h-full bg-secondary/10 border-l border-border/40 p-6 items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-secondary/60 flex items-center justify-center mb-4">
                    <Star className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Open a conversation to see the user's profile preview.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-0 h-full bg-secondary/10 border-l border-border/40 overflow-y-auto" data-lenis-prevent>
            <div className="p-6 flex flex-col items-center border-b border-border/30 bg-card">
                <div className="w-20 h-20 rounded-full bg-secondary overflow-hidden relative mb-4 ring-4 ring-background shadow-sm">
                    {participant.avatar ? (
                        <Image src={participant.avatar} alt={participant.name} fill className="object-cover" />
                    ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">
                            {participant.name.charAt(0)}
                        </span>
                    )}
                </div>
                <h2 className="text-base font-bold text-foreground mb-1 text-center">{participant.name}</h2>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 mb-4">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verified User</span>
                </div>

                <Link
                    href={`/profile/${participant.id}`}
                    className="flex flex-col items-center justify-center w-full px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-colors font-bold text-xs gap-2"
                >
                    <span className="flex items-center justify-center gap-2"><ExternalLink className="w-3.5 h-3.5" />View Full Profile</span>
                </Link>
            </div>

            <div className="p-6 space-y-5 flex-1 bg-card/50">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Member Since</p>
                        <p className="text-sm font-bold text-foreground">{participant.memberSince}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Response Time</p>
                        <p className="text-sm font-bold text-foreground">{participant.responseTime}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Active Listings</p>
                        <p className="text-sm font-bold text-foreground">{participant.activeListings} items</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Completed Sales</p>
                        <p className="text-sm font-bold text-emerald-600">{participant.completedSales} sales</p>
                    </div>
                </div>
            </div>

            <div className="p-6 shrink-0 border-t border-border/30 bg-card">
                <p className="text-xs text-muted-foreground text-center">
                    Keep interactions safe and respectful.
                </p>
            </div>
        </div>
    );
}
