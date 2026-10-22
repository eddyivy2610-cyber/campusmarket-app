"use client";

import { PhoneCall, Store, PackageCheck, SearchCheck, Building2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { PendingApprovalModal } from "../modals/PendingApprovalModal";
import { StudentVerificationPendingModal } from "../modals/StudentVerificationPendingModal";
import { SellerRegistrationPromptModal } from "../modals/SellerRegistrationPromptModal";
import { MVP_FEATURE_FLAGS } from "../../config/mvpFeatures";

const BASE_ACTIONS = [
    {
        id: "sell",
        title: "Sell on Campus Hive",
        icon: Store,
        route: "/dashboard/products/add",
    },
    {
        id: "wanted",
        title: "Looking For (Wanted)",
        icon: SearchCheck,
        route: "/wanted",
    },
    {
        id: "stores",
        title: "Student & Local Stores",
        icon: Building2,
        route: "/stores",
    },
    {
        id: "faqs",
        title: "FAQs & Safety",
        icon: PhoneCall,
        route: "/settings/help",
    },
    ...(MVP_FEATURE_FLAGS.COURIER_PACKAGE_DELIVERY
        ? [
              {
                  id: "send-packages",
                  title: "Send Your Packages",
                  icon: PackageCheck,
                  route: "/coming-soon",
              },
          ]
        : []),
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
                    {BASE_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        const isSell = action.id === "sell";
                        // PRD 3.1.1: Regular verified students can sell without a separate vendor account
                        const isEligibleToSell =
                            user?.sellerStatus === "approved" ||
                            (MVP_FEATURE_FLAGS.REGULAR_STUDENT_SELLING_ALLOWED &&
                                (user?.studentVerified || user?.isStudent));
                        const isPending = user?.sellerStatus === "pending";

                        let route = action.route;
                        if (isSell) {
                            if (!user) {
                                route = "/dashboard/products/add";
                            } else if (isEligibleToSell) {
                                route = "/dashboard/products/add";
                            } else {
                                route = "/onboarding/seller";
                            }
                        }

                        const interceptClick = isSell && isPending && !isEligibleToSell;

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
                                <span className="h-8 w-8 rounded-md bg-[#FFD700] group-hover:bg-[#FFD700]/90 text-black flex items-center justify-center transition-colors shadow-sm shrink-0">
                                    <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[12px] font-heading font-semibold text-foreground truncate">
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
