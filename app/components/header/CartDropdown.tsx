"use client";

import { ShoppingBasket, ArrowRight, ShoppingBag, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import Image from "next/image";
import Link from "next/link";

interface CartDropdownProps {
    isOpen: boolean;
}

export function CartDropdown({ isOpen }: CartDropdownProps) {
    const { cart, totalItems, subtotal, removeFromCart } = useCart();

    // Helper to format price
    const formatPrice = (price: number) => {
        return price.toLocaleString();
    };

    return (
        <div
            className={`absolute top-full right-[-100px] md:right-0 mt-3 w-80 bg-secondary text-foreground rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300 ease-in-out z-50 ${isOpen
                ? 'opacity-100 translate-y-0 visible'
                : 'opacity-0 -translate-y-4 invisible'
                }`}
        >
            {totalItems === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
                    <div className="relative">
                        <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mb-2 border border-border/50">
                            <ShoppingBasket className="w-12 h-12 text-muted-foreground/30" strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-base font-semibold text-foreground font-heading">Your cart is empty</p>
                        <p className="text-sm text-muted-foreground/60">— start shopping</p>
                    </div>
                    <Link href="/listings" className="mt-4 bg-primary text-white text-sm font-bold py-2.5 px-8 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-105">
                        Explore Market
                    </Link>
                </div>
            ) : (
                <div className="p-4 bg-card">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                        <h3 className="text-sm font-bold text-foreground font-heading">My Basket ({totalItems})</h3>
                        <Link href="/cart" className="text-xs text-primary font-medium hover:underline">View full cart</Link>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {cart.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors group relative">
                                <div className="w-14 h-14 bg-secondary rounded-lg overflow-hidden shrink-0 relative">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.category}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs font-bold text-primary font-price">₦{formatPrice(item.price)}</span>
                                        <span className="text-[10px] font-medium text-muted-foreground">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-medium text-muted-foreground">Subtotal:</span>
                            <span className="text-base font-bold text-foreground font-price">₦{formatPrice(subtotal)}</span>
                        </div>
                        <Link href="/cart" className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-all duration-300 shadow-md shadow-primary/20">
                            <span>Checkout Now</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
