"use client";

import {
    X,
    User,
    ShoppingBasket,
    Bell,
    LayoutGrid,
    Zap,
    Heart,
    Search,
    HelpCircle,
    Users2,
    LogOut,
    Settings,
    ChevronRight,
    PlusCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HamburgerMenuProps {
    isOpen: boolean;
    onClose: () => void;
    cartCount?: number;
    notificationCount?: number;
}

export function HamburgerMenu({ isOpen, onClose, cartCount = 0, notificationCount = 3 }: HamburgerMenuProps) {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    // Handle animation
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleNavigation = (path: string) => {
        router.push(path);
        onClose();
    };

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-start">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`relative w-full max-w-[85vw] sm:max-w-md bg-background border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} h-full overflow-hidden`}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Guest User</h3>
                            <p className="text-xs text-muted-foreground">Sign in to manage account</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-4">

                    {/* Primary Actions */}
                    <div className="px-4 mb-6 grid grid-cols-2 gap-3">
                        <button onClick={() => handleNavigation('/create')} className="col-span-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
                            <PlusCircle className="w-4 h-4" />
                            Post a Listing
                        </button>
                    </div>

                    {/* Navigation Groups */}
                    <div className="space-y-6">
                        {/* Account & Activity */}
                        <div className="px-2">
                            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">My Activity</p>
                            <nav className="space-y-0.5">
                                <button onClick={() => handleNavigation('/coming-soon')} className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                        <span className="font-medium text-sm">Notifications</span>
                                    </div>
                                    {notificationCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{notificationCount}</span>
                                    )}
                                </button>
                                <button onClick={() => handleNavigation('/cart')} className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <ShoppingBasket className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                        <span className="font-medium text-sm">My Cart</span>
                                    </div>
                                    {cartCount > 0 && (
                                        <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>
                                    )}
                                </button>
                                <button onClick={() => handleNavigation('/coming-soon')} className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <LayoutGrid className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                        <span className="font-medium text-sm">My Listings</span>
                                    </div>
                                </button>
                            </nav>
                        </div>

                        {/* Marketplace */}
                        <div className="px-2">
                            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Marketplace</p>
                            <nav className="space-y-0.5">
                                <button onClick={() => handleNavigation('/')} className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <LayoutGrid className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                        <span className="font-medium text-sm">Categories</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                                </button>
                                <button onClick={() => handleNavigation('/coming-soon')} className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                        <span className="font-medium text-sm">Campus Buzz</span>
                                    </div>
                                    <span className="bg-orange-100 text-orange-600 text-[9px] font-bold px-1.5 py-0.5 rounded-lg">HOT</span>
                                </button>
                                <button onClick={() => handleNavigation('/coming-soon')} className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                        <span className="font-medium text-sm">Campus Deals</span>
                                    </div>
                                </button>
                                <button onClick={() => handleNavigation('/coming-soon')} className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Search className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                        <span className="font-medium text-sm">Quick Find</span>
                                    </div>
                                </button>
                            </nav>
                        </div>

                        {/* Support */}
                        <div className="px-2">
                            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Support</p>
                            <nav className="space-y-0.5">
                                <button onClick={() => handleNavigation('/coming-soon')} className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                        <span className="font-medium text-sm">Help Center</span>
                                    </div>
                                </button>
                                <button onClick={() => handleNavigation('/coming-soon')} className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Users2 className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                        <span className="font-medium text-sm">Meet the Team</span>
                                    </div>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-secondary/30">
                    <button onClick={() => handleNavigation('/coming-soon')} className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium text-sm">Settings</span>
                    </button>
                    <button onClick={() => handleNavigation('/login')} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors text-muted-foreground mt-1">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Log Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
