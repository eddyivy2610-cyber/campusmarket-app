"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ChevronLeft, MoreVertical, Flag, Ban, Trash2,
    ExternalLink, Lock, Send, Smile, Paperclip, Tag,
    CheckCheck, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Conversation, Message, ChatListing, CHAT_LISTINGS } from "../../data/chat";
import { ListingShareDrawer } from "./ListingShareDrawer";

interface ChatThreadProps {
    conversation: Conversation;
    onBack: () => void;
    pinnedListing?: ChatListing | null;
}

export function ChatThread({ conversation, onBack, pinnedListing }: ChatThreadProps) {
    const { participant, messages: initialMessages, listing } = conversation;
    const contextListing = pinnedListing ?? listing ?? null;

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Simulate typing indicator after sending
    const send = () => {
        if (!input.trim()) return;
        const newMsg: Message = {
            id: `m${Date.now()}`,
            senderId: "me",
            type: "text",
            text: input.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: true,
        };
        setMessages(prev => [...prev, newMsg]);
        setInput("");

        // Simulate recipient typing
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            const reply: Message = {
                id: `m${Date.now() + 1}`,
                senderId: participant.id,
                type: "text",
                text: "Thanks for your message! I'll get back to you shortly.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                read: false,
            };
            setMessages(prev => [...prev, reply]);
        }, 2000);
    };

    const sendListingCard = (listing: ChatListing) => {
        const msg: Message = {
            id: `m${Date.now()}`,
            senderId: "me",
            type: "listing-card",
            listing,
            text: "Check out this listing",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: true,
        };
        setMessages(prev => [...prev, msg]);
        setShareOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* ── Header ── */}
            <div className="shrink-0 bg-card border-b border-border/40 px-4 py-3">
                <div className="flex items-center gap-3">
                    {/* Back */}
                    <button onClick={onBack} className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground md:hidden">
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Avatar + name */}
                    <Link href={`/profile/${participant.id}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
                        <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden relative shrink-0">
                            {participant.avatar
                                ? <Image src={participant.avatar} alt={participant.name} fill className="object-cover" />
                                : <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">{participant.name.charAt(0)}</span>
                            }
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">{participant.name}</p>
                            <p className="text-[10px] text-emerald-500 font-bold">Online</p>
                        </div>
                    </Link>

                    {/* Overflow menu */}
                    <div ref={menuRef} className="relative">
                        <button
                            onClick={() => setMenuOpen(v => !v)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                    className="absolute right-0 top-full mt-1 bg-card border border-border/50 rounded-xl shadow-xl z-50 w-48 overflow-hidden"
                                >
                                    {[
                                        { icon: <ExternalLink className="w-3.5 h-3.5" />, label: "View full listing" },
                                        { icon: <Ban className="w-3.5 h-3.5" />, label: "Block user", danger: true },
                                        { icon: <Flag className="w-3.5 h-3.5" />, label: "Report conversation", danger: true },
                                        { icon: <Trash2 className="w-3.5 h-3.5" />, label: "Clear chat history", danger: true },
                                    ].map((item) => (
                                        <button
                                            key={item.label}
                                            onClick={() => setMenuOpen(false)}
                                            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-bold hover:bg-secondary/50 transition-colors ${item.danger ? "text-red-500" : "text-foreground"}`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Listing context strip ── */}
                {contextListing && (
                    <div className="mt-3 flex items-center gap-3 p-2.5 bg-secondary/30 rounded-xl border border-border/40">
                        <div className="w-12 h-10 rounded-lg overflow-hidden relative shrink-0 bg-secondary">
                            <Image src={contextListing.image} alt={contextListing.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-foreground truncate">{contextListing.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-primary">₦{contextListing.price.toLocaleString()}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${contextListing.status === "available" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                                    {contextListing.status}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/listings/${contextListing.id}`}
                            className="shrink-0 text-[10px] font-black text-primary border border-primary/30 px-2.5 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                        >
                            View
                        </Link>
                    </div>
                )}
            </div>

            {/* ── Message area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} participantAvatar={participant.avatar} participantName={participant.name} />
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex items-end gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden relative shrink-0">
                            {participant.avatar && <Image src={participant.avatar} alt="" fill className="object-cover" />}
                        </div>
                        <div className="bg-secondary rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-1">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                                />
                            ))}
                        </div>
                        <span className="text-[9px] text-muted-foreground">{participant.name.split(" ")[0]} is typing...</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* ── Security notice ── */}
            <div className="shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium truncate">
                        Keep conversations on Campus Market. Never share personal info or bank details.{" "}
                        <Link href="#" className="underline font-bold">Learn more</Link>
                    </p>
                </div>
                <button className="shrink-0 text-[9px] font-black text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1">
                    <Flag className="w-2.5 h-2.5" /> Report
                </button>
            </div>

            {/* ── Input bar ── */}
            <div className="shrink-0 bg-card border-t border-border/40 px-3 py-3">
                <div className="flex items-center gap-2">
                    {/* Attachment icons */}
                    <button className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors rounded-lg">
                        <Smile className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors rounded-lg">
                        <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShareOpen(true)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors rounded-lg"
                        title="Share a listing"
                    >
                        <Tag className="w-4 h-4" />
                    </button>

                    {/* Text field */}
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send()}
                        placeholder="Type your message..."
                        className="flex-1 bg-secondary/40 border border-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
                    />

                    {/* Send */}
                    <button
                        onClick={send}
                        disabled={!input.trim()}
                        className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Listing share drawer */}
            <ListingShareDrawer isOpen={shareOpen} onClose={() => setShareOpen(false)} onSelect={sendListingCard} />
        </div>
    );
}

// ── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, participantAvatar, participantName }: { msg: Message; participantAvatar: string; participantName: string }) {
    const isMe = msg.senderId === "me";

    if (msg.type === "listing-card" && msg.listing) {
        return (
            <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden relative shrink-0">
                        {participantAvatar && <Image src={participantAvatar} alt="" fill className="object-cover" />}
                    </div>
                )}
                <div className={`max-w-[240px] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    {msg.text && <p className={`text-[10px] text-muted-foreground ${isMe ? "text-right" : ""}`}>{msg.text}</p>}
                    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm w-56">
                        <div className="h-28 relative bg-secondary">
                            <Image src={msg.listing.image} alt={msg.listing.title} fill className="object-cover" />
                        </div>
                        <div className="p-3">
                            <p className="text-xs font-bold text-foreground truncate">{msg.listing.title}</p>
                            <p className="text-sm font-black text-primary">₦{msg.listing.price.toLocaleString()}</p>
                            <Link href={`/listings/${msg.listing.id}`} className="mt-2 block text-center text-[10px] font-black text-primary border border-primary/30 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                                View Listing
                            </Link>
                        </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{msg.timestamp}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
            {!isMe && (
                <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden relative shrink-0">
                    {participantAvatar && <Image src={participantAvatar} alt="" fill className="object-cover" />}
                </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${isMe
                    ? "bg-zinc-900 text-white rounded-br-none"
                    : "bg-secondary text-foreground rounded-bl-none"}`}>
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
