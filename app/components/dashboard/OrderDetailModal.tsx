"use client";

import { X, User, Package, Calendar, Tag, ShieldCheck, AlertCircle, MessageCircle, Star } from "lucide-react";
import { DashboardOrder, OrderStatus } from "../../data/dashboardOrders";
import { motion, AnimatePresence } from "framer-motion";

interface OrderDetailModalProps {
    order: DashboardOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onAction: (orderId: string, action: "confirm" | "fail") => void;
}

export function OrderDetailModal({ order, isOpen, onClose, onAction }: OrderDetailModalProps) {
    if (!order) return null;

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Active": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "Pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "Failed": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            case "Cancelled": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
            case "Pending Admin Verification": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-card border border-border/50 rounded-[32px] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-secondary/5">
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">Order Details</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{order.id}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Status Section */}
                            <div className="flex items-center justify-between">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <span className="text-xl font-bold tracking-tight">₦{order.amount.toLocaleString()}</span>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product Info */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Information</h4>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-secondary/5 border border-border/30">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                            {order.productImage ? (
                                                <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                                                    <Package className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{order.productName}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground mt-1">Listing ID: {order.listingId}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer Information</h4>
                                    <div className="p-4 rounded-2xl bg-secondary/5 border border-border/30 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-semibold">{order.customer}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-semibold">{order.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Evidence / Logic Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status Evidence</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-2xl border ${order.ratingLeft ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-secondary/5 border-border/30 opacity-60'}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Star className={`w-4 h-4 ${order.ratingLeft ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Buyer Rating</span>
                                        </div>
                                        <p className="text-xs font-medium">{order.ratingLeft ? 'Rating submitted by buyer' : 'Pending buyer rating'}</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl border ${order.sellerConfirmed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-secondary/5 border-border/30 opacity-60'}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <ShieldCheck className={`w-4 h-4 ${order.sellerConfirmed ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Seller Confirmation</span>
                                        </div>
                                        <p className="text-xs font-medium">{order.sellerConfirmed ? 'Confirmed by seller' : 'Waiting for seller'}</p>
                                    </div>
                                </div>
                            </div>

                            {order.lastMessage && (
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageCircle className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Last Transaction Message</span>
                                    </div>
                                    <p className="text-sm italic text-foreground/80">&quot;{order.lastMessage}&quot;</p>
                                </div>
                            )}

                            {order.failureReason && (
                                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Failure Reason</p>
                                        <p className="text-sm font-medium text-rose-600">{order.failureReason}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-8 border-t border-border/50 bg-secondary/5 flex flex-col sm:flex-row gap-3">
                            {order.status === "Active" && (
                                <>
                                    <button
                                        disabled={!order.ratingLeft}
                                        onClick={() => onAction(order.id, "confirm")}
                                        className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                                            order.ratingLeft 
                                            ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5' 
                                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        Confirm Successful Transaction
                                    </button>
                                    <button
                                        onClick={() => onAction(order.id, "fail")}
                                        className="flex-1 py-4 px-6 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-rose-500/20"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        Mark as Failed
                                    </button>
                                </>
                            )}
                            
                            {order.status === "Pending Admin Verification" && (
                                <div className="w-full p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-center gap-3 text-purple-600">
                                    <ShieldCheck className="w-5 h-5 animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Waiting for Admin Verification</span>
                                </div>
                            )}

                            {order.status === "Completed" && (
                                <div className="w-full p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center gap-3 text-emerald-600">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Transaction Verified & Completed</span>
                                </div>
                            )}

                            {(order.status === "Failed" || order.status === "Cancelled") && (
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 px-6 rounded-2xl bg-card border border-border/50 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-secondary/5 transition-all outline-none"
                                >
                                    Close Details
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
