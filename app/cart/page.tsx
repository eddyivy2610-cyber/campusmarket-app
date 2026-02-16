"use client";

import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { useCart } from "../context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Tag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, subtotal, totalItems, clearCart } = useCart();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const formatPrice = (price: number) => {
        return price.toLocaleString();
    };

    const deliveryFee = cart.length > 0 ? 500 : 0;
    const discount = 0; // Placeholder
    const total = subtotal + deliveryFee - discount;

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;

        setIsPlacingOrder(true);

        // 1. Validate Cart (Simulated)
        // In a real app, you'd check availability via API here.
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. Generate Order Intent
        const sellers = [...new Set(cart.map(item => item.sellerId))];
        const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        console.log("Order Intent Generated:", {
            orderId,
            items: cart,
            status: "Pending Seller Response",
            sellers
        });

        // 3. Trigger Seller Notifications (Simulated)
        // Logic for backend to notify sellers.

        clearCart();
        setIsPlacingOrder(false);
        setOrderSuccess(true);

        // 4. Open Messaging Channel (Redirect logic)
        // After 3 seconds, redirect or show interaction
    };

    return (
        <main className="min-h-screen bg-background text-foreground font-sans">
            <Header />

            {/* Breadcrumb section */}
            <div className="bg-secondary/10 border-b border-border/50">
                <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                    <Breadcrumb
                        items={[
                            { label: "Shopping Cart" }
                        ]}
                    />
                </div>
            </div>

            <div className="max-w-[1780px] mx-auto px-4 md:px-8 py-10 md:py-16">
                <h1 className="text-3xl font-bold font-heading mb-10">Your Shopping Cart</h1>

                <div className="flex flex-col xl:flex-row gap-10">
                    {/* Cart Items List */}
                    <div className="flex-1">
                        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                            <div className="hidden md:grid grid-cols-[1fr_120px_120px_60px] p-6 border-b border-border/50 bg-secondary/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <span>Product</span>
                                <span className="text-center">Quantity</span>
                                <span className="text-center">Total</span>
                                <span className="text-center">Action</span>
                            </div>

                            <div className="divide-y divide-border/50">
                                <AnimatePresence mode="popLayout">
                                    {cart.length === 0 ? (
                                        <div className="p-16 text-center">
                                            <p className="text-muted-foreground mb-6">Your cart is empty.</p>
                                            <Link href="/listings" className="inline-flex bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors">
                                                Go to Marketplace
                                            </Link>
                                        </div>
                                    ) : (
                                        cart.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_60px] items-center p-6 gap-6 md:gap-0"
                                            >
                                                {/* Product Info */}
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 h-20 bg-secondary rounded-xl overflow-hidden shrink-0 border border-border/50">
                                                        <Image src={item.image} alt={item.title} width={80} height={80} className="object-cover w-full h-full" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-base mb-1 line-clamp-1 truncate">{item.title}</h3>
                                                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{item.category}</p>
                                                        <p className="text-xs font-mono text-muted-foreground/60 tracking-wider">CODE: CM-{item.id.toString().padStart(4, '0')}</p>
                                                    </div>
                                                </div>

                                                {/* Quantity Control */}
                                                <div className="flex justify-center">
                                                    <div className="flex items-center gap-3 bg-secondary/50 border border-border/50 rounded-full px-4 py-2">
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-primary transition-colors disabled:opacity-30" disabled={item.quantity <= 1}>
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-primary transition-colors">
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Item Total */}
                                                <div className="flex justify-center">
                                                    <span className="font-price font-bold text-lg">₦{formatPrice(item.price * item.quantity)}</span>
                                                </div>

                                                {/* Action */}
                                                <div className="flex justify-center">
                                                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            <Link href="/listings" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                                ← Continue Shopping
                            </Link>
                            <button className="bg-slate-900 text-white font-bold py-3.5 px-10 rounded-full hover:bg-primary transition-all shadow-lg text-sm uppercase tracking-wide">
                                Update Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full xl:w-[400px]">
                        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 sticky top-32">
                            <h2 className="text-xl font-bold font-heading mb-6">Order Summary</h2>

                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Discount voucher"
                                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 pr-24"
                                    />
                                    <button className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white text-[10px] font-bold px-4 rounded-lg uppercase tracking-wider hover:bg-primary transition-colors">
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">Sub Total</span>
                                    <span className="font-bold">₦{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">Discount (0%)</span>
                                    <span className="font-bold text-red-500">- ₦{formatPrice(discount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">Delivery fee</span>
                                    <span className="font-bold">₦{formatPrice(deliveryFee)}</span>
                                </div>
                                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-price font-bold text-2xl text-primary">₦{formatPrice(total)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mb-8">
                                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    <strong className="text-foreground">Campus Trust Warranty.</strong> All items are verified by the Campus Market team for authenticity and quality.
                                </p>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={cart.length === 0 || isPlacingOrder}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-primary transition-all shadow-xl shadow-slate-900/10 text-base uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isPlacingOrder ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    "Place Order"
                                )}
                            </button>

                            {orderSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <h4 className="text-sm font-bold text-emerald-900">Order request sent!</h4>
                                    </div>
                                    <p className="text-xs text-emerald-700 leading-relaxed">
                                        The sellers have been notified. Continuing to your conversations to discuss delivery & payment.
                                    </p>
                                    <button
                                        onClick={() => window.location.href = '/messages'}
                                        className="mt-3 w-full bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                                    >
                                        Go to Messages
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
