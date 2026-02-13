"use client";

import Image from "next/image";

interface ChatListingBannerProps {
    listing: {
        id: string;
        title: string;
        price: string;
        image: string;
        condition?: string;
    };
}

export function ChatListingBanner({ listing }: ChatListingBannerProps) {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-0 mb-6">
            <div className="bg-secondary border-border border-b rounded-xl p-3 flex items-center gap-4 shadow-sm">
                {/* Product Image */}
                <div className="w-12 h-12 bg-card rounded-lg overflow-hidden relative border-border border shrink-0">
                    <Image src={listing.image} alt={listing.title} fill className="object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground truncate">{listing.title}</h3>
                    <p className="font-black text-base text-primary">₦{listing.price}</p>
                </div>

                {/* View Button */}
                <div className="shrink-0">
                    <button className="px-4 py-2 bg-card hover:bg-background text-xs font-bold text-foreground rounded-lg transition-colors border border-border">
                        View
                    </button>
                </div>
            </div>
        </div>
    );
}
