"use client";

import React, { useState } from "react";
import { 
    X, 
    Package, 
    User, 
    Clock, 
    Tag, 
    CheckCircle, 
    AlertTriangle, 
    Flag, 
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Star,
    Info,
    History,
    ShieldAlert,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ListingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: any;
    onApprove?: (id: string) => void;
    onReject?: (id: string, reason: string, notes: string) => void;
}

const REJECTION_REASONS = [
    "Inappropriate content / imagery",
    "Counterfeit or prohibited item",
    "Missing required specifications",
    "Duplicate listing",
    "Suspected scam / Fraudulent",
    "Wrong category",
    "Other"
];

export default function AdminListingDetailModal({ isOpen, onClose, listing, onApprove, onReject }: ListingDetailModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [rejectionReason, setRejectionReason] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [activeTab, setActiveTab] = useState("details");

    if (!listing) return null;

    // Mock images if none provided
    const images = listing.images || [
        "https://images.unsplash.com/photo-1517336712468-678082986230?w=800&q=80",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80"
    ];

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Left Side: Images */}
                        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-black/5 relative group border-b md:border-b-0 md:border-r border-border/50 shrink-0">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img 
                                    src={images[currentImageIndex]} 
                                    alt={listing.title} 
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Carousel Controls */}
                            {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                    
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                                        {images.map((_img: string, i: number) => (
                                            <div 
                                                key={i} 
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full transition-all",
                                                    i === currentImageIndex ? "bg-white w-4" : "bg-white/40"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Badges on Image */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                                    {listing.category}
                                </span>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest shadow-lg",
                                    listing.status === "Pending" ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                                )}>
                                    {listing.status}
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Details & Actions */}
                        <div className="w-full md:w-1/2 flex flex-col h-full overflow-hidden bg-card">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-border/50 flex items-start justify-between bg-muted/20">
                                <div className="space-y-1 pr-8">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                        <Package size={12} />
                                        Listing ID: LST-28492-AX
                                    </div>
                                    <h2 className="text-xl font-bold font-heading text-foreground leading-tight">{listing.title}</h2>
                                    <div className="text-lg font-bold text-primary self-start">₦{listing.price?.toLocaleString()}</div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-border/50 bg-muted/10 px-6 overflow-x-auto no-scrollbar">
                                {[
                                    { id: "details", label: "Listing Details", icon: Info },
                                    { id: "vendor", label: "Vendor History", icon: History },
                                    { id: "actions", label: "Admin Actions", icon: ShieldAlert },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex items-center gap-2 py-4 px-3 border-b-2 transition-all text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                                            activeTab === tab.id 
                                                ? "border-primary text-primary" 
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                                {activeTab === "details" && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                            <DetailItem label="Condition" value={listing.condition || "Like New"} />
                                            <DetailItem label="Brand" value="Apple" />
                                            <DetailItem label="Negotiable" value="Yes" />
                                            <DetailItem label="Posted" value={listing.date || "2 hours ago"} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Description</label>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                                {listing.description || "MacBook Pro 14-inch with M1 Pro chip, 16GB RAM, and 512GB SSD. Excellent condition, includes original box and charger. Battery cycle count: 42."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "vendor" && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {/* Vendor Summary */}
                                        <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/20 shadow-inner">
                                                {listing.seller?.charAt(0) || "J"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{listing.seller || "John Doe"}</span>
                                                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[9px] font-bold">
                                                        <Star size={8} className="fill-amber-500" />
                                                        4.8
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest mt-0.5">ID: USR-12345</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <StatItem label="Previous Listings" value="24 total" subValue="18 approved, 4 rejected" />
                                            <StatItem label="Vendor Trust Score" value="94/100" isPositive />
                                            <StatItem label="Reports on Listings" value="0 total" />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "actions" && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 flex justify-between">
                                                    <span>Rejection Reason</span>
                                                    <span className="text-red-500">* Required if rejecting</span>
                                                </label>
                                                <select 
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    className="w-full h-11 px-4 bg-muted/30 border border-border/50 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select a reason</option>
                                                    {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Admin Notes (optional)</label>
                                                <textarea 
                                                    value={adminNotes}
                                                    onChange={(e) => setAdminNotes(e.target.value)}
                                                    placeholder="Internal documentation or instructions to vendor..."
                                                    className="w-full min-h-[100px] p-4 bg-muted/30 border border-border/50 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <StatusAction icon={Flag} label="Flag for Review" color="text-amber-500 bg-amber-500/10 hover:bg-amber-500/20" />
                                            <StatusAction icon={MessageCircle} label="Contact Vendor" color="text-blue-500 bg-blue-500/10 hover:bg-blue-500/20" />
                                            <StatusAction icon={Trash2} label="Remove Permanently" color="text-red-500 bg-red-500/10 hover:bg-red-500/20" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 sm:p-6 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-3 mt-auto">
                                <button className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-border/50 bg-white dark:bg-card text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all active:scale-95 shadow-sm">
                                    Reject Item
                                </button>
                                <button className="w-full sm:flex-[1.5] py-3 px-4 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                    <CheckCircle size={14} />
                                    Approve Listing
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">{label}</span>
            <div className="text-sm font-bold text-foreground/80">{value}</div>
        </div>
    );
}

function StatItem({ label, value, subValue, isPositive }: { label: string; value: string; subValue?: string; isPositive?: boolean }) {
    return (
        <div className="flex justify-between items-end border-b border-border/30 pb-3">
            <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</span>
                {subValue && <div className="text-[10px] font-medium text-muted-foreground/40">{subValue}</div>}
            </div>
            <div className={cn("text-sm font-bold", isPositive ? "text-emerald-500" : "text-foreground")}>{value}</div>
        </div>
    );
}

function StatusAction({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
    return (
        <button className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95",
            color
        )}>
            <Icon size={12} />
            {label}
        </button>
    );
}
