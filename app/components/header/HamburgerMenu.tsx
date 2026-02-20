"use client";

import {
    X,
    User,
    ShoppingBasket,
    Bell,
    ChevronRight,
    ChevronDown,
    Store,
    Heart,
    Settings,
    HelpCircle,
    Users2,
    MessageSquare,
    LifeBuoy,
    MonitorSmartphone,
    BookOpen,
    Home,
    Shirt,
    Sparkles,
    Dumbbell,
    Music,
    Package,
    Bike,
    Calendar,
    AlertCircle,
    Wrench,
    Tag
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "../../data/products";

interface HamburgerMenuProps {
    isOpen: boolean;
    onClose: () => void;
    notificationCount?: number;
}

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench
};

export function HamburgerMenu({ isOpen, onClose, notificationCount = 3 }: HamburgerMenuProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const nav = (path: string) => {
        router.push(path);
        onClose();
    };

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-start">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div
                className={`relative w-full max-w-[85vw] sm:max-w-[360px] bg-background border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"} h-full overflow-hidden`}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-primary/5 shrink-0">
                    <Link href="/" onClick={onClose} className="flex items-center gap-2">
                        <ShoppingBasket className="w-6 h-6 text-primary" />
                        <span className="font-bold text-base text-foreground font-heading">CampusMarket</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto">

                    {/* Auth CTA */}
                    <div className="p-4">
                        <button
                            onClick={() => nav("/register")}
                            className="w-full flex items-center justify-between p-4 bg-primary text-white rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95 group"
                        >
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5" />
                                <div className="text-left">
                                    <p className="font-black uppercase tracking-widest text-[11px]">Join Campus Market</p>
                                    <p className="text-[10px] text-white/70 font-medium">Log in or Sign up</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* ── My Account ── */}
                    <Section label="My Account">
                        <NavRow icon={Bell} label="Notifications" badge={notificationCount} onClick={() => nav("/coming-soon")} />
                        <NavRow icon={Heart} label="Saved Items" onClick={() => nav("/saved")} />
                        <NavRow icon={Store} label="Vendor / Seller Profile" accent onClick={() => nav("/profile/tech-hub")} />
                    </Section>

                    {/* ── Shop: Full Categories ── */}
                    <Section label="Shop by Category">
                        {/* Expandable category list */}
                        <button
                            onClick={() => setCategoriesOpen((v) => !v)}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary rounded-xl transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Tag className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                <span className="font-medium text-sm">All Categories</span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-muted-foreground/50 transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {categoriesOpen && (
                            <div className="ml-4 mt-1 space-y-0.5 border-l border-border/40 pl-3">
                                {CATEGORIES.map((cat, idx) => {
                                    const Icon = IconMap[cat.lucideIcon || "Package"];
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => nav(`/listings?category=${cat.name}`)}
                                            className="w-full flex items-center gap-3 px-2 py-2 hover:bg-secondary rounded-lg transition-colors group text-left"
                                        >
                                            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                            <span className="text-sm font-medium text-foreground/80 group-hover:text-primary">{cat.name}</span>
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => nav("/listings")}
                                    className="w-full flex items-center gap-3 px-2 py-2 hover:bg-primary/5 rounded-lg transition-colors text-primary font-bold text-xs uppercase tracking-widest"
                                >
                                    View All Listings →
                                </button>
                            </div>
                        )}
                    </Section>

                    {/* ── Community ── */}
                    <Section label="Community">
                        <NavRow icon={MessageSquare} label="Community Hub" onClick={() => nav("/community")} />
                        <NavRow icon={Users2} label="Teams" onClick={() => nav("/coming-soon")} />
                    </Section>

                    {/* ── Support & Info ── */}
                    <Section label="Support">
                        <NavRow icon={HelpCircle} label="Help Center" onClick={() => nav("/coming-soon")} />
                        <NavRow icon={LifeBuoy} label="Contact Support" onClick={() => nav("/coming-soon")} />
                    </Section>

                </div>

                {/* ── Sticky Footer ── */}
                <div className="shrink-0 p-3 border-t border-border bg-secondary/20">
                    <button
                        onClick={() => nav("/coming-soon")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium text-sm">Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Helpers ── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="px-2 py-3 border-b border-border/40 last:border-0">
            <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
            <nav className="space-y-0.5">{children}</nav>
        </div>
    );
}

function NavRow({
    icon: Icon,
    label,
    badge,
    accent,
    onClick,
}: {
    icon: any;
    label: string;
    badge?: number;
    accent?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group ${accent
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "hover:bg-secondary text-foreground"
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon
                    className={`w-5 h-5 transition-colors shrink-0 ${accent ? "text-primary" : "text-gray-400 group-hover:text-primary"
                        }`}
                />
                <span className={`text-sm ${accent ? "font-bold" : "font-medium"}`}>{label}</span>
            </div>
            {badge && badge > 0 ? (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {badge}
                </span>
            ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
            )}
        </button>
    );
}
