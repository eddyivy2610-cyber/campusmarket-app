"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MoreVertical, Flag, Ban, Trash2, ExternalLink, Settings, Headset } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatParticipant } from "../../data/chat";

interface ChatHeaderProps {
    participant: ChatParticipant;
    onBack: () => void;
}

export function ChatHeader({ participant, onBack }: ChatHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    return (
        <div className="shrink-0 bg-white dark:bg-card border-b border-border/30 px-6 py-4 flex items-center justify-between z-10 w-full">
            {/* Left Box */}
            <div className="flex items-center gap-4">
                {/* Back — mobile only */}
                <button
                    onClick={onBack}
                    className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground md:hidden"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Avatar + Info */}
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${participant.id}`} className="w-10 h-10 rounded-full bg-secondary overflow-hidden relative shrink-0">
                        {participant.avatar
                            ? <Image src={participant.avatar} alt={participant.name} fill className="object-cover" />
                            : <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">{participant.name.charAt(0)}</span>
                        }
                    </Link>
                    <div className="flex flex-col">
                        <Link href={`/profile/${participant.id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate">
                            {participant.name}
                        </Link>
                        <p className="text-[12px] font-medium text-muted-foreground/80 mt-0.5">
                            Reply to message
                        </p>
                    </div>
                </div>
            </div>

            {/* 3-dot overflow menu */}
            <div ref={menuRef} className="relative shrink-0">
                <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="p-1 hover:bg-secondary rounded-lg transition-colors text-muted-foreground/70"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -6 }}
                            className="absolute right-0 top-full mt-1 bg-card border border-border/50 rounded-xl shadow-xl z-50 w-48 overflow-hidden"
                        >
                            {[
                                { icon: <ExternalLink className="w-3.5 h-3.5" />, label: "View Profile", href: `/profile/${participant.id}` },
                                { icon: <Settings className="w-3.5 h-3.5" />, label: "Settings", href: "/dashboard/settings" },
                                { icon: <Headset className="w-3.5 h-3.5" />, label: "Help Center", href: "/help-support" },
                                { icon: <Ban className="w-3.5 h-3.5" />, label: "Block User", danger: true },
                                { icon: <Flag className="w-3.5 h-3.5" />, label: "Report Conversation", danger: true },
                                { icon: <Trash2 className="w-3.5 h-3.5" />, label: "Clear Chat History", danger: true },
                            ].map((item) => {
                                const btnClass = `flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-bold hover:bg-secondary/50 transition-colors ${item.danger ? "text-red-500" : "text-foreground"}`;
                                return item.href ? (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className={btnClass}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ) : (
                                    <button
                                        key={item.label}
                                        onClick={() => setMenuOpen(false)}
                                        className={btnClass}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
