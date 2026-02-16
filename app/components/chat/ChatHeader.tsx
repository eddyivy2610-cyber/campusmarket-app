"use client";

import Image from "next/image";
import { ArrowLeft, MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

interface ChatHeaderProps {
    otherUser: {
        name: string;
        avatar?: string;
        isOnline?: boolean;
    };
}

export function ChatHeader({ otherUser }: ChatHeaderProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsMenuOpen(false));

    return (
        <div className="h-16 border-border dark:border-white/10 border-b bg-card flex items-center justify-between px-6 shrink-0">
            {/* Left: User Info */}
            <div className="flex items-center gap-4">
                {/* Back Button (Always visible now since no global header) */}
                <Link href="/inbox" className="p-2 -ml-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors md:hidden">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                {/* Desktop Back Button (Optional, but user asked for "back button to take us to previous page") */}
                <button onClick={() => router.back()} className="hidden md:flex p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors mr-2" title="Go Back">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-sm font-bold text-muted-foreground">
                            {otherUser.avatar ? (
                                <Image src={otherUser.avatar} alt={otherUser.name} fill className="object-cover" />
                            ) : (
                                otherUser.name.charAt(0)
                            )}
                        </div>
                        {otherUser.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-foreground leading-tight">{otherUser.name}</h2>
                        <p className="text-xs text-green-600 font-medium">Active 2m ago</p>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <Link
                    href="/listings"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-card border-gray-200 dark:border-white/10 border rounded-lg text-sm font-bold text-foreground hover:bg-secondary transition-colors"
                >
                    <span>View Listing</span>
                </Link>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors border border-border"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                            <Link href="/listings" className="block sm:hidden w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-foreground">
                                View Listing
                            </Link>
                            <button className="block w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-foreground">
                                Report User
                            </button>
                            <button className="block w-full text-left px-4 py-3 text-sm font-medium hover:bg-red-50 dark:hover:bg-trace-red/10 text-red-500 transition-colors">
                                Block User
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
