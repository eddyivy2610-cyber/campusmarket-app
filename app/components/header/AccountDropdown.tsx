"use client";

import {
    Settings, User, MessageSquare, ChevronRight, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

interface AccountDropdownProps {
    isOpen: boolean;
}

export function AccountDropdown({ isOpen }: AccountDropdownProps) {
    const { user, logout } = useAuth();

    return (
        <div
           className={`absolute top-full left-0 right-0 mt-1 w-full hidden md:block overflow-hidden bg-white dark:bg-card text-foreground font-heading rounded-2xl border border-border shadow-[0_18px_40px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out z-50 origin-top ${isOpen
                ? 'opacity-100 translate-y-2 visible'
                : 'opacity-0 translate-y-0 invisible'
                } max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:w-auto`}
        >
            <div className="px-3 py-3 border-b border-border/60 text-center">
                <div className="flex flex-col gap-2">
                    {!user ? (
                        <>
                            <Link
                                href="/register"
                                className="w-full py-2 bg-[#FFD700] text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#F0C900] transition-all active:scale-95 shadow-sm flex items-center justify-center px-3 text-center"
                            >
                                <span>Join Hive</span>
                            </Link>
                            <p className="text-[10px] text-foreground/70 font-medium">
                                Already have an account? <Link href="/login" className="text-[#FFD700] font-bold hover:underline">Login</Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-left mt-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 mb-0.5">Signed in as</p>
                                <p className="text-xs font-bold text-foreground truncate">{user.name}</p>

                            </div>
                            <button
                                onClick={logout}
                                className="w-full py-2 bg-card border border-border text-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all active:scale-95 shadow-sm"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Menu Links */}
            <div className="p-1.5 space-y-0.5">
                {user?.role === "seller" && (
                    <Link href="/dashboard" className="flex items-center justify-between px-2.5 py-2 rounded-xl border border-transparent bg-primary/5 dark:bg-primary/10 transition-all duration-200 group hover:border-primary/40 hover:bg-primary/10">
                        <div className="flex items-center gap-2.5 text-[11px] font-heading font-semibold text-foreground group-hover:text-primary">
                            <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                                <LayoutDashboard className="w-[14px] h-[14px] transition-transform group-hover:scale-110" strokeWidth={1.5} />
                            </span>
                            <span>Seller Dashboard</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-primary/50 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}

                {(user?.role !== "seller" && user?.role !== "admin" && user?.sellerStatus !== "approved") && (
                    <Link href="/register/seller" className="flex items-center justify-between px-2.5 py-2 rounded-xl border border-transparent bg-white/60 dark:bg-transparent transition-all duration-200 group hover:border-[#FFD700]/40 hover:bg-[#fff9e6] dark:hover:bg-white/10">
                        <div className="flex items-center gap-2.5 text-[11px] font-heading font-semibold text-foreground group-hover:text-black dark:group-hover:text-foreground">
                            <span className="w-7 h-7 rounded-lg bg-[#fff3c6] dark:bg-white/10 text-[#FFD700] flex items-center justify-center transition-colors group-hover:bg-[#FFD700] group-hover:text-black">
                                <User className="w-[14px] h-[14px] transition-transform group-hover:scale-110" strokeWidth={1.5} />
                            </span>
                            <span>{user?.sellerStatus === "pending" ? "Verification Pending" : "Become a Seller"}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-foreground/50 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}

                <Link href={user ? `/profile/${user.handle}` : "/login?next=%2Fprofile"} className="flex items-center justify-between px-2.5 py-2 rounded-xl border border-transparent bg-white/60 dark:bg-transparent transition-all duration-200 group hover:border-[#FFD700]/40 hover:bg-[#fff9e6] dark:hover:bg-white/10">
                    <div className="flex items-center gap-2.5 text-[11px] font-heading font-semibold text-foreground group-hover:text-black dark:group-hover:text-foreground">
                        <span className="w-7 h-7 rounded-lg bg-[#fff3c6] dark:bg-white/10 text-[#FFD700] flex items-center justify-center transition-colors group-hover:bg-[#FFD700] group-hover:text-black">
                            <User className="w-[14px] h-[14px] transition-transform group-hover:scale-110" strokeWidth={1.5} />
                        </span>
                        <span>My Profile</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-foreground/50 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link href={user ? "/messages" : "/login?next=%2Fmessages"} className="flex items-center justify-between px-2.5 py-2 rounded-xl border border-transparent bg-white/60 dark:bg-transparent transition-all duration-200 group hover:border-[#FFD700]/40 hover:bg-[#fff9e6] dark:hover:bg-white/10">
                    <div className="flex items-center gap-2.5 text-[11px] font-heading font-semibold text-foreground group-hover:text-black dark:group-hover:text-foreground">
                        <span className="w-7 h-7 rounded-lg bg-[#fff3c6] dark:bg-white/10 text-[#FFD700] flex items-center justify-center transition-colors group-hover:bg-[#FFD700] group-hover:text-black">
                            <MessageSquare className="w-[14px] h-[14px] transition-transform group-hover:scale-110" strokeWidth={1.5} />
                        </span>
                        <span>Messages</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-foreground/50 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link href={user ? "/settings" : "/login?next=%2Fsettings"} className="flex items-center justify-between px-2.5 py-2 rounded-xl border border-transparent bg-white/60 dark:bg-transparent transition-all duration-200 group hover:border-[#FFD700]/40 hover:bg-[#fff9e6] dark:hover:bg-white/10">
                    <div className="flex items-center gap-2.5 text-[11px] font-heading font-semibold text-foreground group-hover:text-black dark:group-hover:text-foreground">
                        <span className="w-7 h-7 rounded-lg bg-[#fff3c6] dark:bg-white/10 text-[#FFD700] flex items-center justify-center transition-colors group-hover:bg-[#FFD700] group-hover:text-black">
                            <Settings className="w-[14px] h-[14px] transition-transform group-hover:scale-110" strokeWidth={1.5} />
                        </span>
                        <span>Settings</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-foreground/50 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
