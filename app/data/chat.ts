// ── Types ──────────────────────────────────────────────────────────────────
export interface ChatParticipant {
    id: string;
    name: string;
    avatar: string;
    memberSince: string;
    responseTime: string;
    activeListings: number;
    completedSales: number;
}

export interface ChatListing {
    id: number;
    title: string;
    price: number;
    image: string;
    status: "available" | "sold";
}

export type MessageType = "text" | "listing-card" | "system";

export interface Message {
    id: string;
    senderId: string; // "me", participant id, or "system"
    type: MessageType;
    text?: string;
    listing?: ChatListing;
    timestamp: string;
    read: boolean;
}

export type NegotiationStatus = "active" | "completed" | "ended";

export interface NegotiationRecord {
    id: string;
    listing: ChatListing;
    status: NegotiationStatus;
    startedAt: string;
    endedAt?: string;
    agreedPrice?: number;
}

export interface Conversation {
    id: string;
    participant: ChatParticipant;
    listing?: ChatListing;          // pinned listing context (if any)
    messages: Message[];
    lastMessage: string;
    lastTime: string;
    unread: number;
    negotiations?: NegotiationRecord[];
}

// ── Mock participants ───────────────────────────────────────────────────────
export const PARTICIPANTS: Record<string, ChatParticipant> = {
    john: {
        id: "john",
        name: "John Doe",
        avatar: "https://i.pravatar.cc/80?img=11",
        memberSince: "Jan 2025",
        responseTime: "Within 1 hour",
        activeListings: 12,
        completedSales: 45,
    },
    sarah: {
        id: "sarah",
        name: "Sarah Smith",
        avatar: "https://i.pravatar.cc/80?img=5",
        memberSince: "Sep 2024",
        responseTime: "Within 30 min",
        activeListings: 8,
        completedSales: 23,
    },
    bot: {
        id: "bot",
        name: "Campus Market Bot",
        avatar: "",
        memberSince: "Always",
        responseTime: "Instant",
        activeListings: 0,
        completedSales: 0,
    },
    michael: {
        id: "michael",
        name: "Michael Chen",
        avatar: "https://i.pravatar.cc/80?img=33",
        memberSince: "Feb 2025",
        responseTime: "Within 2 hours",
        activeListings: 5,
        completedSales: 10,
    },
    emily: {
        id: "emily",
        name: "Emily Johnson",
        avatar: "https://i.pravatar.cc/80?img=47",
        memberSince: "Oct 2024",
        responseTime: "Within 1 hour",
        activeListings: 3,
        completedSales: 17,
    },
    S1: {
        id: "S1",
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        memberSince: "Jan 2024",
        responseTime: "Within 1 hour",
        activeListings: 12,
        completedSales: 50,
    },
    S2: {
        id: "S2",
        name: "Vintage Treasures",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
        memberSince: "Mar 2024",
        responseTime: "Within 30 min",
        activeListings: 8,
        completedSales: 24,
    },
};

// ── Mock listings ───────────────────────────────────────────────────────────
export const CHAT_LISTINGS: Record<number, ChatListing> = {
    1: {
        id: 1,
        title: "MacBook Pro 2021 - M1 Pro",
        price: 450000,
        image: "https://images.unsplash.com/photo-1517336715481-d1ad7eaf1c9c?auto=format&fit=crop&w=400&q=80",
        status: "available",
    },
    2: {
        id: 2,
        title: "Vintage Denim Jacket",
        price: 15000,
        image: "https://images.unsplash.com/photo-1544441892-794166f1e3be?auto=format&fit=crop&w=800&q=80",
        status: "available",
    },
    3: {
        id: 3,
        title: "Apple iPad Air 4th Gen",
        price: 350000,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
        status: "sold",
    },
};

// ── Mock conversations ──────────────────────────────────────────────────────
export const CONVERSATIONS: Conversation[] = [
    {
        id: "c1",
        participant: PARTICIPANTS.john,
        listing: CHAT_LISTINGS[1],
        lastMessage: "Is this MacBook still available?",
        lastTime: "2:30 PM",
        unread: 2,
        negotiations: [
            {
                id: "n1",
                listing: CHAT_LISTINGS[1],
                status: "active",
                startedAt: "Today",
            },
        ],
        messages: [
            { id: "m0", senderId: "system", type: "system", text: "🤝 You started a negotiation for MacBook Pro 2020 (₦450,000). Ending a negotiation requires both parties to agree.", timestamp: "2:27 PM", read: true },
            { id: "m1", senderId: "john", type: "text", text: "Hi! Is this MacBook still available?", timestamp: "2:28 PM", read: true },
            { id: "m2", senderId: "me", type: "text", text: "Yes, it's still available! Would you like to know more details?", timestamp: "2:29 PM", read: true },
            { id: "m3", senderId: "john", type: "text", text: "Is this still available?", timestamp: "2:30 PM", read: true },
            { id: "m4", senderId: "me", type: "text", text: "Yes! It has 16GB RAM and 512GB SSD. Battery health is 89%.", timestamp: "2:31 PM", read: true },
            { id: "m5", senderId: "john", type: "text", text: "Great! Can we meet on campus tomorrow?", timestamp: "2:33 PM", read: false },
        ],
    },
    {
        id: "c2",
        participant: PARTICIPANTS.sarah,
        listing: CHAT_LISTINGS[2],
        lastMessage: "Thanks for the quick response!",
        lastTime: "Yesterday",
        unread: 0,
        negotiations: [
            {
                id: "n2",
                listing: CHAT_LISTINGS[2],
                status: "completed",
                startedAt: "Yesterday",
                endedAt: "Yesterday",
                agreedPrice: 300000,
            },
            {
                id: "n3",
                listing: CHAT_LISTINGS[3],
                status: "ended",
                startedAt: "Mar 12",
                endedAt: "Mar 14",
            },
        ],
        messages: [
            { id: "m6", senderId: "system", type: "system", text: "🤝 You started a negotiation for iPhone 12 (₦320,000). Ending a negotiation requires both parties to agree.", timestamp: "Yesterday 4:05 PM", read: true },
            { id: "m7", senderId: "sarah", type: "text", text: "Hi, is the iPhone 12 still for sale?", timestamp: "Yesterday 4:10 PM", read: true },
            { id: "m8", senderId: "me", type: "text", text: "Yes it is! In perfect condition.", timestamp: "Yesterday 4:15 PM", read: true },
            { id: "m9", senderId: "sarah", type: "text", text: "Thanks for the quick response!", timestamp: "Yesterday 4:20 PM", read: true },
            { id: "m10", senderId: "system", type: "system", text: "✅ Negotiation completed. Both parties agreed on ₦300,000. Please rate your experience.", timestamp: "Yesterday 4:35 PM", read: true },
        ],
    },
    {
        id: "c3",
        participant: PARTICIPANTS.bot,
        lastMessage: "Welcome! Remember to keep chats...",
        lastTime: "Mar 10",
        unread: 0,
        messages: [
            { id: "m11", senderId: "bot", type: "text", text: "Welcome to Campus Market! Remember to keep all conversations on this platform. Never share phone numbers or bank details. Stay safe! 🔒", timestamp: "Mar 10", read: true },
        ],
    },
    {
        id: "c4",
        participant: PARTICIPANTS.michael,
        lastMessage: "Can we meet on campus?",
        lastTime: "Mar 8",
        unread: 1,
        negotiations: [
            {
                id: "n4",
                listing: CHAT_LISTINGS[1],
                status: "ended",
                startedAt: "Mar 8",
                endedAt: "Mar 8",
            },
        ],
        messages: [
            { id: "m12", senderId: "michael", type: "text", text: "Hey, I saw your listing. Can we meet on campus?", timestamp: "Mar 8", read: true },
        ],
    },
    {
        id: "c5",
        participant: PARTICIPANTS.emily,
        lastMessage: "Perfect condition!",
        lastTime: "Mar 5",
        unread: 0,
        messages: [
            { id: "m13", senderId: "me", type: "text", text: "Hey, is this in good condition?", timestamp: "Mar 5", read: true },
            { id: "m14", senderId: "emily", type: "text", text: "Perfect condition!", timestamp: "Mar 5", read: true },
        ],
    },
];
