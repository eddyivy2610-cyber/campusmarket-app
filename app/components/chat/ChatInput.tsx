"use client";

import { useState } from "react";
import { Send, Smile, Paperclip, Tag } from "lucide-react";
import { ListingShareDrawer } from "./ListingShareDrawer";
import { ChatListing } from "../../data/chat";

interface ChatInputProps {
    onSend: (text: string) => void;
    onShareListing: (listing: ChatListing) => void;
    isBuyer?: boolean;
}

export function ChatInput({ onSend, onShareListing, isBuyer = false }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [shareOpen, setShareOpen] = useState(false);

    const handleSend = () => {
        const messageText = input.trim();
        if (!messageText) return;
        onSend(messageText);
        setInput("");
    };

    return (
        <div className="w-full bg-white dark:bg-card px-4 md:px-6 py-3 md:py-4 border-t border-border/30">
            <div className="flex items-center gap-2 md:gap-3 bg-[#f3f6fc] dark:bg-secondary/40 border-0 rounded-2xl md:rounded-[18px] pl-4 pr-1 md:py-2.5 py-1.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                {/* Text field */}
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Type..."
                    className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/60 transition-colors"
                />

                {/* Right side icons & send button */}
                <div className="flex items-center gap-0 md:gap-1.5 shrink-0">
                    <button className="p-1.5 md:p-1.5 text-muted-foreground/70 hover:text-foreground transition-colors rounded-lg">
                        <Paperclip className="w-[18px] h-[18px] md:w-5 md:h-5" />
                    </button>
                    <button className="p-1.5 md:p-1.5 text-muted-foreground/70 hover:text-foreground transition-colors rounded-lg hidden sm:block">
                        <Smile className="w-[18px] h-[18px] md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={() => setShareOpen(true)}
                        className="p-1.5 md:p-1.5 text-muted-foreground/70 hover:text-foreground transition-colors rounded-lg mr-0 md:mr-1"
                        title="Share a listing"
                    >
                        <Tag className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" />
                    </button>

                    {/* Send */}
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className="w-8 h-8 md:w-10 md:h-10 bg-[#4154F1] text-white rounded-[10px] md:rounded-xl flex items-center justify-center hover:bg-[#3444c1] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md ml-1"
                    >
                        <Send className="w-3.5 h-3.5 md:w-4 md:h-4 ml-0.5" />
                    </button>
                </div>
            </div>

            <ListingShareDrawer
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                onSelect={(listing) => { onShareListing(listing); setShareOpen(false); }}
            />
        </div>
    );
}
