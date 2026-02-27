"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquareText, Lock } from "lucide-react";
import { ChatInbox } from "../../components/chat/ChatInbox";
import { ChatThread } from "../../components/chat/ChatThread";
import { ChatHeader } from "../../components/chat/ChatHeader";
import { ChatInput } from "../../components/chat/ChatInput";
import { NegotiationBanner } from "../../components/chat/NegotiationBanner";
import { ChatProfilePreview } from "../../components/chat/ChatProfilePreview";
import {
    CONVERSATIONS, PARTICIPANTS, CHAT_LISTINGS,
    Conversation, ChatListing, Message
} from "../../data/chat";

export default function DashboardMessagesPage() {
    return (
        <div className="flex flex-col h-full">
            <Suspense fallback={null}>
                <DashboardMessagesInner />
            </Suspense>
        </div>
    );
}

function DashboardMessagesInner() {
    const params = useSearchParams();
    const userParam = params.get("user");
    const listingParam = params.get("listing");

    const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<"inbox" | "thread">("inbox");
    const [isTyping, setIsTyping] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const topOverlayRef = useRef<HTMLDivElement>(null);
    const botOverlayRef = useRef<HTMLDivElement>(null);
    const [topH, setTopH] = useState(56);
    const [botH, setBotH] = useState(100);

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
    }, [activeId, listingParam]);

    useEffect(() => {
        if (!userParam) { setActiveId(null); setMobileView("inbox"); return; }
        let conv = conversations.find(c => c.participant.id === userParam);

        if (!conv) {
            const participant = PARTICIPANTS[userParam];
            if (!participant) return;
            const listing = listingParam ? CHAT_LISTINGS[parseInt(listingParam)] : undefined;
            const newConv: Conversation = {
                id: `new-${userParam}`,
                participant,
                listing,
                lastMessage: "New conversation",
                lastTime: "Now",
                unread: 0,
                negotiations: listing ? [{ id: `n-${Date.now()}`, listing, status: "active", startedAt: "Now" }] : [],
                messages: [],
            };
            setConversations(prev => [newConv, ...prev]);
            conv = newConv;
        }

        setActiveId(conv.id);
        setMobileView("thread");
    }, [userParam, listingParam]);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [conversations, activeId, isTyping]);

    const activeConversation = conversations.find(c => c.id === activeId) ?? null;

    const contextListing: ChatListing | null =
        (listingParam && CHAT_LISTINGS[parseInt(listingParam)])
            ? CHAT_LISTINGS[parseInt(listingParam)]
            : (activeConversation?.listing ?? null);

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

    const endNegotiation = () => {
        if (!activeId) return;
        const msg: Message = {
            id: `sys-end-${Date.now()}`,
            senderId: "system",
            type: "system",
            text: "⏹ You requested to close this negotiation. Waiting for the other party to confirm.",
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
                senderId: activeConversation?.participant.id ?? "buyer",
                type: "text",
                text: "Thanks! I'll review and get back to you.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                read: false,
            });
        }, 2000);
    };

    return (
        <div className="flex-1 min-h-[600px] overflow-hidden flex flex-col">
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
                <div className={`flex-1 min-h-0 min-w-0 relative overflow-hidden ${mobileView === "inbox" ? "hidden md:block" : "block"}`}>
                    {activeConversation ? (
                        <>
                            {/* ── TOP OVERLAY: header, floats above thread ── */}
                            <div ref={topOverlayRef} className="absolute top-0 inset-x-0 z-20 flex flex-col bg-card">
                                <ChatHeader
                                    participant={activeConversation.participant}
                                    onBack={() => { setActiveId(null); setMobileView("inbox"); }}
                                />
                            </div>

                            {/* ── SCROLL LAYER: fills inset:0, sits behind overlays ── */}
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
                                    userRole="vendor"
                                    onEndNegotiation={endNegotiation}
                                />
                            </div>

                            {/* ── BOTTOM OVERLAY: input, floats above thread ── */}
                            <div ref={botOverlayRef} className="absolute bottom-0 inset-x-0 z-20 flex flex-col bg-card">
                                <ChatInput onSend={sendMessage} onShareListing={sendListingCard} />
                            </div>
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </div>

                {/* ── RIGHT: Profile Preview ── */}
                <div className="hidden xl:flex min-h-0 w-64 flex-col shrink-0">
                    <ChatProfilePreview participant={activeConversation?.participant ?? null} />
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4 text-center p-8 bg-card/30">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquareText className="w-8 h-8 text-primary" />
            </div>
            <div>
                <p className="text-base font-bold text-foreground">Select a conversation</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Choose a conversation from your inbox to start chatting with your customers.
                </p>
            </div>
        </div>
    );
}
