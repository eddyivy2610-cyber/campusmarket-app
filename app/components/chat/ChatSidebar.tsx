"use client";

import { Handshake, CheckCircle2, XCircle, Clock, ShoppingBag } from "lucide-react";
import { NegotiationRecord, NegotiationStatus, ChatParticipant } from "../../data/chat";

interface NegotiationHistoryProps {
    negotiations: NegotiationRecord[];
    participant: ChatParticipant | null;
}

const STATUS_CONFIG: Record<NegotiationStatus, {
    label: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
}> = {
    active: {
        label: "Active",
        bg: "bg-emerald-100 dark:bg-emerald-950/40",
        text: "text-emerald-700 dark:text-emerald-400",
        icon: <Clock className="w-2.5 h-2.5" />,
    },
    completed: {
        label: "Completed",
        bg: "bg-blue-100 dark:bg-blue-950/40",
        text: "text-blue-700 dark:text-blue-400",
        icon: <CheckCircle2 className="w-2.5 h-2.5" />,
    },
    ended: {
        label: "Ended",
        bg: "bg-zinc-100 dark:bg-zinc-800",
        text: "text-zinc-500 dark:text-zinc-400",
        icon: <XCircle className="w-2.5 h-2.5" />,
    },
};

export function NegotiationHistory({ negotiations, participant }: NegotiationHistoryProps) {
    const active = negotiations.filter(n => n.status === "active").length;
    const completed = negotiations.filter(n => n.status === "completed").length;

    return (
        <div className="flex flex-col min-h-0 h-full bg-secondary/10 border-l border-border/40">

            {/* Platform branding — pinned at top */}
            <div className="shrink-0 px-4 pt-5 pb-4 border-b border-border/30 bg-card">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                        <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground leading-none tracking-tight">Campus Market</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Campus. Connect. Trade.</p>
                    </div>
                </div>
            </div>

            {/* Negotiations header — pinned below branding */}
            <div className="shrink-0 px-4 py-3 border-b border-border/30 bg-card">
                <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-primary" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Negotiations</h2>
                </div>
                {participant ? (
                    <p className="text-[10px] text-muted-foreground mt-1">
                        with <span className="font-semibold">{participant.name}</span> · {active} active · {completed} completed
                    </p>
                ) : (
                    <p className="text-[10px] text-muted-foreground mt-1">Select a conversation</p>
                )}
            </div>

            {/* Records list — only this scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
                {!participant || negotiations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/60 flex items-center justify-center">
                            <Handshake className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {participant
                                ? "No negotiations in this chat yet."
                                : "Open a conversation to see its negotiations."}
                        </p>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {negotiations.map((record) => {
                            const cfg = STATUS_CONFIG[record.status];
                            return (
                                <div
                                    key={record.id}
                                    className="w-full text-left p-3 rounded-2xl border bg-card border-border/40 shadow-sm"
                                >
                                    {/* Listing title + price */}
                                    <p className="text-xs font-bold text-foreground truncate">{record.listing.title}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[11px] font-bold text-primary">
                                            {record.agreedPrice
                                                ? `₦${record.agreedPrice.toLocaleString()} agreed`
                                                : `₦${record.listing.price.toLocaleString()}`}
                                        </span>
                                        {/* Status badge */}
                                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                                            {cfg.icon}
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <p className="text-[9px] text-muted-foreground mt-1.5">
                                        {record.endedAt ? `Ended ${record.endedAt}` : `Started ${record.startedAt}`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer — pinned */}
            <div className="shrink-0 px-4 py-3 border-t border-border/30 bg-card">
                <p className="text-[9px] text-muted-foreground text-center leading-relaxed">
                    Ending a negotiation requires both parties to confirm.
                </p>
            </div>
        </div>
    );
}
