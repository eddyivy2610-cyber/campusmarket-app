"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquareText, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { ChatInbox } from "../components/chat/ChatInbox";
import { ChatThread } from "../components/chat/ChatThread";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatInput } from "../components/chat/ChatInput";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { apiGet, apiPost } from "../lib/apiClient";
import { Conversation, Message } from "../data/chat";
import { toast } from "sonner";

// ── Helper: Map backend conversation to frontend Conversation type
function mapConversation(raw: any, myId: string): Conversation {
    // Determine the other participant (not the current user)
    const other = raw.participants?.find((p: any) => p._id !== myId) || raw.participants?.[0];

    const participant = {
        id: other?._id || "unknown",
        name: other?.profile?.displayName || other?.personalDetails?.fullName || other?.email?.split("@")[0] || "User",
        avatar: other?.profile?.avatar || "",
        memberSince: other?.createdAt ? new Date(other.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently",
        responseTime: "Varies",
        activeListings: other?.businessProfile?.activeListingsCount || 0,
        completedSales: other?.businessProfile?.soldItemsCount || 0,
    };

    const listing = raw.listingId ? {
        id: raw.listingId._id || raw.listingId,
        title: raw.listingId.title || "Listing",
        price: raw.listingId.price || 0,
        image: raw.listingId.images?.[0] || "",
        status: raw.listingId.status || "available",
    } : undefined;

    const lastMsgText = raw.lastMessage?.text || "Start of conversation";
    const lastTime = raw.lastMessage?.time
        ? new Date(raw.lastMessage.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

    return {
        id: raw._id,
        participant,
        listing,
        messages: [], // Loaded separately when conversation is selected
        lastMessage: lastMsgText,
        lastTime,
        unread: raw.unreadCount?.get?.(myId) || 0,
    };
}

// ── Helper: Map backend message to frontend Message type
function mapMessage(raw: any, myId: string): Message {
    const senderId = raw.senderId?._id || raw.senderId;
    return {
        id: raw._id,
        senderId: senderId === myId ? "me" : senderId,
        type: raw.type || "text",
        text: raw.text,
        timestamp: raw.createdAt
            ? new Date(raw.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Now",
        read: raw.read || false,
    };
}

export default function DashboardMessagesPage() {
    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background font-sans overflow-hidden">
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

    const { user } = useAuth();
    const { socket } = useSocket();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<"inbox" | "thread">("inbox");
    const [isTyping, setIsTyping] = useState(false);
    const [filter, setFilter] = useState<"all" | "unread" | "archived" | "flagged">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [conversations, activeId, isTyping]);

    // ── Fetch conversations from API
    const fetchConversations = useCallback(async () => {
        if (!user) return;
        try {
            setIsLoadingConversations(true);
            const res = await apiGet<{ success: boolean; data: any[] }>(`/api/chat/user/${user.id}`);
            const mapped = (res.data || []).map((c: any) => mapConversation(c, user.id));
            setConversations(mapped);
        } catch (err: any) {
            console.error("Failed to load conversations:", err);
            // Don't toast — silently fail and show empty state
        } finally {
            setIsLoadingConversations(false);
        }
    }, [user]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // ── Fetch messages when a conversation is selected
    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            setIsLoadingMessages(true);
            const res = await apiGet<{ success: boolean; data: any[] }>(`/api/chat/${conversationId}/messages`);
            const msgs = (res.data || []).map((m: any) => mapMessage(m, user?.id));
            setConversations(prev =>
                prev.map(c => c.id === conversationId ? { ...c, messages: msgs, unread: 0 } : c)
            );
        } catch (err) {
            console.error("Failed to load messages:", err);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [user]);

    // ── Handle URL params (deep link to a conversation)
    useEffect(() => {
        if (!userParam || conversations.length === 0) return;
        const conv = conversations.find(c => c.participant.id === userParam);
        if (conv) {
            setActiveId(conv.id);
            setMobileView("thread");
            fetchMessages(conv.id);
        }
    }, [userParam, conversations]);

    // ── Socket.IO: listen for incoming messages
    useEffect(() => {
        if (!socket || !user) return;

        const handleReceiveMessage = (data: any) => {
            const msg = mapMessage(data, user.id);
            const convId = data.conversationId;

            setConversations(prev => prev.map(c => {
                if (c.id !== convId) return c;
                return {
                    ...c,
                    messages: [...c.messages, msg],
                    lastMessage: msg.text || "",
                    lastTime: "Now",
                    unread: convId === activeId ? 0 : (c.unread || 0) + 1,
                };
            }));
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [socket, user, activeId]);

    // ── Send a message
    const sendMessage = async (text: string) => {
        if (!activeId || !text.trim() || !user) return;
        const activeConv = conversations.find(c => c.id === activeId);
        if (!activeConv) return;

        // Optimistic update
        const tempMsg: Message = {
            id: `temp-${Date.now()}`,
            senderId: "me",
            type: "text",
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: true,
        };

        setConversations(prev => prev.map(c =>
            c.id === activeId
                ? { ...c, messages: [...c.messages, tempMsg], lastMessage: text, lastTime: "Now" }
                : c
        ));

        try {
            setIsSending(true);
            const res = await apiPost<{ success: boolean; data: any }>("/api/chat/send", {
                conversationId: activeId,
                senderId: user.id,
                text,
                type: "text",
            });

            const savedMsg = mapMessage(res.data, user.id);

            // Replace temp msg with saved
            setConversations(prev => prev.map(c => {
                if (c.id !== activeId) return c;
                return {
                    ...c,
                    messages: c.messages.map(m => m.id === tempMsg.id ? savedMsg : m),
                };
            }));

            // Emit to socket so recipient gets it in real-time
            socket?.emit("send_message", {
                conversationId: activeId,
                receiverId: activeConv.participant.id,
                senderId: user.id,
                text,
                type: "text",
                _id: res.data._id,
            });
        } catch (err: any) {
            toast.error("Failed to send message");
            // Roll back optimistic update
            setConversations(prev => prev.map(c =>
                c.id === activeId
                    ? { ...c, messages: c.messages.filter(m => m.id !== tempMsg.id) }
                    : c
            ));
        } finally {
            setIsSending(false);
        }
    };

    const handleSelectConversation = (id: string) => {
        setActiveId(id);
        setMobileView("thread");
        fetchMessages(id);
    };

    const filteredConversations = conversations
        .filter(c =>
            filter === "unread" ? c.unread > 0 :
            filter === "archived" ? false :
            filter === "flagged" ? false : true
        )
        .filter(c =>
            c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const activeConversation = conversations.find(c => c.id === activeId) ?? null;

    return (
        <div className="flex-1 min-h-0 flex bg-card overflow-hidden h-full">
            {/* ── LEFT: Inbox sidebar ───── */}
            <div className={`w-full md:w-80 lg:w-[340px] shrink-0 flex flex-col border-r border-border/60 bg-card ${mobileView === "thread" ? "hidden md:flex" : "flex"} h-full`}>
                
                {/* Header & Search */}
                <div className="p-5 md:p-6 pb-4 shrink-0 flex flex-col gap-5 border-b border-border/30">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[15px] font-bold text-foreground">Active Conversations</h2>
                        <span className="w-6 h-6 flex items-center justify-center bg-secondary/80 rounded-md text-[11px] font-bold text-foreground/80">
                            {conversations.length}
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-muted/40 rounded-xl text-xs font-medium outline-none text-foreground placeholder:text-muted-foreground/60 transition-colors focus:ring-1 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 min-h-0 overflow-y-auto pt-2" data-lenis-prevent>
                    {isLoadingConversations ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-2">
                            <MessageSquareText className="w-8 h-8 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No conversations yet</p>
                        </div>
                    ) : (
                        <ChatInbox
                            conversations={filteredConversations}
                            activeId={activeId}
                            onSelect={handleSelectConversation}
                        />
                    )}
                </div>
            </div>

            {/* ── RIGHT: Chat / Empty ───── */}
            <div className={`flex-1 flex flex-col min-w-0 bg-secondary/5 ${mobileView === "inbox" ? "hidden md:flex" : "flex"} h-full`}>
                {activeConversation ? (
                    <div className="flex flex-col h-full relative font-sans min-h-0">
                        <ChatHeader
                            participant={activeConversation.participant}
                            onBack={() => { setActiveId(null); setMobileView("inbox"); }}
                        />
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0"
                            data-lenis-prevent
                        >
                            {isLoadingMessages ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : (
                                <ChatThread
                                    messages={activeConversation.messages}
                                    participantAvatar={activeConversation.participant.avatar}
                                    participantName={activeConversation.participant.name}
                                    isTyping={isTyping}
                                    userRole="vendor"
                                />
                            )}
                        </div>
                        <div className="p-3 md:p-4 bg-card border-t border-border/0 pb-4 md:pb-4 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] md:shadow-none z-20 relative">
                            <ChatInput
                                onSend={sendMessage}
                                onShareListing={() => {}}
                                isBuyer={true}
                            />
                        </div>
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-64 h-64 relative opacity-80">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
                <div className="relative flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6 shadow-inner">
                        <MessageSquareText className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-xl font-bold text-foreground">No conversation selected</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[240px]">
                        Pick a conversation from the left, or start a new one by contacting a seller.
                    </p>
                </div>
            </div>

            <Link
                href="/"
                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
                <PlusCircle className="w-4 h-4" />
                Browse Listings
            </Link>
        </div>
    );
}
