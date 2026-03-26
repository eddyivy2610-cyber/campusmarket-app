"use client";

import {
    Settings, User, MessageSquare, ChevronRight
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
           className={`absolute top-full left-0 right-0 w-full md:w-64 md:left-auto md:right-0 max-h-[60vh] overflow-y-auto bg-white dark:bg-card text-foreground font-heading rounded-2xl border border-border shadow-[0_18px_40px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out z-50 origin-top ${isOpen
                ? 'opacity-100 translate-y-2 visible'
                : 'opacity-0 translate-y-0 invisible'
                } max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:w-auto`}
        >
            <div className="px-3 py-3 border-b border-border/60 text-center">
                <div className="flex flex-col gap-2">
                    <Link
                        href={user ? "/profile/campus-market" : "/register"}
                        className="w-full py-2.5 bg-[#FFD700] text-black text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#F0C900] transition-all active:scale-95 shadow-sm flex items-center justify-between px-3"
                    >
                        <span>Join Campus Hive</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-black/70">
                            {user ? `${user.name.split(" ")[0]} • ${user.role}` : "Log in or Sign up"}
                        </span>
                    </Link>

                    {!user ? (
                        <p className="text-[10px] text-foreground/70 font-medium">
                            Already have an account? <Link href="/login" className="text-[#FFD700] font-bold hover:underline">Login</Link>
                        </p>
                    ) : (
                        <>
                            <div className="text-left mt-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 mb-0.5">Signed in as</p>
                                <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                                <p className="text-[10px] text-foreground/70 truncate">{user.email}</p>
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
                <Link href="/profile/campus-market" className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-all duration-200 group">
                    <div className="flex items-center gap-2.5 text-[11px] font-heading font-semibold text-foreground">
                        <span className="w-7 h-7 rounded-lg bg-card/60 border border-border flex items-center justify-center text-foreground transition-colors group-hover:bg-white group-hover:border-[#FFD700]">
                            <User className="w-[14px] h-[14px]" strokeWidth={1.5} />
                        </span>
                        <span>My Profile</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-foreground/50 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link href="/messages" className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-all duration-200 group">
                    <div className="flex items-center gap-2.5 text-[11px] font-heading font-semibold text-foreground">
                        <span className="w-7 h-7 rounded-lg bg-card/60 border border-border flex items-center justify-center text-foreground transition-colors group-hover:bg-white group-hover:border-[#FFD700]">
                            <MessageSquare className="w-[14px] h-[14px]" strokeWidth={1.5} />
                        </span>
                        <span>Messages</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-foreground/50 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link href="/settings" className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-all duration-200 group">
                    <div className="flex items-center gap-2.5 text-[11px] font-heading font-semibold text-foreground">
                        <span className="w-7 h-7 rounded-lg bg-card/60 border border-border flex items-center justify-center text-foreground transition-colors group-hover:bg-white group-hover:border-[#FFD700]">
                            <Settings className="w-[14px] h-[14px]" strokeWidth={1.5} />
                        </span>
                        <span>Settings</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-foreground/50 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
