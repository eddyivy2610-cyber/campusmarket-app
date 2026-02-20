"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Ban, Flag, Image as ImageIcon } from "lucide-react";
import { ChatParticipant, Conversation, CHAT_LISTINGS } from "../../data/chat";

interface ChatSidebarProps {
    conversation: Conversation;
}

const SHARED_MEDIA = [
    "https://images.unsplash.com/photo-1517336712461-18d6e987c653?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1519451241324-20a66d03f56e?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1525547718571-039c6563636c?auto=format&fit=crop&w=200&q=80",
];

export function ChatSidebar({ conversation }: ChatSidebarProps) {
    const { participant } = conversation;

    // Collect listing-card messages to show as shared listings
    const sharedListings = conversation.messages
        .filter(m => m.type === "listing-card" && m.listing)
        .map(m => m.listing!);

    return (
        <div className="flex flex-col h-full bg-card border-l border-border/40 overflow-y-auto">

            {/* Seller profile header */}
            <div className="p-5 border-b border-border/40 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden relative mb-3 ring-2 ring-border/40">
                    {participant.avatar
                        ? <Image src={participant.avatar} alt={participant.name} fill className="object-cover" />
                        : <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-primary">{participant.name.charAt(0)}</span>
                    }
                </div>
                <p className="text-sm font-black text-foreground">{participant.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Campus Seller</p>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-4 w-full">
                    <Link
                        href={`/profile/${participant.id}`}
                        className="w-full py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-colors text-center flex items-center justify-center gap-1.5"
                    >
                        <ExternalLink className="w-3 h-3" />
                        View Profile
                    </Link>
                    <button className="w-full py-2 bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5">
                        <Ban className="w-3 h-3" />
                        Block User
                    </button>
                    <button className="w-full py-2 bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5">
                        <Flag className="w-3 h-3" />
                        Report
                    </button>
                </div>
            </div>

            {/* About stats */}
            <div className="p-4 border-b border-border/40 space-y-2.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">About</p>
                {[
                    { label: "Member since", value: participant.memberSince },
                    { label: "Response time", value: participant.responseTime },
                    { label: "Active listings", value: participant.activeListings },
                    { label: "Completed sales", value: participant.completedSales },
                ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs font-bold text-foreground">{value}</span>
                    </div>
                ))}
            </div>

            {/* Shared media */}
            <div className="p-4 border-b border-border/40">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Shared Media</p>
                <div className="grid grid-cols-3 gap-1.5">
                    {SHARED_MEDIA.map((src, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden relative bg-secondary">
                            <Image src={src} alt="" fill className="object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Shared listings */}
            {sharedListings.length > 0 && (
                <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Shared Listings</p>
                    <div className="space-y-2">
                        {sharedListings.map((listing) => (
                            <Link
                                key={listing.id}
                                href={`/listings/${listing.id}`}
                                className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-xl border border-border/40 hover:border-primary/30 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-secondary shrink-0">
                                    <Image src={listing.image} alt={listing.title} fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{listing.title}</p>
                                    <p className="text-[10px] font-black text-primary">₦{listing.price.toLocaleString()}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
