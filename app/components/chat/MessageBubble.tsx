"use client";

import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

export interface MessageProps {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
    isMe: boolean;
    senderAvatar?: string;
    senderName?: string;
}

export function MessageBubble({ message }: { message: MessageProps }) {
    const isMe = message.isMe;

    return (
        <div className={`flex w-full mb-6 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar */}
                <div className="shrink-0 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-500">
                        {message.senderAvatar ? (
                            <Image src={message.senderAvatar} alt="Avatar" width={32} height={32} className="object-cover" />
                        ) : (
                            <span>{message.senderName?.charAt(0) || "?"}</span>
                        )}
                    </div>
                </div>

                {/* Bubble & Time */}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                        className={`
                            px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                            ${isMe
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-secondary text-foreground rounded-bl-none'
                            }
                        `}
                    >
                        {message.content}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[11px] text-gray-400 mt-1 font-medium px-1">
                        {format(message.timestamp, 'h:mm a')}
                    </span>
                </div>
            </div>
        </div>
    );
}
