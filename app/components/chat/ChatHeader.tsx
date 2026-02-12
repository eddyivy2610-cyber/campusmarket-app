"use client";

import Image from "next/image";
import { ArrowLeft, MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
    listing: {
        id: string;
        title: string;
        price: string;
        image: string;
        status?: string;
    };
    otherUser: {
        name: string;
        avatar?: string;
        isOnline?: boolean;
    };
}

export function ChatHeader({ listing, otherUser }: ChatHeaderProps) {
    const router = useRouter();

    return (
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
            {/* User Bar */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
                                {otherUser.avatar ? (
                                    <Image src={otherUser.avatar} alt={otherUser.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {otherUser.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {otherUser.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background"></div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-foreground leading-tight">{otherUser.name}</h2>
                            <p className="text-[10px] text-gray-500 font-medium">Last seen recently</p>
                        </div>
                    </div>
                </div>

                <button className="p-2 hover:bg-secondary rounded-full transition-colors text-gray-500">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Listing Context */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-3 p-2 bg-secondary rounded-xl border border-black/5 dark:border-white/5">
                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden relative shrink-0">
                        <Image src={listing.image} alt={listing.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-foreground truncate">{listing.title}</h3>
                        <p className="text-sm font-black text-primary">₦{listing.price}</p>
                    </div>
                    <Link href={`/explore`} className="p-2 bg-background border border-black/5 rounded-lg text-xs font-bold text-foreground hover:bg-gray-50 transition-colors flex items-center gap-1">
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
