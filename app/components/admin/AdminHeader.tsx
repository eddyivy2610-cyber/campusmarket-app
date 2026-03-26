"use client";

import React, { useMemo, useState } from "react";
import { Bell, LogOut, Search, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { clearAdminSession, getAdminSession } from "@/lib/adminAuth";

const SEARCH_TARGETS = [
    { label: "Settings", keywords: ["settings", "preferences", "config"], href: "/admin/settings" },
    { label: "Controls", keywords: ["controls", "moderation", "rules"], href: "/admin/reports" },
    { label: "Users", keywords: ["users", "accounts", "members"], href: "/admin/users" },
    { label: "Dispute Center", keywords: ["dispute", "complaint", "feedback", "help center"], href: "/admin/dispute-center" },
];

export function AdminHeader() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [adminLabel, setAdminLabel] = useState("Admin");

    React.useEffect(() => {
        const session = getAdminSession();
        if (session?.username) {
            setAdminLabel(session.username);
        }
    }, []);

    const matches = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return [];
        return SEARCH_TARGETS.filter((target) =>
            target.keywords.some((keyword) => keyword.includes(normalized) || normalized.includes(keyword))
        );
    }, [query]);

    const handleSearch = (value: string) => {
        const normalized = value.trim().toLowerCase();
        if (!normalized) return;
        const target = SEARCH_TARGETS.find((entry) =>
            entry.keywords.some((keyword) => keyword.includes(normalized) || normalized.includes(keyword))
        );
        if (target) {
            router.push(target.href);
        }
    };

    const handleLogout = () => {
        clearAdminSession();
        router.replace("/admin/auth/sign-in");
    };

    return (
        <div className="bg-background text-foreground py-2 md:py-3 fixed top-0 left-0 right-0 z-40 border-b border-border/30 shadow-sm">
            <div className="w-full max-w-[1780px] mx-auto px-4 md:px-8 flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-0 group">
                    <span className="text-[20px] md:text-[22px] font-bold font-sans text-[#FFD700] whitespace-nowrap drop-shadow-sm">
                        Hive
                    </span>
                    <div className="flex flex-col leading-tight ml-2">
                        <span className="text-base md:text-lg font-bold tracking-tight font-heading group-hover:text-primary transition-colors">Admin Center</span>
                    </div>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-bold uppercase tracking-widest bg-secondary/40 text-muted-foreground border border-border/40">
                        Moderation Suite
                    </span>
                </div>

                <div className="ml-auto flex items-center gap-2 md:gap-3 shrink-0">
                    <div className="relative hidden md:flex items-center bg-secondary/20 backdrop-blur-lg border border-border/40 rounded-md px-2 py-1.5 md:px-3 md:py-2 shadow-sm">
                        <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground ml-1" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    handleSearch(query);
                                }
                            }}
                            placeholder="Search settings, controls, users..."
                            className="bg-transparent outline-none text-[12px] md:text-sm px-2 w-48 md:w-56 text-foreground placeholder:text-muted-foreground/70"
                            aria-label="Admin search"
                        />
                        {matches.length > 0 && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden z-50">
                                {matches.slice(0, 3).map((match) => (
                                    <button
                                        key={match.label}
                                        type="button"
                                        onClick={() => handleSearch(match.keywords[0])}
                                        className="w-full px-4 py-2 text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-secondary/40 transition-colors"
                                    >
                                        {match.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 bg-secondary/20 backdrop-blur-lg border border-border/40 rounded-md px-2 py-1.5 md:px-3 md:py-2 shadow-sm">
                        <button
                            className="relative flex items-center justify-center p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                            title="Admin notifications"
                        >
                            <Bell className="w-4 h-4 md:w-5 md:h-5 shrink-0" strokeWidth={2} />
                            <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-[8px] md:text-[9px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center rounded-full ring-2 ring-background animate-pulse">
                                3
                            </span>
                        </button>
                        <div className="w-px h-6 bg-border/60 mx-1"></div>
                        <button
                            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/5"
                            title="Admin profile"
                        >
                            <div className="bg-secondary p-1.5 rounded-md">
                                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" strokeWidth={2} />
                            </div>
                            <span className="hidden sm:flex text-[11px] md:text-xs font-bold font-heading pr-1 max-w-[120px] truncate">{adminLabel}</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-500/10 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
}
