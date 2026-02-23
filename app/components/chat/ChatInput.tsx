"use client";

import { useState } from "react";
import { Send, Smile, Paperclip, Tag } from "lucide-react";
import { ListingShareDrawer } from "./ListingShareDrawer";
import { ChatListing } from "../../data/chat";

interface ChatInputProps {
    onSend: (text: string) => void;
    onShareListing: (listing: ChatListing) => void;
}

export function ChatInput({ onSend, onShareListing }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [shareOpen, setShareOpen] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(input.trim());
        setInput("");
    };

    return (
        <>
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
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 bg-secondary/40 border border-border/40 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all font-body"
                    />

                    {/* Send */}
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="w-9 h-9 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <ListingShareDrawer
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                onSelect={(listing) => { onShareListing(listing); setShareOpen(false); }}
            />
        </>
    );
}
