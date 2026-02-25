"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquareText, Lock } from "lucide-react";
import { ChatInbox } from "../components/chat/ChatInbox";
import { ChatThread } from "../components/chat/ChatThread";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatInput } from "../components/chat/ChatInput";
import { NegotiationBanner } from "../components/chat/NegotiationBanner";
import { NegotiationHistory } from "../components/chat/ChatSidebar";
import {
    CONVERSATIONS, PARTICIPANTS, CHAT_LISTINGS,
    Conversation, ChatListing, Message
} from "../data/chat";

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
        }>
            <ChatPageInner />
        </Suspense>
    );
}

function ChatPageInner() {
    const params = useSearchParams();
    const userParam = params.get("user");
    const listingParam = params.get("listing");

    const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<"inbox" | "thread">("inbox");
    const [isTyping, setIsTyping] = useState(false);

    /**
     * The scroll container ref lives HERE — not in ChatThread.
     * This is the only place scroll is allowed; all children are pure renderers.
     */
    const scrollRef = useRef<HTMLDivElement>(null);
    /** Refs to measure overlay heights → set as padding on the scroll container */
    const topOverlayRef = useRef<HTMLDivElement>(null);
    const botOverlayRef = useRef<HTMLDivElement>(null);
    const [topH, setTopH] = useState(56);   // header default
    const [botH, setBotH] = useState(100);  // strip + input default

    // Lock outer page scroll AND bound body height so flex-1 children
    // have a real ceiling. Without body height:100dvh the body's
    // min-h-screen allows infinite growth and overflow-y-auto never clips.
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const snap = { o: html.style.overflow, h: body.style.height };
        html.style.overflow = "hidden";
        body.style.height = "100dvh";
        return () => { html.style.overflow = snap.o; body.style.height = snap.h; };
    }, []);

    // Keep scroll container padding in sync with actual overlay heights
    useEffect(() => {
        const top = topOverlayRef.current;
        const bot = botOverlayRef.current;
        if (!top || !bot) return;
        const ro = new ResizeObserver(() => {
            setTopH(top.offsetHeight);
            setBotH(bot.offsetHeight);
        });
        ro.observe(top);
        ro.observe(bot);
        return () => ro.disconnect();
        // Re-run when conversation/banner changes so new elements are observed
    }, [activeId, listingParam]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-open conversation from URL params
    useEffect(() => {
        if (!userParam) { setActiveId(null); setMobileView("inbox"); return; }

        let conv = conversations.find(c => c.participant.id === userParam);

        if (!conv) {
            const participant = PARTICIPANTS[userParam];
            if (!participant) return;

            const listing = listingParam ? CHAT_LISTINGS[parseInt(listingParam)] : undefined;

            // System message auto-sent when negotiation is opened from a listing
            const systemMsg: Message = listing ? {
                id: `sys-${Date.now()}`,
                senderId: "system",
                type: "system",
                text: `🤝 You started a negotiation for ${listing.title} (₦${listing.price.toLocaleString()}). Ending a negotiation requires both parties to agree.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                read: true,
            } : null!;

            const newConv: Conversation = {
                id: `new-${userParam}`,
                participant,
                listing,
                lastMessage: systemMsg?.text ?? "New conversation",
                lastTime: "Now",
                unread: 0,
                negotiations: listing ? [{ id: `n-${Date.now()}`, listing, status: "active", startedAt: "Now" }] : [],
                messages: systemMsg ? [systemMsg] : [],
            };
            setConversations(prev => {
                if (prev.some(c => c.id === newConv.id || c.participant.id === userParam)) {
                    return prev;
                }
                return [newConv, ...prev];
            });
            conv = newConv;
        }

        setActiveId(conv.id);
        setMobileView("thread");
    }, [userParam, listingParam]); 

    // Auto-scroll to bottom when messages change — operates on scrollRef directly
    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [conversations, activeId, isTyping]);

    const activeConversation = conversations.find(c => c.id === activeId) ?? null;

    const contextListing: ChatListing | null =
        (listingParam && CHAT_LISTINGS[parseInt(listingParam)])
            ? CHAT_LISTINGS[parseInt(listingParam)]
            : (activeConversation?.listing ?? null);

    // Send a text message
    const sendMessage = (text: string) => {
        if (!activeId || !text.trim()) return;
        const msg: Message = {
            id: `m${Date.now()}`,
            senderId: "me",
            type: "text",
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: true,
        };
        addMessage(msg);
        simulateReply();
    };

    // Send a listing-card message
    const sendListingCard = (listing: ChatListing) => {
        if (!activeId) return;
        const msg: Message = {
            id: `m${Date.now()}`,
            senderId: "me",
            type: "listing-card",
            listing,
            text: "Check out this listing",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: true,
        };
        addMessage(msg);
    };

    // End negotiation — sends a system message
    const endNegotiation = () => {
        if (!activeId) return;
        const msg: Message = {
            id: `sys-end-${Date.now()}`,
            senderId: "system",
            type: "system",
            text: "⏹ You requested to end this negotiation. Waiting for the other party to confirm.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: true,
        };
        addMessage(msg);
    };

    const addMessage = (msg: Message) => {
        setConversations(prev => prev.map(c =>
            c.id === activeId
                ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text ?? "", lastTime: "Now" }
                : c
        ));
    };

    const simulateReply = () => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            addMessage({
                id: `m${Date.now() + 1}`,
                senderId: activeConversation?.participant.id ?? "bot",
                type: "text",
                text: "Thanks for your message! I'll get back to you shortly.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                read: false,
            });
        }, 2000);
    };

    return (
        /**
         * Layout: flex row, fills remaining viewport height.
         * min-h-0 on EVERY flex child is required — without it, flex defaults
         * to min-height:auto and overflow-y-auto on children never clips.
         */
        <div className="flex-1 min-h-0 flex overflow-hidden bg-background">

            {/* ── LEFT: Inbox sidebar ─────────────────────────────────────── */}
            <div className={`w-full md:w-72 lg:w-80 shrink-0 min-h-0 flex flex-col border-r border-border/40 ${mobileView === "thread" ? "hidden md:flex" : "flex"}`}>
                <ChatInbox
                    conversations={conversations}
                    activeId={activeId}
                    onSelect={(id) => { setActiveId(id); setMobileView("thread"); }}
                />
            </div>

            {/* ── CENTER: Thread ─────────────────────── */}
            <div className={`flex-1 min-h-0 min-w-0 relative overflow-hidden ${mobileView === "inbox" ? "hidden md:block" : "block"
                }`}>

                {activeConversation ? (
                    <>
                        {/* ── TOP OVERLAY: header + banner, floats above thread ── */}
                        <div ref={topOverlayRef} className="absolute top-0 inset-x-0 z-20 flex flex-col bg-card">
                            <ChatHeader
                                participant={activeConversation.participant}
                                onBack={() => { setActiveId(null); setMobileView("inbox"); }}
                            />
                            {contextListing && (
                                <NegotiationBanner
                                    listing={contextListing}
                                    onEnd={endNegotiation}
                                />
                            )}
                        </div>

                        {/* ── SCROLL LAYER: fills inset:0, sits behind overlays ── */}
                        {/* padding-top/bottom = measured overlay heights so messages
                            are never hidden under the pinned top/bottom bars. */}
                        <div
                            ref={scrollRef}
                            className="absolute inset-0 overflow-y-auto"
                            style={{ paddingTop: topH, paddingBottom: botH }}
                            data-lenis-prevent
                        >
                            <ChatThread
                                messages={activeConversation.messages}
                                participantAvatar={activeConversation.participant.avatar}
                                participantName={activeConversation.participant.name}
                                isTyping={isTyping}
                            />
                        </div>

                        {/* ── BOTTOM OVERLAY: security + input, floats above thread ── */}
                        <div ref={botOverlayRef} className="absolute bottom-0 inset-x-0 z-20 flex flex-col bg-card">
                            <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200/40 flex items-center gap-1.5">
                                <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                                <p className="text-[10px] text-amber-800 dark:text-amber-300 truncate">
                                    Keep all transactions on Campus Market. Never share bank details.
                                </p>
                            </div>
                            <ChatInput onSend={sendMessage} onShareListing={sendListingCard} />
                        </div>
                    </>
                ) : (
                    <EmptyState />
                )}
            </div>

            {/* ── RIGHT: Negotiations for the active conversation only ── */}
            <div className="hidden xl:flex min-h-0 w-64 flex-col shrink-0">
                <NegotiationHistory
                    negotiations={activeConversation?.negotiations ?? []}
                    participant={activeConversation?.participant ?? null}
                />
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquareText className="w-8 h-8 text-primary" />
            </div>
            <div>
                <p className="text-base font-bold text-foreground">Your messages</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Select a conversation, or tap "Chat with Seller" on any listing to start a negotiation.
                </p>
            </div>
        </div>
    );
}
