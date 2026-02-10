"use client";

import { ShoppingBasket, ArrowRight, ShoppingBag } from "lucide-react";

interface CartDropdownProps {
    isOpen: boolean;
    itemCount: number;
}

export function CartDropdown({ isOpen, itemCount }: CartDropdownProps) {
    return (
        <div
            className={`absolute top-full right-[-100px] md:right-0 mt-3 w-80 bg-secondary text-foreground rounded-2xl shadow-2xl border border-white/5 overflow-hidden transition-all duration-300 ease-in-out z-50 ${isOpen
                ? 'opacity-100 translate-y-0 visible'
                : 'opacity-0 -translate-y-4 invisible'
                }`}
        >
            {itemCount === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                            <ShoppingBasket className="w-12 h-12 text-gray-300" strokeWidth={1.5} />
                        </div>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-primary/20 rounded-full animate-ping"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-base font-semibold text-foreground font-sans">Your cart is empty</p>
                        <p className="text-sm text-gray-400">— start shopping</p>
                    </div>
                    <button className="mt-4 bg-primary text-white text-sm font-bold py-2.5 px-8 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-105">
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="p-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                        <h3 className="text-sm font-bold text-foreground font-sans">My Basket ({itemCount})</h3>
                        <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Clear all</span>
                    </div>

                    {/* Placeholder for items */}
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex items-center gap-3 p-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-gray-200" />
                            </div>
                            <div className="flex flex-col">
                                <div className="h-2 w-24 bg-gray-200 rounded animate-pulse mb-1.5"></div>
                                <div className="h-2 w-16 bg-gray-100 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-medium text-gray-500">Subtotal:</span>
                            <span className="text-sm font-bold text-primary font-sans">$0.00</span>
                        </div>
                        <button className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-all duration-300 shadow-md shadow-primary/20">
                            <span>View Cart & Checkout</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
