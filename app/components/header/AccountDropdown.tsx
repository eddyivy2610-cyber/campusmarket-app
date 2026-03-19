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
            className={`absolute top-full right-0 left-auto mt-2 w-full max-w-[260px] max-h-[60vh] overflow-y-auto bg-black/80 backdrop-blur-md text-white font-heading rounded-md border border-white/15 shadow-sm transition-all duration-200 ease-in-out z-50 origin-top ${isOpen
                ? 'opacity-100 scale-100 visible'
                : 'opacity-0 scale-95 invisible'
                }`}
        >
            <div className="px-3 py-3 bg-white/5 border-b border-white/10 text-center">
                {!user ? (
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/login"
                            className="w-full py-2 bg-yellow-300 text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-200 transition-all active:scale-95"
                        >
                            Login
                        </Link>
                        <p className="text-[10px] text-white/70 font-medium">
                            New here? <Link href="/register" className="text-yellow-300 font-bold hover:underline">Create account</Link>
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="text-left mb-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-0.5">Signed in as</p>
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-white/60 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full py-2 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 transition-all active:scale-95 mt-1"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Menu Links */}
            <div className="py-1.5 px-1.5 space-y-0.5">
                <Link href="/profile/campus-market" className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-transparent bg-white/5 hover:border-yellow-300/40 hover:bg-yellow-300/10 transition-all duration-200 group">
                    <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-white group-hover:text-yellow-200">
                        <span className="w-6 h-6 rounded-md bg-brand-yellow-tint text-brand-blue flex items-center justify-center transition-colors">
                            <User className="w-3.5 h-3.5" />
                        </span>
                        <span>My Profile</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-brand-blue-90 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/dashboard/messages" className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-transparent bg-white/5 hover:border-yellow-300/40 hover:bg-yellow-300/10 transition-all duration-200 group">
                    <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-white group-hover:text-yellow-200">
                        <span className="w-6 h-6 rounded-md bg-brand-yellow-tint text-brand-blue flex items-center justify-center transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" />
                        </span>
                        <span>Messages</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-brand-blue-90 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/settings" className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-transparent bg-white/5 hover:border-yellow-300/40 hover:bg-yellow-300/10 transition-all duration-200 group">
                    <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-white group-hover:text-yellow-200">
                        <span className="w-6 h-6 rounded-md bg-brand-yellow-tint text-brand-blue flex items-center justify-center transition-colors">
                            <Settings className="w-3.5 h-3.5" />
                        </span>
                        <span>Settings</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-brand-blue-90 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

        </div>
    );
}
