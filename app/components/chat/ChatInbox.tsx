"use client";

import { useState } from "react";
import { Search, Edit, Bell } from "lucide-react";
import Image from "next/image";
import { Conversation } from "../../data/chat";

interface ChatInboxProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
}

export function ChatInbox({ conversations, activeId, onSelect }: ChatInboxProps) {
    const [query, setQuery] = useState("");

    const filtered = conversations.filter(c =>
        c.participant.name.toLowerCase().includes(query.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-0 h-full bg-card border-r border-border/40">
            {/* Header */}
            <div className="px-4 pt-5 pb-3 border-b border-border/40">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-base font-bold font-heading text-foreground">Messages</h1>
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                            <Bell className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary">
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-secondary/40 border border-border/40 rounded-xl text-xs outline-none focus:border-primary/40 transition-all"
                    />
                </div>
            </div>

            {/* Conversation list — only this scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
                {filtered.map(conv => (
                    <ConversationRow
                        key={conv.id}
                        conv={conv}
                        active={conv.id === activeId}
                        onSelect={() => onSelect(conv.id)}
                    />
                ))}
            </div>
        </div>
    );
}

function ConversationRow({ conv, active, onSelect }: { conv: Conversation; active: boolean; onSelect: () => void }) {
    const isBot = conv.participant.id === "bot";

    return (
        <button
            onClick={onSelect}
            className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-border/30 hover:bg-secondary/30 transition-colors text-left ${active ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-sm font-bold text-primary relative">
                    {conv.participant.avatar
                        ? <Image src={conv.participant.avatar} alt={conv.participant.name} fill className="object-cover" />
                        : <span>{conv.participant.name.charAt(0)}</span>
                    }
                </div>
                {conv.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-xs font-bold truncate ${conv.unread > 0 ? "text-foreground" : "text-foreground/80"}`}>
                        {conv.participant.name}
                    </p>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2 shrink-0">{conv.lastTime}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{conv.lastMessage}</p>
                {/* Listing thumbnail */}
                {conv.listing && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-8 h-6 rounded overflow-hidden relative bg-secondary shrink-0">
                            <Image src={conv.listing.image} alt={conv.listing.title} fill className="object-cover" />
                        </div>
                        <span className="text-[9px] text-muted-foreground truncate">{conv.listing.title} · ₦{conv.listing.price.toLocaleString()}</span>
                    </div>
                )}
            </div>
        </button>
    );
}
