"use client";

import { useState } from "react";
import { ChatHeader } from "../../components/chat/ChatHeader";
import { MessageBubble, MessageProps } from "../../components/chat/MessageBubble";
import { ChatInput } from "../../components/chat/ChatInput";

export default function ChatPage({ params }: { params: { id: string } }) {
    // Mock Data
    const mockListing = {
        id: "1",
        title: "Apple MacBook Pro M1 2020",
        price: "450,000",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
    };

    const mockUser = {
        name: "David O.",
        isOnline: true,
        // avatar: "..." // Optional
    };

    const [messages, setMessages] = useState<MessageProps[]>([
        {
            id: "1",
            content: "Hi! Is this MacBook still available?",
            senderId: "me",
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            status: 'read',
            isMe: true,
            type: 'text'
        },
        {
            id: "2",
            content: "Yes, it is! Are you on campus right now?",
            senderId: "other",
            timestamp: new Date(Date.now() - 3500000),
            status: 'read',
            isMe: false,
            type: 'text'
        },
        {
            id: "3",
            content: "I'm at the Engineering faculty. Can I see it?",
            senderId: "me",
            timestamp: new Date(Date.now() - 3400000),
            status: 'read',
            isMe: true,
            type: 'text'
        },
        {
            id: "4",
            content: "Sure. I can meet you at the Faculty lounge in 30 mins.",
            senderId: "other",
            timestamp: new Date(Date.now() - 3300000),
            status: 'read',
            isMe: false,
            type: 'text'
        },
        {
            id: "5",
            content: "",
            senderId: "me",
            timestamp: new Date(Date.now() - 3000000),
            status: 'sent',
            isMe: true,
            type: 'offer',
            offer: {
                price: "430,000",
                status: 'pending'
            }
        }
    ]);

    const handleSendMessage = (text: string) => {
        const newMessage: MessageProps = {
            id: Date.now().toString(),
            content: text,
            senderId: "me",
            timestamp: new Date(),
            status: 'sent',
            isMe: true,
            type: 'text'
        };
        setMessages((prev) => [...prev, newMessage]);

        // Simulate reply (optional)
        // setTimeout(...) 
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <ChatHeader listing={mockListing} otherUser={mockUser} />

            <div className="flex-1 px-4 py-6 pb-32 overflow-y-auto">
                <div className="bg-secondary/30 rounded-xl p-3 text-center mb-6 max-w-sm mx-auto">
                    <p className="text-xs text-gray-500 font-medium">Safe Trading Tips</p>
                    <p className="text-[10px] text-gray-400 mt-1">Meet in public places. Do not pay before inspection.</p>
                </div>

                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>

            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
}
