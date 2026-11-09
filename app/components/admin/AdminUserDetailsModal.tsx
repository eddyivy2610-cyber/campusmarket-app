"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseModal, ModalSection, ModalDetailItem, ModalActionButton } from "../common/BaseModal";
import AdminSuspendUserModal from "./AdminSuspendUserModal";
import StatusBadge from "./StatusBadge";
import { apiPatch } from "@/lib/apiClient";
import {
    User,
    Mail,
    Calendar,
    Shield,
    GraduationCap,
    Store,
    AlertTriangle,
    ShieldAlert,
    Clock,
    Ban,
    UserCheck,
    Award,
    ExternalLink,
    CheckCircle2,
    XCircle,
} from "lucide-react";

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUpdated?: () => void;
}

export default function AdminUserDetailsModal({
    isOpen,
    onClose,
    user,
    onUpdated,
}: UserDetailsModalProps) {
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [actionFeedback, setActionFeedback] = useState<string | null>(null);
    const [warnOpen, setWarnOpen] = useState(false);
    const [warnMessage, setWarnMessage] = useState("");

    if (!user) return null;

    const ownedStores: any[] = Array.isArray(user.ownedStores) ? user.ownedStores : [];
    const storesCount = typeof user.storesCount === "number" ? user.storesCount : ownedStores.length;
    const isSeller = user.role === "seller" || storesCount > 0 || user.isSeller;
    const displayName =
        user.fullName || user.profile?.displayName || user.name || user.email || "Unnamed User";
    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : user.joined || "N/A";

    const runAction = async (payload: Record<string, any>) => {
        try {
            setIsBusy(true);
            setActionFeedback(null);
            const res: any = await apiPatch(`admin/users/${user._id}`, payload);
            if (res?.data) {
                Object.assign(user, res.data);
            }
            setActionFeedback(res?.message || "Action applied.");
            onUpdated?.();
        } catch (err: any) {
            setActionFeedback(err?.message || "Failed to execute administrative action.");
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <>
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                title={`Private User Identity: ${displayName}`}
                icon={<User className="w-5 h-5" />}
                footer={
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-border bg-card text-foreground font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all active:scale-95 shadow-sm"
                    >
                        Close Profile
                    </button>
                }
            >
                {/* Top Profile Summary */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-[28px] bg-primary/10 flex items-center justify-center text-2xl sm:text-3xl font-black text-primary border-2 border-primary/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] shrink-0 overflow-hidden">
                        {user.profile?.avatar ? (
                            <img src={user.profile.avatar} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            displayName.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="space-y-1.5 flex flex-col items-center sm:items-start">
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5">
                            <h3 className="text-2xl font-black text-foreground tracking-tight">{displayName}</h3>
                            <StatusBadge status={user.accountStatus || "Active"} />
                        </div>
                        <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2 opacity-80">
                            <Mail className="w-4 h-4 text-primary/60" />
                            {user.email}
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1.5 pt-1.5">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Joined {joinedDate}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Onboarding: {user.onboardingStep || "completed"}
                            </span>
                        </div>
                    </div>
                </div>

                {actionFeedback && (
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs font-bold text-foreground">
                        {actionFeedback}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Private Account Details Section */}
                    <ModalSection title="Private Account Identity (Admin View)" icon={<Shield className="w-3.5 h-3.5" />}>
                        <div className="space-y-3.5">
                            <ModalDetailItem
                                label="User ID"
                                value={`CPM-${user._id?.slice(-8).toUpperCase() || "00000000"}`}
                            />
                            <ModalDetailItem
                                label="Account Role"
                                value={<span className="capitalize font-bold">{user.role || "user"}</span>}
                            />
                            <ModalDetailItem
                                label="Verification Badges"
                                value={
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        {user.emailVerified && (
                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-blue-500/20">
                                                Email Verified
                                            </span>
                                        )}
                                        {user.studentVerified ? (
                                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-500/20">
                                                Verified Student
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded-lg text-[9px] font-black uppercase tracking-wider border border-border">
                                                Unverified Student
                                            </span>
                                        )}
                                        {isSeller && (
                                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-amber-500/20">
                                                Store Owner ({storesCount}/3)
                                            </span>
                                        )}
                                    </div>
                                }
                            />
                            <ModalDetailItem
                                label="Legal / Full Name"
                                value={user.fullName || user.name || "Not provided"}
                            />
                            <ModalDetailItem
                                label="Phone / WhatsApp"
                                value={user.profile?.phone || user.profile?.whatsapp || user.phone || "No phone added"}
                            />
                            <ModalDetailItem
                                label="Campus & Department"
                                value={`${user.campus || "Not specified"}${user.profile?.department ? ` • ${user.profile.department}` : ""}${user.profile?.level ? ` (${user.profile.level}L)` : ""}`}
                                icon={<GraduationCap className="w-4 h-4" />}
                            />
                            {user.suspensionReason && (
                                <ModalDetailItem
                                    label="Suspension / Ban Reason"
                                    value={<span className="text-rose-500 font-semibold">{user.suspensionReason}</span>}
                                />
                            )}
                        </div>
                    </ModalSection>

                    {/* Owned Stores Section (Multi-Store Cap = 3) */}
                    <ModalSection
                        title={`Owned Stores (${storesCount} / 3 Max)`}
                        icon={<Store className="w-3.5 h-3.5" />}
                    >
                        {ownedStores.length > 0 ? (
                            <div className="space-y-3">
                                {ownedStores.map((st: any) => (
                                    <div
                                        key={st._id}
                                        className="p-3.5 rounded-2xl bg-secondary/20 border border-border/60 flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-foreground truncate">
                                                    {st.storeName}
                                                </p>
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-secondary text-muted-foreground">
                                                    {st.storeType === "student_store" ? "Student" : "Business"}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                        st.status === "active"
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : "bg-amber-500/10 text-amber-500"
                                                    }`}
                                                >
                                                    {st.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                /{st.slug} • {st.metrics?.listingsCount || 0} active listings •{" "}
                                                {st.metrics?.rating || 0}★ ({st.metrics?.reviewsCount || 0})
                                            </p>
                                        </div>
                                        {st.slug && (
                                            <Link
                                                href={`/stores/${st.slug}`}
                                                target="_blank"
                                                className="p-2 rounded-xl bg-card border border-border hover:border-primary text-muted-foreground hover:text-foreground shrink-0"
                                                title="Open Storefront"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center bg-secondary/20 rounded-3xl border border-dashed border-border/60">
                                <Store className="w-10 h-10 text-muted-foreground/20 mb-3" />
                                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
                                    No Active Stores (0 / 3)
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1 px-4 font-medium">
                                    This private account is currently used only for buying.
                                </p>
                            </div>
                        )}
                    </ModalSection>
                </div>

                {/* Warning Composer */}
                {warnOpen && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Send Official Moderation Warning
                        </p>
                        <textarea
                            value={warnMessage}
                            onChange={(e) => setWarnMessage(e.target.value)}
                            placeholder="State the community guideline violation clearly..."
                            className="w-full rounded-xl bg-background border border-border p-3 text-xs min-h-[75px] outline-none"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setWarnOpen(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isBusy || !warnMessage.trim()}
                                onClick={async () => {
                                    await runAction({ action: "warn", reason: warnMessage.trim() });
                                    setWarnMessage("");
                                    setWarnOpen(false);
                                }}
                                className="px-4 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold disabled:opacity-50"
                            >
                                Send Warning
                            </button>
                        </div>
                    </div>
                )}

                {/* Admin Actions Section */}
                <ModalSection title="Administrative Privileges & Cascades" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                        <ModalActionButton
                            icon={<AlertTriangle className="w-4 h-4" />}
                            label="Send Warning"
                            color="hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30"
                            onClick={() => setWarnOpen(!warnOpen)}
                        />

                        {user.studentVerified ? (
                            <ModalActionButton
                                icon={<XCircle className="w-4 h-4" />}
                                label="Revoke Student Badge"
                                color="hover:bg-rose-500/10 hover:text-rose-500"
                                onClick={() =>
                                    runAction({
                                        action: "revoke_verification",
                                        reason: "Student verification revoked by administrator.",
                                    })
                                }
                            />
                        ) : (
                            <ModalActionButton
                                icon={<CheckCircle2 className="w-4 h-4" />}
                                label="Verify Student Status"
                                color="hover:bg-emerald-500/10 hover:text-emerald-500"
                                onClick={() =>
                                    runAction({
                                        action: "approve",
                                        reason: "Student status verified by administrator.",
                                    })
                                }
                            />
                        )}

                        {user.accountStatus === "suspended" || user.accountStatus === "banned" ? (
                            <ModalActionButton
                                icon={<UserCheck className="w-4 h-4" />}
                                label="Restore Account & Cascade"
                                color="bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={() =>
                                    runAction({
                                        action: "restore",
                                        reason: "Account restored by administrator.",
                                    })
                                }
                            />
                        ) : (
                            <ModalActionButton
                                icon={<Ban className="w-4 h-4" />}
                                label="Suspend Account"
                                color="bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20"
                                onClick={() => setIsSuspendModalOpen(true)}
                            />
                        )}

                        {user.accountStatus !== "banned" && (
                            <ModalActionButton
                                icon={<ShieldAlert className="w-4 h-4" />}
                                label="Permanent Ban"
                                color="hover:bg-rose-600 hover:text-white border-rose-500/30 text-rose-500"
                                onClick={() =>
                                    runAction({
                                        action: "ban",
                                        reason: "Permanently banned by platform administrator.",
                                    })
                                }
                            />
                        )}

                        {user.role !== "admin" ? (
                            <ModalActionButton
                                icon={<Award className="w-4 h-4" />}
                                label="Promote to Admin"
                                color="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                onClick={() =>
                                    runAction({
                                        action: "role_change",
                                        role: "admin",
                                        reason: "Promoted to platform administrator.",
                                    })
                                }
                            />
                        ) : (
                            <ModalActionButton
                                icon={<Award className="w-4 h-4" />}
                                label="Demote to User"
                                color="hover:bg-secondary"
                                onClick={() =>
                                    runAction({
                                        action: "role_change",
                                        role: "user",
                                        reason: "Admin privileges removed.",
                                    })
                                }
                            />
                        )}
                    </div>
                </ModalSection>
            </BaseModal>

            <AdminSuspendUserModal
                isOpen={isSuspendModalOpen}
                onClose={() => setIsSuspendModalOpen(false)}
                user={user}
                onConfirm={async (data) => {
                    const effectiveReason = [data.reason, data.notes].filter(Boolean).join(" — ");
                    await runAction({
                        action: data.duration === "permanent" ? "ban" : "suspend",
                        reason: effectiveReason,
                    });
                    setIsSuspendModalOpen(false);
                    onClose();
                }}
            />
        </>
    );
}
