"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { ChatInbox } from "../components/chat/ChatInbox";
import { ChatThread } from "../components/chat/ChatThread";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { CONVERSATIONS, PARTICIPANTS, CHAT_LISTINGS, Conversation, ChatListing } from "../data/chat";

/**
 * URL entry points:
 *  /chat                       → inbox only (list of chats)
 *  /chat?user=john             → open thread with "john"
 *  /chat?user=john&listing=1   → open thread + listing pinned at top
 *  /messages                   → redirects here (inbox only)
 */
export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-sm text-muted-foreground">Loading…</p></div>}>
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

    useEffect(() => {
        if (!userParam) {
            setActiveId(null);
            setMobileView("inbox");
            return;
        }

        let conv = conversations.find(c => c.participant.id === userParam);

        if (!conv) {
            const participant = PARTICIPANTS[userParam];
            if (!participant) return;

            const listing = listingParam ? CHAT_LISTINGS[parseInt(listingParam)] : undefined;
            const newConv: Conversation = {
                id: `new-${userParam}`,
                participant,
                listing,
                messages: [],
                lastMessage: "Start a conversation",
                lastTime: "Now",
                unread: 0,
            };
            setConversations(prev => [newConv, ...prev]);
            conv = newConv;
        }

        setActiveId(conv.id);
        setMobileView("thread");
    }, [userParam, listingParam]); // eslint-disable-line react-hooks/exhaustive-deps

    const activeConversation = conversations.find(c => c.id === activeId) ?? null;

    const pinnedListing: ChatListing | null =
        listingParam && CHAT_LISTINGS[parseInt(listingParam)]
            ? CHAT_LISTINGS[parseInt(listingParam)]
            : null;

    return (
        <div className="flex-1 flex overflow-hidden bg-background">

            {/* LEFT: Inbox — always on desktop, only in inbox view on mobile */}
            <div className={`w-full md:w-72 lg:w-80 shrink-0 flex flex-col ${mobileView === "thread" ? "hidden md:flex" : "flex"}`}>
                <ChatInbox
                    conversations={conversations}
                    activeId={activeId}
                    onSelect={(id) => { setActiveId(id); setMobileView("thread"); }}
                />
            </div>

            {/* CENTER: Thread or empty state */}
            <div className={`flex-1 min-w-0 flex flex-col ${mobileView === "inbox" ? "hidden md:flex" : "flex"}`}>
                {activeConversation ? (
                    <ChatThread
                        key={activeConversation.id}
                        conversation={activeConversation}
                        onBack={() => { setActiveId(null); setMobileView("inbox"); }}
                        pinnedListing={pinnedListing}
                    />
                ) : (
                    <EmptyState />
                )}
            </div>

            {/* RIGHT: Sidebar — desktop xl+ only, when thread is open */}
            {activeConversation && (
                <div className="hidden xl:flex w-64 flex-col shrink-0">
                    <ChatSidebar conversation={activeConversation} />
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquareText className="w-8 h-8 text-primary" />
            </div>
            <div>
                <p className="text-base font-black text-foreground">Your messages</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Select a conversation, or tap "Chat with Seller" on any listing.
                </p>
            </div>
        </div>
    );
}
