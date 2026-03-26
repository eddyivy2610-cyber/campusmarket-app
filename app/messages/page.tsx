"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquareText, Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { ChatInbox } from "../components/chat/ChatInbox";
import { ChatThread } from "../components/chat/ChatThread";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatInput } from "../components/chat/ChatInput";
import {
    CONVERSATIONS, PARTICIPANTS, CHAT_LISTINGS,
    Conversation, Message
} from "../data/chat";

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

    const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<"inbox" | "thread">("inbox");
    const [isTyping, setIsTyping] = useState(false);
    const [filter, setFilter] = useState<"all" | "unread" | "archived" | "flagged">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevent body scroll for this page
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        // Sync URL params to active conversation ONLY when params change
        if (!userParam) return;
        
        const conv = conversations.find(c => c.participant.id === userParam);

        if (conv) {
            setActiveId(conv.id);
            setMobileView("thread");
        } else {
            // Handle new conversation from params
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
                messages: [],
            };
            setConversations(prev => {
                if (prev.some(c => c.id === newConv.id)) return prev;
                return [newConv, ...prev];
            });
            setActiveId(newConv.id);
            setMobileView("thread");
        }
    }, [userParam, listingParam]); // REMOVED conversations dependency

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [conversations, activeId, isTyping]);

    const filteredConversations = conversations.filter(c => 
        filter === "unread" ? c.unread > 0 :
        filter === "archived" ? false : 
        filter === "flagged" ? false : 
        true
    ).filter(c => 
        c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeConversation = conversations.find(c => c.id === activeId) ?? null;

    const isBuyer = activeConversation?.id.startsWith("new-") || 
                    activeConversation?.messages.some(m => m.senderId === "me" && m.type === "text") ||
                    true; 

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

    const unreadTotal = conversations.reduce((acc, c) => acc + c.unread, 0);

    return (
        <div className="flex-1 min-h-0 flex bg-card overflow-hidden h-full">
            {/* ── LEFT: Inbox sidebar ───── */}
            <div className={`w-full md:w-80 lg:w-[340px] shrink-0 flex flex-col border-r border-border/60 bg-white dark:bg-card ${mobileView === "thread" ? "hidden md:flex" : "flex"} h-full`}>
                
                {/* Header & Search */}
                <div className="p-5 md:p-6 pb-4 shrink-0 flex flex-col gap-5 border-b border-border/30">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[15px] font-bold text-foreground">Active Conversations</h2>
                        <span className="w-6 h-6 flex items-center justify-center bg-secondary/80 rounded-md text-[11px] font-bold text-foreground/80">
                            {conversations.length}
                        </span>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-[#f3f6fc] dark:bg-secondary/50 rounded-xl text-xs font-medium outline-none text-foreground placeholder:text-muted-foreground/60 transition-colors focus:ring-1 focus:ring-primary/20"
                        />
                        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 min-h-0 overflow-y-auto pt-2" data-lenis-prevent>
                    <ChatInbox
                        conversations={filteredConversations}
                        activeId={activeId}
                        onSelect={(id) => { setActiveId(id); setMobileView("thread"); }}
                    />
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
                            <ChatThread
                                messages={activeConversation.messages}
                                participantAvatar={activeConversation.participant.avatar}
                                participantName={activeConversation.participant.name}
                                isTyping={isTyping}
                                userRole="vendor"
                            />
                        </div>

                        <div className="p-3 md:p-4 bg-white dark:bg-card border-t border-border/0 pb-4 md:pb-4 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] md:shadow-none z-20 relative">
                            <ChatInput 
                                onSend={sendMessage} 
                                onShareListing={() => {}} 
                                isBuyer={isBuyer}
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
                    <p className="text-xl font-bold text-foreground">You have no messages yet</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[240px]">
                        Find things to discuss or sell something by starting a conversation.
                    </p>
                </div>
            </div>
            
            <Link 
                href="/dashboard/listings/new"
                className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 active:scale-95"
            >
                <PlusCircle className="w-4 h-4" />
                Create ad
            </Link>
        </div>
    );
}
