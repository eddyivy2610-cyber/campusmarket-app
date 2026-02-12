"use client";

import { Send, Image as ImageIcon, Plus } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
    onSendMessage: (text: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const quickActions = [
        "Is this available?",
        "Can you reduce price?",
        "Where can we meet?",
        "I'm interested"
    ];

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage("");
        }
    };

    const handleQuickAction = (action: string) => {
        onSendMessage(action);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-black/5 dark:border-white/5 pb-safe z-30">
            <div className="max-w-7xl mx-auto">

                {/* Quick Actions Row */}
                <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 no-scrollbar mask-gradient-right">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickAction(action)}
                            className="shrink-0 px-3 py-1.5 bg-secondary hover:bg-primary/10 hover:text-primary rounded-full text-xs font-bold text-gray-600 transition-colors border border-black/5 whitespace-nowrap active:scale-95"
                        >
                            {action}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="px-4 pb-4 pt-1 flex items-center gap-3">
                    <button type="button" className="p-2.5 rounded-full bg-secondary text-gray-500 hover:text-foreground hover:bg-secondary/80 transition-colors">
                        <Plus className="w-5 h-5" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-secondary rounded-2xl py-3 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground">
                            <ImageIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="p-3 bg-primary text-white rounded-full shadow-lg shadow-primary/25 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
