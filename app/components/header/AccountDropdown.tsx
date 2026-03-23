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
            className={`absolute top-full right-0 left-auto mt-2 w-full max-w-[260px] max-h-[60vh] overflow-y-auto bg-white/95 backdrop-blur-md text-black font-heading rounded-xl border border-black/10 shadow-[0_18px_40px_rgba(40,30,10,0.18)] transition-all duration-200 ease-in-out z-50 origin-top ${isOpen
                ? 'opacity-100 scale-100 visible'
                : 'opacity-0 scale-95 invisible'
                }`}
        >
            <div className="px-3 py-3 bg-[#fff9e6] border-b border-[#efe3cf] text-center">
                {!user ? (
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/login"
                            className="w-full py-2 bg-[#FFD700] text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#f5dc48] transition-all active:scale-95"
                        >
                            Login
                        </Link>
                        <p className="text-[10px] text-black/60 font-medium">
                            New here? <Link href="/register" className="text-[#FFD700] font-bold hover:underline">Create account</Link>
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="text-left mb-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-0.5">Signed in as</p>
                            <p className="text-sm font-bold text-black truncate">{user.name}</p>
                            <p className="text-[10px] text-black/60 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full py-2 bg-white border border-[#efe3cf] text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 transition-all active:scale-95 mt-1"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Menu Links */}
            <div className="py-1.5 px-1.5 space-y-0.5">
                <Link href="/profile/campus-market" className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-transparent bg-white hover:border-[#FFD700]/40 hover:bg-[#fff9e6] transition-all duration-200 group">
                    <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-black group-hover:text-black">
                        <span className="w-6 h-6 rounded-md bg-[#fff3c6] text-black flex items-center justify-center transition-colors group-hover:bg-[#FFD700]">
                            <User className="w-3.5 h-3.5" />
                        </span>
                        <span>My Profile</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-black/60 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/messages" className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-transparent bg-white hover:border-[#FFD700]/40 hover:bg-[#fff9e6] transition-all duration-200 group">
                    <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-black group-hover:text-black">
                        <span className="w-6 h-6 rounded-md bg-[#fff3c6] text-black flex items-center justify-center transition-colors group-hover:bg-[#FFD700]">
                            <MessageSquare className="w-3.5 h-3.5" />
                        </span>
                        <span>Messages</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-black/60 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/settings" className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-transparent bg-white hover:border-[#FFD700]/40 hover:bg-[#fff9e6] transition-all duration-200 group">
                    <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-black group-hover:text-black">
                        <span className="w-6 h-6 rounded-md bg-[#fff3c6] text-black flex items-center justify-center transition-colors group-hover:bg-[#FFD700]">
                            <Settings className="w-3.5 h-3.5" />
                        </span>
                        <span>Settings</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-black/60 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

        </div>
    );
}
