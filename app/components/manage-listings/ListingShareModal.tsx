import { Product } from "../../data/products";
import { X, Copy as CopyIcon, Download, Share2 } from "lucide-react";
import Image from "next/image";

interface ListingShareModalProps {
    listing: Product;
    onClose: () => void;
}

export function ListingShareModal({ listing, onClose }: ListingShareModalProps) {
    const isSold = listing.id === 2; // Matching the demo logic from ListingRow
    const statusText = isSold ? "Sold Out" : "Available Now";
    const statusColor = isSold ? "bg-amber-500 text-amber-950" : "bg-emerald-400 text-emerald-950";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="bg-background border border-border/50 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center p-6">

                {/* Header Actions */}
                <div className="w-full flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" />
                        Share Listing
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* The "Import Card" to be shared */}
                <div className="w-full bg-gradient-to-b from-secondary/50 to-background border border-border/50 rounded-2xl overflow-hidden shadow-inner relative group">
                    {/* Brand Banner */}
                    <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-border/50 shadow-sm">
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-[8px] font-bold text-primary-foreground">CM</span>
                        </div>
                        <span className="text-xs font-semibold tracking-tight">Campus Market</span>
                    </div>

                    {/* Product Image */}
                    <div className="w-full aspect-square relative bg-secondary/30">
                        <Image
                            src={listing.image}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        {/* Status Badge Overlaid */}
                        <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-lg ${statusColor}`}>
                            {statusText}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-5 flex flex-col gap-2">
                        <h2 className="font-medium text-lg leading-tight line-clamp-2">{listing.title}</h2>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-bold font-heading tracking-tight text-primary">
                                ₦{listing.price.toLocaleString()}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                {listing.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Share Actions */}
                <div className="w-full grid grid-cols-2 gap-3 mt-6">
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border/50 hover:bg-secondary transition-colors font-medium text-sm text-foreground">
                        <CopyIcon className="w-4 h-4" />
                        Copy Link
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:brightness-110 active:scale-95 transition-all font-medium text-sm text-primary-foreground shadow-md shadow-primary/20">
                        <Download className="w-4 h-4" />
                        Save Image
                    </button>
                </div>

            </div>
        </div>
    );
}
