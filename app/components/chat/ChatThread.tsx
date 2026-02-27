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
    userRole?: "buyer" | "vendor";
    onEndNegotiation?: () => void;
}

/**
 * Pure renderer — owns zero scroll logic.
 * The scrollable container lives in page.tsx so scroll is always isolated.
 */
export function ChatThread({ messages, participantAvatar, participantName, isTyping, userRole = "buyer", onEndNegotiation }: ChatThreadProps) {
    return (
        <div className="flex flex-col gap-2 px-4 py-4">
            {messages.map((msg) => (
                <MessageBubble
                    key={msg.id}
                    msg={msg}
                    participantAvatar={participantAvatar}
                    participantName={participantName}
                    userRole={userRole}
                    onEndNegotiation={onEndNegotiation}
                />
            ))}

            {/* Typing indicator */}
            {isTyping && (
                <div className="flex items-end gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-secondary overflow-hidden relative shrink-0">
                        {participantAvatar && <Image src={participantAvatar} alt="" fill className="object-cover" />}
                    </div>
                    <div className="bg-secondary/70 rounded-2xl rounded-bl-sm px-3 py-1.5 flex items-center gap-1">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1 h-1 bg-muted-foreground rounded-full"
                                animate={{ y: [0, -3, 0] }}
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
function MessageBubble({ msg, participantAvatar, participantName, userRole, onEndNegotiation }: {
    msg: Message;
    participantAvatar: string;
    participantName: string;
    userRole: "buyer" | "vendor";
    onEndNegotiation?: () => void;
}) {
    const isMe = msg.senderId === "me";

    // System message (negotiation events)
    if (msg.type === "system") {
        const isStart = msg.text?.toLowerCase().includes("started a negotiation") || msg.text?.toLowerCase().includes("open for");
        const isClosed = msg.text?.toLowerCase().includes("completed") || msg.text?.toLowerCase().includes("closed");

        return (
            <div className="flex justify-center my-1.5 mb-2">
                <div className="flex flex-col sm:flex-row items-center gap-2 px-3 py-2 bg-secondary/50 border border-border/40 rounded-xl max-w-[95%]">
                    <div className="flex items-center gap-1.5 text-center sm:text-left">
                        <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">{msg.text}</p>
                    </div>

                    {/* Action Buttons */}
                    {isStart && (
                        <div className="flex items-center gap-1.5 shrink-0 sm:border-l sm:border-border/60 sm:pl-2">
                            <button className="text-[9px] font-bold text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-md hover:bg-primary/10 transition-colors">View</button>
                            <button onClick={onEndNegotiation} className="text-[9px] font-bold text-red-500 border border-red-200 bg-red-50 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors">Close</button>
                        </div>
                    )}
                    {isClosed && (
                        <div className="flex items-center gap-1.5 shrink-0 sm:border-l sm:border-border/60 sm:pl-2">
                            {userRole === "buyer" ? (
                                <>
                                    <button className="text-[9px] font-bold text-foreground border border-border px-2.5 py-1 rounded-md hover:bg-secondary transition-colors">Rate</button>
                                    <button className="text-[9px] font-bold text-red-500 border border-red-200 bg-red-50 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors">Dispute</button>
                                </>
                            ) : (
                                <button className="text-[9px] font-bold text-muted-foreground border border-border px-2.5 py-1 rounded-md hover:bg-secondary transition-colors">Report</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Listing card message
    if (msg.type === "listing-card" && msg.listing) {
        return (
            <div className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && (
                    <div className="w-5 h-5 rounded-full bg-secondary overflow-hidden relative shrink-0">
                        {participantAvatar && <Image src={participantAvatar} alt="" fill className="object-cover" />}
                    </div>
                )}
                <div className={`max-w-[200px] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                    {msg.text && <p className={`text-[9px] text-muted-foreground ${isMe ? "text-right" : ""}`}>{msg.text}</p>}
                    <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm w-48">
                        <div className="h-20 relative bg-secondary">
                            <Image src={msg.listing.image} alt={msg.listing.title} fill className="object-cover" />
                        </div>
                        <div className="p-2.5">
                            <p className="text-[11px] font-bold text-foreground truncate">{msg.listing.title}</p>
                            <p className="text-xs font-bold text-primary">₦{msg.listing.price.toLocaleString()}</p>
                            <Link href={`/listings/${msg.listing.id}`} className="mt-1.5 block text-center text-[9px] font-bold text-primary border border-primary/30 py-1 rounded-md hover:bg-primary/5 transition-colors">
                                View
                            </Link>
                        </div>
                    </div>
                    <p className="text-[8px] text-muted-foreground">{msg.timestamp}</p>
                </div>
            </div>
        );
    }

    // Standard text message
    return (
        <div className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
            {!isMe && (
                <div className="w-5 h-5 rounded-full bg-secondary overflow-hidden relative shrink-0">
                    {participantAvatar && <Image src={participantAvatar} alt="" fill className="object-cover" />}
                </div>
            )}
            <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                <div className={`px-3 py-1.5 rounded-2xl text-[11px] font-medium leading-relaxed ${isMe
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-secondary/70 text-foreground rounded-bl-sm"}`}>
                    {msg.text}
                </div>
                <div className={`flex items-center gap-1 ${isMe ? "flex-row-reverse" : ""}`}>
                    <span className="text-[8px] text-muted-foreground">{msg.timestamp}</span>
                    {isMe && <CheckCheck className={`w-2 h-2 ${msg.read ? "text-primary" : "text-muted-foreground"}`} />}
                </div>
            </div>
        </div>
    );
}
