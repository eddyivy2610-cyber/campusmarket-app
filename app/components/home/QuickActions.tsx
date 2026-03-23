"use client";

import { PhoneCall, Store, PackageCheck } from "lucide-react";

const ACTIONS = [
    {
        title: "Call to Order",
        icon: PhoneCall,
        tone: "border-[#FFD700] text-[#a16207] bg-[#fff4cf]",
    },
    {
        title: "Sell on CampusMarket",
        icon: Store,
        tone: "border-[#efe3cf] text-[#1f1f1f] bg-white",
    },
    {
        title: "Send Your Packages",
        icon: PackageCheck,
        tone: "border-[#efe3cf] text-[#1f1f1f] bg-white",
    },
];

export function QuickActions() {
    return (
        <aside className="w-full lg:w-56 shrink-0">
            <div className="rounded-2xl border border-[#efe3cf] bg-white shadow-[0_16px_36px_rgba(40,30,10,0.08)] overflow-hidden">
                <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-5 bg-[#FFD700] rounded-none shadow-sm" />
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-black">
                            Quick Actions
                        </p>
                    </div>
                </div>
                <div className="px-2 pb-3 space-y-1.5">
                    {ACTIONS.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.title}
                                className={`w-full flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-[#FFD700]/40 hover:bg-[#fff9e6] ${action.tone}`}
                            >
                                <span className="h-8 w-8 rounded-md border border-current/20 bg-[#FFD700] text-black flex items-center justify-center group-hover:bg-[#fff3c6] group-hover:text-[#FFD700] transition-colors">
                                    <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] font-heading font-medium text-black">
                                        {action.title}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}

