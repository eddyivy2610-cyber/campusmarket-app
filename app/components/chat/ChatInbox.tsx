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
    return (
        <div className="flex flex-col min-h-0 h-full">
            {/* Conversation list — only this scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
                {conversations.length > 0 ? (
                    conversations.map(conv => (
                        <ConversationRow
                            key={conv.id}
                            conv={conv}
                            active={conv.id === activeId}
                            onSelect={() => onSelect(conv.id)}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No conversations found
                    </div>
                )}
            </div>
        </div>
    );
}

function ConversationRow({ conv, active, onSelect }: { conv: Conversation; active: boolean; onSelect: () => void }) {
    return (
        <button
            onClick={onSelect}
            className={`w-full flex items-center gap-3.5 px-5 py-3.5 border-b border-transparent hover:bg-secondary/30 transition-colors text-left ${active ? "bg-[#f3f6fc] dark:bg-secondary/50 rounded-lg mx-2 w-[calc(100%-16px)]" : ""}`}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-sm font-bold text-primary relative ring-2 ring-white dark:ring-card">
                    {conv.participant.avatar
                        ? <Image src={conv.participant.avatar} alt={conv.participant.name} fill className="object-cover" />
                        : <span>{conv.participant.name.charAt(0)}</span>
                    }
                </div>
                {/* Online indicator (simulated for template) */}
                <div className="absolute bottom-0.5 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-card" />
                
                {conv.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-card">
                        {conv.unread}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                    <p className={`text-[13px] font-bold truncate ${active || conv.unread > 0 ? "text-foreground" : "text-foreground/80"}`}>
                        {conv.participant.name}
                    </p>
                    <span className="text-[10px] font-medium text-muted-foreground/60 whitespace-nowrap ml-2 shrink-0">{conv.lastTime}</span>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground/80 truncate">{conv.lastMessage}</p>
            </div>
        </button>
    );
}
