"use client";

import { useState, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatListingBanner } from "./ChatListingBanner";
import { MessageBubble, MessageProps } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ChatInterfaceProps {
    chatId: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
    // Mock Data 
    const mockListing = {
        id: "1",
        title: "Apple MacBook Pro M1 2020",
        price: "450,000",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
    };

    const mockUser = {
        name: chatId === "1" ? "David O." : "Chat Partner", 
        isOnline: true,
    };

    const [messages, setMessages] = useState<MessageProps[]>([
        {
            id: "1",
            content: "Hi! Is this MacBook still available?",
            senderId: "me",
            timestamp: new Date(Date.now() - 3600000),
            status: 'read',
            isMe: true,
            senderName: "Me"
        },
        {
            id: "2",
            content: "Yes, it is! Are you on campus right now?",
            senderId: "other",
            timestamp: new Date(Date.now() - 3500000),
            status: 'read',
            isMe: false,
            senderName: "David O."
        },
        {
            id: "3",
            content: "I'm at the Engineering faculty. Can I see it?",
            senderId: "me",
            timestamp: new Date(Date.now() - 3400000),
            status: 'read',
            isMe: true,
            senderName: "Me"
        },
        {
            id: "4",
            content: "Sure. I can meet you at the Faculty lounge in 30 mins.",
            senderId: "other",
            timestamp: new Date(Date.now() - 3300000),
            status: 'read',
            isMe: false,
            senderName: "David O."
        },
    ]);

    const handleSendMessage = (text: string) => {
        const newMessage: MessageProps = {
            id: Date.now().toString(),
            content: text,
            senderId: "me",
            timestamp: new Date(),
            status: 'sent',
            isMe: true,
            senderName: "Me"
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    return (
        <div className="flex flex-col h-full bg-card relative overflow-hidden">
            <div className="shrink-0">
                <ChatHeader otherUser={mockUser} />
            </div>

            <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto scroll-smooth">
                <ChatListingBanner listing={mockListing} />

                <div className="space-y-2 mt-6">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                </div>
            </div>

            <div className="shrink-0 z-20 bg-card">
                <ChatInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}
