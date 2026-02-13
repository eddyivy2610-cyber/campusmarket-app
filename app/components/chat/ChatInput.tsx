"use client";

import { Plus, Image as ImageIcon, Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const quickActions = [
        "Is this available?",
        "Can you reduce price?",
        "Where can we meet?",
        "I'm interested"
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage("");
        }
    };

    const handleQuickAction = (action: string) => {
        onSendMessage(action);
    };

    return (
        <div className="p-4 bg-card border-t border-gray-200 dark:border-white/10">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Quick Actions */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickAction(action)}
                            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-full text-xs font-medium text-foreground whitespace-nowrap transition-colors border border-transparent hover:border-border"
                        >
                            {action}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="flex items-end gap-3">
                    {/* Add Button */}
                    <button type="button" className="shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                        <Plus className="w-5 h-5" />
                    </button>

                    {/* Input Field */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-secondary border-none rounded-full py-3 pl-5 pr-12 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                            <ImageIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="shrink-0 w-10 h-10 rounded-full bg-primary hover:bg-orange-600 flex items-center justify-center text-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
