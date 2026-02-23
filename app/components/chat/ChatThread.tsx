"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCheck, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Message } from "../../data/chat";

interface ChatThreadProps {
    messages: Message[];
    participantAvatar: string;
    participantName: string;
    isTyping: boolean;
}

/**
 * Pure renderer — owns zero scroll logic.
 * The scrollable container lives in page.tsx so scroll is always isolated.
 */
export function ChatThread({ messages, participantAvatar, participantName, isTyping }: ChatThreadProps) {
    return (
        <div className="flex flex-col gap-3 px-4 py-4">
            {messages.map((msg) => (
                <MessageBubble
                    key={msg.id}
                    msg={msg}
                    participantAvatar={participantAvatar}
                    participantName={participantName}
                />
            ))}

            {/* Typing indicator */}
            {isTyping && (
                <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden relative shrink-0">
                        {participantAvatar && <Image src={participantAvatar} alt="" fill className="object-cover" />}
                    </div>
                    <div className="bg-secondary/70 rounded-3xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Message bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, participantAvatar, participantName }: {
    msg: Message;
    participantAvatar: string;
    participantName: string;
}) {
    const isMe = msg.senderId === "me";

    // System message (negotiation events)
    if (msg.type === "system") {
        return (
            <div className="flex justify-center my-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/60 rounded-full max-w-[85%]">
                    <Info className="w-3 h-3 text-muted-foreground shrink-0" />
                    <p className="text-[10px] text-muted-foreground text-center leading-relaxed">{msg.text}</p>
                </div>
            </div>
        );
    }

    // Listing card message
    if (msg.type === "listing-card" && msg.listing) {
        return (
            <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden relative shrink-0">
                        {participantAvatar && <Image src={participantAvatar} alt="" fill className="object-cover" />}
                    </div>
                )}
                <div className={`max-w-[240px] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                    {msg.text && <p className={`text-[10px] text-muted-foreground ${isMe ? "text-right" : ""}`}>{msg.text}</p>}
                    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm w-56">
                        <div className="h-28 relative bg-secondary">
                            <Image src={msg.listing.image} alt={msg.listing.title} fill className="object-cover" />
                        </div>
                        <div className="p-3">
                            <p className="text-xs font-bold text-foreground truncate">{msg.listing.title}</p>
                            <p className="text-sm font-bold text-primary">₦{msg.listing.price.toLocaleString()}</p>
                            <Link href={`/listings/${msg.listing.id}`} className="mt-2 block text-center text-[10px] font-bold text-primary border border-primary/30 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                                View Listing
                            </Link>
                        </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{msg.timestamp}</p>
                </div>
            </div>
        );
    }

    // Standard text message
    return (
        <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
            {!isMe && (
                <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden relative shrink-0">
                    {participantAvatar && <Image src={participantAvatar} alt="" fill className="object-cover" />}
                </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-2.5 rounded-3xl text-sm font-medium leading-relaxed ${isMe
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-secondary/70 text-foreground rounded-bl-sm"}`}>
                    {msg.text}
                </div>
                <div className={`flex items-center gap-1 ${isMe ? "flex-row-reverse" : ""}`}>
                    <span className="text-[9px] text-muted-foreground">{msg.timestamp}</span>
                    {isMe && <CheckCheck className={`w-3 h-3 ${msg.read ? "text-primary" : "text-muted-foreground"}`} />}
                </div>
            </div>
        </div>
    );
}
