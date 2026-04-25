"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCheck, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Message, ChatListing } from "../../data/chat";
import { OptimizedImage } from "../common/OptimizedImage";

interface ChatThreadProps {
    messages: Message[];
    participantAvatar: string;
    participantName: string;
    isTyping: boolean;
    userRole?: "buyer" | "vendor";
    onEndNegotiation?: () => void;
    onConfirmEndNegotiation?: (status: "completed" | "ended") => void;
}

export function ChatThread({ 
    messages, 
    participantAvatar, 
    participantName, 
    isTyping, 
    userRole = "buyer", 
    onEndNegotiation,
    onConfirmEndNegotiation
}: ChatThreadProps) {
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
                    onConfirmEndNegotiation={onConfirmEndNegotiation}
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

function MessageBubble({ 
    msg, 
    participantAvatar, 
    participantName, 
    userRole, 
    onEndNegotiation,
    onConfirmEndNegotiation
}: {
    msg: Message;
    participantAvatar: string;
    participantName: string;
    userRole: "buyer" | "vendor";
    onEndNegotiation?: () => void;
    onConfirmEndNegotiation?: (status: "completed" | "ended") => void;
}) {
    const isMe = msg.senderId === "me";

    // System message (negotiation events)
    if (msg.type === "system") {
        const isStart = msg.text?.toLowerCase().includes("started a negotiation") || msg.text?.toLowerCase().includes("open for");
        const isClosed = msg.text?.toLowerCase().includes("completed") || msg.text?.toLowerCase().includes("closed");

        return (
            <div className="flex justify-center my-1.5 mb-2">
                <div className="flex flex-col sm:flex-row items-center gap-2 px-3 py-2 bg-secondary/50 border border-border/40 rounded-xl max-w-[95%] shadow-sm">
                    <div className="flex items-center gap-1.5 text-center sm:text-left">
                        <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse shrink-0" />
                        <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-wider">{msg.text}</p>
                    </div>

                    {/* Action Buttons */}
                    {isStart && (
                        <div className="flex items-center gap-1.5 shrink-0 sm:border-l sm:border-border/60 sm:pl-2">
                            <button className="text-[9px] font-black uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-md hover:bg-primary/10 transition-colors">Details</button>
                            <button onClick={onEndNegotiation} className="text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-200 bg-red-50 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors">End Order</button>
                        </div>
                    )}
                    {msg.text?.includes("agree?") && (
                        <div className="flex items-center gap-1.5 shrink-0 sm:border-l sm:border-border/60 sm:pl-2">
                            <button onClick={() => onConfirmEndNegotiation?.("completed")} className="text-[9px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-200 bg-emerald-50 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition-colors">Agree</button>
                            <button onClick={() => onConfirmEndNegotiation?.("ended")} className="text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-200 bg-red-50 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors">Reject</button>
                        </div>
                    )}
                    {isClosed && (
                        <div className="flex items-center gap-1.5 shrink-0 sm:border-l sm:border-border/60 sm:pl-2">
                            {userRole === "buyer" ? (
                                <>
                                    <button className="text-[9px] font-black uppercase tracking-widest text-foreground border border-border px-2.5 py-1 rounded-md hover:bg-secondary transition-colors">Rate Item</button>
                                    <button className="text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-200 bg-red-50 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors">Dispute</button>
                                </>
                            ) : (
                                <button className="text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-border px-2.5 py-1 rounded-md hover:bg-secondary transition-colors">Archive</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Listing card message (Listing Toast)
    if (msg.type === "listing-card" && msg.listing) {
        return (
            <div className={`flex flex-col gap-2 my-2 ${isMe ? "items-end" : "items-start"}`}>
                <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-md w-full max-w-[280px] group transition-all hover:shadow-lg">
                    <div className="h-32 relative bg-secondary overflow-hidden">
                        <OptimizedImage 
                            src={msg.listing.image} 
                            alt={msg.listing.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[9px] font-black text-white uppercase tracking-widest">
                            Inquiry Context
                        </div>
                    </div>
                    <div className="p-3.5 space-y-2">
                        <div>
                            <p className="text-[12px] font-bold text-foreground line-clamp-1">{msg.listing.title}</p>
                            <p className="text-sm font-black text-primary">₦{msg.listing.price.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Link 
                                href={`/listings/${msg.listing.id}`} 
                                className="flex-1 text-center text-[10px] font-bold text-foreground bg-secondary hover:bg-secondary/80 py-2 rounded-lg transition-colors border border-border/40"
                            >
                                Details
                            </Link>
                            <button 
                                className="flex-1 text-center text-[10px] font-bold text-white bg-primary hover:bg-primary/90 py-2 rounded-lg transition-all shadow-sm"
                            >
                                Track Order
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                    <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter">{msg.timestamp}</span>
                </div>
            </div>
        );
    }

    // Standard text message
    return (
        <div className={`flex flex-col gap-1 w-full mt-2 ${isMe ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${isMe
                ? "bg-primary text-primary-foreground rounded-br-sm shadow-primary/10"
                : "bg-muted/40 text-foreground/90 rounded-bl-sm border border-border/30"}`}>
                {msg.text}
            </div>
            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                <span className="text-[10px] font-medium text-muted-foreground/60">{msg.timestamp}</span>
                {isMe && <CheckCheck className={`w-3 h-3 ${msg.read ? "text-primary" : "text-muted-foreground"}`} />}
            </div>
        </div>
    );
}
