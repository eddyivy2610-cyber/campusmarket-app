"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BaseModal, ModalSection, ModalDetailItem, ModalActionButton } from "../common/BaseModal";
import AdminSuspendUserModal from "./AdminSuspendUserModal";
import StatusBadge from "./StatusBadge";
import { 
    User, 
    Mail, 
    Calendar, 
    Shield, 
    GraduationCap, 
    BarChart3, 
    AlertTriangle, 
    ShieldAlert,
    Clock,
    Ban,
    UserCheck,
    Award,
    Trash2
} from "lucide-react";

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function AdminUserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    if (!user) return null;

    const isSeller = user.role === "seller" || user.role === "Vendor" || user.isSeller;
    const displayName = user.profile?.displayName || user.name || "Unnamed User";
    const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : (user.joined || user.date || "N/A");

    return (
        <>
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                title={`User Profile: ${displayName}`}
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
                        {user.profile?.avatar ? <img src={user.profile.avatar} className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
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
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Joined {joinedDate}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Active: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Recently"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Account Details Section */}
                    <ModalSection title="Account Details" icon={<Shield className="w-3.5 h-3.5" />}>
                        <div className="space-y-4">
                            <ModalDetailItem label="User ID" value={`CPM-${user._id?.slice(-8).toUpperCase() || '00000000'}`} />
                            <ModalDetailItem label="User Type" value={<span className="capitalize">{user.role || "buyer"}</span>} />
                            <ModalDetailItem 
                                label="Badges" 
                                value={
                                    <div className="flex items-center gap-2 pt-1">
                                        {user.isVerified && <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-500/20">Verified</span>}
                                        {user.studentStatus?.isStudent && <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-amber-500/20">Student</span>}
                                    </div>
                                } 
                            />
                            <ModalDetailItem label="Full Name" value={user.personalDetails?.fullName || "Not provided"} />
                            <ModalDetailItem label="Phone" value={user.personalDetails?.phones?.[0] || user.phone || "No phone added"} />
                            <ModalDetailItem label="Location" value={user.personalDetails?.address || "No address provided"} />
                            <ModalDetailItem
                                label="School / Institution"
                                value={user.studentStatus?.schoolName || user.schoolName || "Not specified"}
                                icon={<GraduationCap className="w-4 h-4" />}
                            />
                        </div>
                    </ModalSection>

                    {/* Statistics Section */}
                    <ModalSection title="Statistics" icon={<BarChart3 className="w-3.5 h-3.5" />}>
                        {isSeller ? (
                            <div className="space-y-4">
                                <ModalDetailItem label="Listings" value={`${user.activeListingsCount || 0} active, ${user.soldItemsCount || 0} sold`} />
                                <ModalDetailItem label="Rating" value={`${user.rating?.average || 0} ★ (${user.rating?.count || 0} reviews)`} />
                                <ModalDetailItem label="Followers" value={user.businessProfile?.followersCount || 0} />
                                <ModalDetailItem label="Activity" value="High Engagement" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center bg-secondary/20 rounded-3xl border border-dashed border-border/60">
                                <BarChart3 className="w-10 h-10 text-muted-foreground/10 mb-3" />
                                <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">No seller stats</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1 px-4 font-medium italic">This account is primarily used for buying</p>
                            </div>
                        )}
                    </ModalSection>
                </div>

                {/* Admin Actions Section */}
                <ModalSection title="Admin Actions" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
                    <div className="flex flex-wrap gap-3 pt-1">
                        <ModalActionButton icon={<AlertTriangle className="w-4 h-4" />} label="Send Warning" color="hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30" />
                        <ModalActionButton 
                            icon={<Ban className="w-4 h-4" />} 
                            label="Suspend Account" 
                            color="hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30" 
                            onClick={() => setIsSuspendModalOpen(true)}
                        />
                        <ModalActionButton icon={<UserCheck className="w-4 h-4" />} label="Verify" color="hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30" />
                        <ModalActionButton icon={<Award className="w-4 h-4" />} label="Badge" color="hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-500/30" />
                        <ModalActionButton icon={<Trash2 className="w-4 h-4" />} label="Delete" color="bg-red-500 text-white hover:bg-red-600 border-transparent shadow-red-500/20" isDanger />
                    </div>
                </ModalSection>
            </BaseModal>

            <AdminSuspendUserModal 
                isOpen={isSuspendModalOpen}
                onClose={() => setIsSuspendModalOpen(false)}
                user={user}
                onConfirm={(data) => {
                    console.log("Suspension confirmed:", data);
                }}
            />
        </>
    );
}
