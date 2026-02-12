"use client";

import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";

export interface MessageProps {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
    isMe: boolean;
    type?: 'text' | 'image' | 'offer';
    offer?: {
        price: string;
        status: 'pending' | 'accepted' | 'declined';
    };
}

export function MessageBubble({ message }: { message: MessageProps }) {
    const isMe = message.isMe;

    return (
        <div className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>

                {/* Bubble */}
                <div
                    className={`
                        px-4 py-3 rounded-2xl relative shadow-sm text-sm font-medium leading-relaxed
                        ${isMe
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-secondary text-foreground rounded-tl-none border border-black/5 dark:border-white/5'
                        }
                    `}
                >
                    {message.type === 'offer' ? (
                        <div className="min-w-[200px]">
                            <p className="text-xs opacity-80 mb-1 uppercase tracking-wider font-bold">Offer Made</p>
                            <p className="text-2xl font-black mb-3">₦{message.offer?.price}</p>
                            {message.offer?.status === 'pending' && (
                                <div className="flex gap-2">
                                    {isMe ? (
                                        <div className="w-full py-1.5 bg-white/20 rounded text-center text-xs font-bold">
                                            Waiting/Pending
                                        </div>
                                    ) : (
                                        <>
                                            <button className="flex-1 py-1.5 bg-white text-primary rounded-lg font-bold text-xs shadow-sm hover:bg-gray-50 transition-colors">
                                                Accept
                                            </button>
                                            <button className="flex-1 py-1.5 bg-black/10 text-white rounded-lg font-bold text-xs hover:bg-black/20 transition-colors">
                                                Decline
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                            {message.offer?.status === 'accepted' && (
                                <div className="w-full py-1.5 bg-emerald-500/20 rounded text-center text-xs font-bold border border-emerald-500/30 text-emerald-100">
                                    Offer Accepted
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>{message.content}</p>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-gray-400 font-medium">
                        {format(message.timestamp, 'HH:mm')}
                    </span>
                    {isMe && (
                        <span className={message.status === 'read' ? 'text-blue-500' : 'text-gray-400'}>
                            {message.status === 'read' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
