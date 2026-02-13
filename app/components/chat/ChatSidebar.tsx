"use client";

import { useState, useEffect } from "react";
import { Search, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";

// Mock Data
interface ChatPreview {
    id: string;
    partnerName: string;
    partnerAvatar?: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isOnline: boolean;
    productContext: string;
}

const mockChats: ChatPreview[] = [
    {
        id: "1",
        partnerName: "Sarah Johnson",
        partnerAvatar: "",
        lastMessage: "Is the textbook still available? I'm interested in purchasing it for next semester.",
        timestamp: "2m ago",
        unreadCount: 1,
        isOnline: true,
        productContext: "Biology 101 Textbook"
    },
    {
        id: "2",
        partnerName: "Michael Chen",
        partnerAvatar: "",
        lastMessage: "Thanks for getting back to me. Can we meet on campus tomorrow?",
        timestamp: "1h ago",
        unreadCount: 0,
        isOnline: false,
        productContext: "Desk Lamp"
    },
    {
        id: "3",
        partnerName: "Emily Rodriguez",
        partnerAvatar: "",
        lastMessage: "Perfect! I'll take it. When can I pick it up?",
        timestamp: "3h ago",
        unreadCount: 0,
        isOnline: true,
        productContext: "Mini Fridge"
    },
    {
        id: "4",
        partnerName: "David Park",
        partnerAvatar: "",
        lastMessage: "Do you have any more photos of the bike?",
        timestamp: "5h ago",
        unreadCount: 0,
        isOnline: false,
        productContext: "Mountain Bike"
    }
];

export function ChatSidebar() {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);


    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredChats = mockChats.filter(chat =>
        chat.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.productContext.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-card text-foreground">
            {/* Header */}
            <div className="p-5 border-border border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Inbox</h2>
                <button
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
                    aria-label="Toggle Theme"
                >
                    {mounted && resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:border-accent transition-all placeholder:text-muted-foreground"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col divide-y divide-border">
                    {filteredChats.map((chat) => {
                        const isActive = pathname === `/inbox/${chat.id}`;
                        return (
                            <Link
                                key={chat.id}
                                href={`/inbox/${chat.id}`}
                                className={`
                                    flex items-start gap-4 p-4 hover:bg-secondary transition-colors group
                                    ${isActive ? "bg-accent/10 border-l-4 border-accent -ml-[4px]" : "border-l-4 border-transparent -ml-[4px]"}
                                `}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                                        {chat.partnerAvatar ? (
                                            <img src={chat.partnerAvatar} alt={chat.partnerName} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            chat.partnerName.charAt(0)
                                        )}
                                    </div>
                                    {chat.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`font-bold text-sm truncate ${isActive ? 'text-accent' : 'text-foreground'}`}>
                                            {chat.partnerName}
                                        </h3>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {chat.timestamp}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1.5 leading-relaxed">
                                        {chat.lastMessage}
                                    </p>

                                    <p className="text-xs text-muted-foreground font-medium truncate">
                                        {chat.productContext}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
