"use client";

import React from "react";
import { MessageCircleWarning, Send, ShieldAlert, Clock3, CheckCircle2 } from "lucide-react";

type DisputeStatus = "open" | "pending" | "resolved";

type DisputeThread = {
    id: string;
    source: "Help Center Chat" | "Feedback Form";
    complainant: string;
    subject: string;
    status: DisputeStatus;
    createdAt: string;
    messages: { id: string; from: "user" | "admin"; text: string; time: string }[];
};

const MOCK_THREADS: DisputeThread[] = [
    {
        id: "DSP-2401",
        source: "Help Center Chat",
        complainant: "Rachel P.",
        subject: "Seller no-show after payment agreement",
        status: "open",
        createdAt: "Today, 10:12 AM",
        messages: [
            { id: "m1", from: "user", text: "Seller agreed and stopped responding after I transferred half payment.", time: "10:12 AM" },
            { id: "m2", from: "admin", text: "Please share transaction screenshot and seller handle for verification.", time: "10:18 AM" },
        ],
    },
    {
        id: "DSP-2397",
        source: "Feedback Form",
        complainant: "Michael O.",
        subject: "Item condition mismatch complaint",
        status: "pending",
        createdAt: "Yesterday, 7:42 PM",
        messages: [
            { id: "m1", from: "user", text: "The listed laptop was marked like-new but arrived with keyboard defects.", time: "7:42 PM" },
        ],
    },
    {
        id: "DSP-2388",
        source: "Help Center Chat",
        complainant: "Amina K.",
        subject: "Harassment in negotiation chat",
        status: "resolved",
        createdAt: "2 days ago",
        messages: [
            { id: "m1", from: "user", text: "Received abusive messages while negotiating listing #392.", time: "2 days ago" },
            { id: "m2", from: "admin", text: "Account reviewed and user has been suspended. Thank you for reporting.", time: "2 days ago" },
        ],
    },
];

const statusClass: Record<DisputeStatus, string> = {
    open: "bg-red-500/10 text-red-600 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export default function AdminDisputeCenterPage() {
    const [threads, setThreads] = React.useState(MOCK_THREADS);
    const [activeId, setActiveId] = React.useState(MOCK_THREADS[0].id);
    const [reply, setReply] = React.useState("");

    const activeThread = threads.find((t) => t.id === activeId) || null;

    const setStatus = (status: DisputeStatus) => {
        if (!activeThread) return;
        setThreads((prev) =>
            prev.map((t) => (t.id === activeThread.id ? { ...t, status } : t))
        );
    };

    const sendReply = () => {
        const text = reply.trim();
        if (!activeThread || !text) return;

        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        setThreads((prev) =>
            prev.map((t) =>
                t.id === activeThread.id
                    ? {
                          ...t,
                          status: t.status === "resolved" ? "pending" : t.status,
                          messages: [...t.messages, { id: `m-${Date.now()}`, from: "admin", text, time }],
                      }
                    : t
            )
        );
        setReply("");
    };

    return (
        <div className="h-full min-h-[720px] flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Dispute Center (Messaging)</h1>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">
                        Receive help-center complaints, respond, and track resolution
                    </p>
                </div>
                <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-secondary border border-border/50">
                    {threads.filter((t) => t.status !== "resolved").length} active
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5 min-h-0 flex-1">
                <aside className="border border-border/50 rounded-2xl bg-card overflow-hidden min-h-[380px]">
                    <div className="px-4 py-3 border-b border-border/50 bg-secondary/10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Incoming Threads</p>
                    </div>
                    <div className="divide-y divide-border/30">
                        {threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => setActiveId(thread.id)}
                                className={`w-full text-left px-4 py-3 transition-colors ${activeId === thread.id ? "bg-primary/5" : "hover:bg-secondary/10"}`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <span className="text-xs font-bold">{thread.id}</span>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusClass[thread.status]}`}>
                                        {thread.status}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-foreground line-clamp-1">{thread.subject}</p>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    {thread.complainant} • {thread.source}
                                </p>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="border border-border/50 rounded-2xl bg-card flex flex-col min-h-[380px]">
                    {!activeThread ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a thread</div>
                    ) : (
                        <>
                            <div className="px-5 py-4 border-b border-border/50 bg-secondary/10 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-bold">{activeThread.subject}</h2>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {activeThread.id} • {activeThread.complainant} • {activeThread.createdAt}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setStatus("open")} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-500/20 bg-red-500/10 text-red-600">Open</button>
                                    <button onClick={() => setStatus("pending")} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-600">Pending</button>
                                    <button onClick={() => setStatus("resolved")} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">Resolved</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 bg-secondary/5">
                                {activeThread.messages.map((msg) => (
                                    <div key={msg.id} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.from === "admin" ? "ml-auto bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                                        <p>{msg.text}</p>
                                        <p className={`mt-1 text-[10px] ${msg.from === "admin" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{msg.time}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="px-5 py-4 border-t border-border/50 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold">
                                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/40"><MessageCircleWarning className="w-4 h-4 text-primary" />Help Center intake</div>
                                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/40"><ShieldAlert className="w-4 h-4 text-amber-500" />Complaint escalation</div>
                                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/40"><Clock3 className="w-4 h-4 text-blue-500" />Response SLA tracking</div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        rows={2}
                                        placeholder="Write feedback or response to complaint..."
                                        className="flex-1 rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm resize-none"
                                    />
                                    <button
                                        onClick={sendReply}
                                        className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" /> Send
                                    </button>
                                </div>
                                {activeThread.status === "resolved" && (
                                    <p className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Thread resolved. New reply will move it back to pending.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
