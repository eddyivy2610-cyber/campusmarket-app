"use client";

import { PhoneCall, Store, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { PendingApprovalModal } from "../modals/PendingApprovalModal";
import { StudentVerificationPendingModal } from "../modals/StudentVerificationPendingModal";
import { SellerRegistrationPromptModal } from "../modals/SellerRegistrationPromptModal";

const ACTIONS = [
    {
        id: "faqs",
        title: "FAQs",
        icon: PhoneCall,
        route: "/settings/help",
    },
    {
        id: "sell",
        title: "Sell on Campus Market",
        icon: Store,
        route: "/dashboard/products/add",
    },
    {
        id: "send-packages",
        title: "Send Your Packages",
        icon: PackageCheck,
        route: "/coming-soon",
    },
];

export function QuickActions() {
    const { user } = useAuth();
    const [showPending, setShowPending] = useState(false);
    const [showStudentPending, setShowStudentPending] = useState(false);
    const [showSellerPrompt, setShowSellerPrompt] = useState(false);

    return (
        <aside className="w-full lg:w-56 shrink-0">
            <PendingApprovalModal isOpen={showPending} onClose={() => setShowPending(false)} />
            <StudentVerificationPendingModal isOpen={showStudentPending} onClose={() => setShowStudentPending(false)} />
            <SellerRegistrationPromptModal
                isOpen={showSellerPrompt}
                onClose={() => setShowSellerPrompt(false)}
                isPending={user?.sellerStatus === "pending"}
                isStudent={user?.isStudent}
            />
            <div className="rounded-2xl border border-border dark:border-border/70 bg-card shadow-sm overflow-hidden">
                <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-5 bg-[#FFD700] rounded-none shadow-sm" />
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-foreground">
                            Shortcuts
                        </p>
                    </div>
                </div>
                <div className="px-2 pb-3 space-y-1.5">
                    {ACTIONS.map((action) => {
                        const Icon = action.icon;
                        const isSell = action.id === "sell";
                        const isApproved = user?.sellerStatus === "approved";
                        const isPending = user?.sellerStatus === "pending";

                        // Determine the destination for the sell button
                        let route = action.route;
                        if (isSell) {
                            if (!user) {
                                route = "/login";
                            } else if (isApproved) {
                                route = "/dashboard/products/add"; // verified seller → listing form
                            } else {
                                route = "/register/seller"; // buyer / rejected → seller registration
                            }
                        }

                        // Pending sellers should see the pending modal, not navigate
                        const interceptClick = isSell && isPending;

                        return (
                            <Link
                                key={action.title}
                                href={interceptClick ? "#" : route}
                                onClick={(e) => {
                                    if (interceptClick) {
                                        e.preventDefault();
                                        setShowPending(true);
                                    }
                                }}
                                className="group w-full flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-[#FFD700]/40 hover:bg-secondary/80 bg-secondary/30 dark:bg-card dark:hover:bg-secondary/50 text-foreground"
                            >
                                <span className="h-8 w-8 rounded-md bg-[#FFD700] group-hover:bg-[#FFD700]/90 text-black flex items-center justify-center transition-colors shadow-sm">
                                    <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[12px] font-heading font-semibold text-foreground">
                                        {action.title}
                                    </span>
                                    {isSell && isPending && (
                                        <span className="block text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                                            Pending approval
                                        </span>
                                    )}
                                </span>
                            </Link>
                        );
                    })}

                </div>
            </div>
        </aside>
    );
}
