"use client";

import React, { useMemo, useState } from "react";
import { Footer } from "../../components/sections/Footer";
import { Headset, Send, ShieldCheck, Wrench, Wallet } from "lucide-react";
import { BackToHomeBar } from "../../components/common/BackToHomeBar";

type ChatMessage = {
    id: string;
    sender: "support" | "user";
    text: string;
    time: string;
};

const ROOM_SEEDS: Record<string, ChatMessage[]> = {
    "General Support": [
        { id: "g1", sender: "support", text: "Welcome to Help Center Chat. Tell us what you need.", time: "09:10" },
    ],
    "Safety & Reports": [
        { id: "s1", sender: "support", text: "Share safety incidents here. We prioritize urgent cases.", time: "09:12" },
    ],
    "Payments & Billing": [
        { id: "p1", sender: "support", text: "For payment issues, include order ID and amount.", time: "09:14" },
    ],
};

const ROOM_ICONS = {
    "General Support": Headset,
    "Safety & Reports": ShieldCheck,
    "Payments & Billing": Wallet,
};

export default function HelpCenterChatRoomPage() {
    const [activeRoom, setActiveRoom] = useState<keyof typeof ROOM_SEEDS>("General Support");
    const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>(ROOM_SEEDS);
    const [draft, setDraft] = useState("");

    const messages = useMemo(() => messagesByRoom[activeRoom] ?? [], [activeRoom, messagesByRoom]);

    const sendMessage = () => {
        const text = draft.trim();
        if (!text) return;

        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        const userMessage: ChatMessage = { id: `u-${Date.now()}`, sender: "user", text, time };

        setMessagesByRoom((prev) => ({
            ...prev,
            [activeRoom]: [...(prev[activeRoom] ?? []), userMessage],
        }));
        setDraft("");

        const supportReply: ChatMessage = {
            id: `s-${Date.now() + 1}`,
            sender: "support",
            text: "Thanks. A support moderator will review this and reply shortly.",
            time,
        };

        setTimeout(() => {
            setMessagesByRoom((prev) => ({
                ...prev,
                [activeRoom]: [...(prev[activeRoom] ?? []), supportReply],
            }));
        }, 700);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-heading">
            <main className="flex-1 py-10 md:py-14 px-4 sm:px-6 xl:px-10">
                <div className="max-w-6xl mx-auto space-y-6">
                    <BackToHomeBar />
                    <section className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Help Center Chat</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold font-heading tracking-tight mb-2">Live support rooms for faster help.</h1>
                        <p className="text-sm text-muted-foreground">Choose a room, send your issue, and keep all support communication in one place.</p>
                    </section>

                    <section className="grid lg:grid-cols-4 gap-6">
                        <aside className="lg:col-span-1 bg-card border border-border/50 rounded-2xl p-4 h-fit">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Rooms</p>
                            <div className="space-y-2">
                                {(Object.keys(ROOM_SEEDS) as Array<keyof typeof ROOM_SEEDS>).map((room) => {
                                    const Icon = ROOM_ICONS[room];
                                    return (
                                        <button
                                            key={room}
                                            onClick={() => setActiveRoom(room)}
                                            className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors ${activeRoom === room ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-secondary text-foreground border border-transparent"}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {room}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-4 text-[11px] text-muted-foreground bg-secondary/40 rounded-lg p-3 inline-flex items-start gap-2">
                                <Wrench className="w-3.5 h-3.5 mt-0.5" />
                                For account lock or payment disputes, include IDs and timestamps.
                            </div>
                        </aside>

                        <div className="lg:col-span-3 bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col min-h-[560px]">
                            <div className="border-b border-border/50 px-5 py-4">
                                <h2 className="font-bold font-heading">{activeRoom}</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 bg-secondary/10">
                                {messages.map((message) => (
                                    <div key={message.id} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${message.sender === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                                        <p>{message.text}</p>
                                        <p className={`mt-1 text-[10px] ${message.sender === "user" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{message.time}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border/50 p-3 md:p-4 flex items-end gap-2">
                                <textarea
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    rows={2}
                                    placeholder="Type your message..."
                                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm resize-none"
                                />
                                <button onClick={sendMessage} className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-2">
                                    <Send className="w-4 h-4" /> Send
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
