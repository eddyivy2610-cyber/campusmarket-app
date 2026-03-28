"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import AdminSuspendUserModal from "./AdminSuspendUserModal";
import { 
    X, 
    User, 
    Mail, 
    Calendar, 
    Shield, 
    MapPin, 
    Phone, 
    GraduationCap, 
    BarChart3, 
    AlertTriangle, 
    ArrowUpRight,
    Search,
    ShieldAlert,
    Clock,
    UserCheck,
    Trash2,
    Ban,
    Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "./StatusBadge";

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function AdminUserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    if (!user) return null;

    const isSeller = user.role === "Vendor" || user.type === "Vendor Candidate" || user.isSeller;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold font-heading">User Profile: {user.name}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                            
                            {/* Top Profile Summary */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-primary/10 flex items-center justify-center text-xl sm:text-2xl font-bold text-primary border-2 border-primary/20 shadow-inner shrink-0">
                                    {user.avatar || user.name.charAt(0)}
                                </div>
                                <div className="space-y-1 flex flex-col items-center sm:items-start">
                                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                                        <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
                                        <StatusBadge status={user.status || "Active"} />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {user.email}
                                    </p>
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 pt-1">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Joined {user.joined || user.date || "N/A"}
                                        </span>
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Last login: Today
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Account Details Section */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2 flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> Account Details
                                    </h3>
                                    <div className="space-y-3.5">
                                        <DetailItem label="User ID" value={`USR-${user.id || '0000'}-ABCDE`} />
                                        <DetailItem label="User Type" value={user.role || user.type || "Student"} />
                                        <DetailItem 
                                            label="Badges" 
                                            value={
                                                <div className="flex items-center gap-1.5 pt-0.5">
                                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold">🛒 [50]</span>
                                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold">✓ Verified</span>
                                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold">🎓</span>
                                                </div>
                                            } 
                                        />
                                        <DetailItem label="Student Status" value="Yes - Active" />
                                        <DetailItem label="Phone" value="+234 801 234 5678" />
                                        <DetailItem label="Location" value="Zaria, Nigeria" />
                                        <DetailItem
                                            label="School"
                                            value={user.schoolName || user.department || "University of Lagos"}
                                            icon={<GraduationCap className="w-3.5 h-3.5" />}
                                        />
                                    </div>
                                </div>

                                {/* Statistics Section */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2 flex items-center gap-2">
                                        <BarChart3 className="w-3 h-3" /> Statistics
                                    </h3>
                                    
                                    {isSeller ? (
                                        <div className="space-y-3.5">
                                            <DetailItem label="Listings" value="24 total (18 active, 4 sold, 2 pending)" />
                                            <DetailItem label="Orders" value="52 completed (12 this month)" />
                                            <DetailItem label="Reviews" value="4.8 ★ (142 reviews)" />
                                            <DetailItem label="Reports" value="0 against user, 1 filed by user" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center bg-secondary/20 rounded-2xl border border-dashed border-border">
                                            <BarChart3 className="w-8 h-8 text-muted-foreground/20 mb-2" />
                                            <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">No stats available</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">User is not registered as a seller</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Admin Actions Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2 flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3" /> Admin Actions
                                </h3>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <ActionButton icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Send Warning" color="hover:bg-amber-500/10 hover:text-amber-500" />
                                    <ActionButton 
                                        icon={<Ban className="w-3.5 h-3.5" />} 
                                        label="Suspend Account" 
                                        color="hover:bg-rose-500/10 hover:text-rose-500" 
                                        onClick={() => setIsSuspendModalOpen(true)}
                                    />
                                    <ActionButton icon={<UserCheck className="w-3.5 h-3.5" />} label="Verify Documents" color="hover:bg-primary/10 hover:text-primary" />
                                    <ActionButton icon={<Award className="w-3.5 h-3.5" />} label="Remove Badges" color="hover:bg-indigo-500/10 hover:text-indigo-500" />
                                    <ActionButton icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete Account" color="hover:bg-red-500 hover:text-white" isDanger />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border border-border bg-card text-foreground font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all active:scale-95 shadow-sm"
                            >
                                Close Profile
                            </button>
                        </div>
                    </motion.div>
                </div>

                <AdminSuspendUserModal 
                    isOpen={isSuspendModalOpen}
                    onClose={() => setIsSuspendModalOpen(false)}
                    user={user}
                    onConfirm={(data) => {
                        console.log("Suspension confirmed:", data);
                        // Handle suspension logic here
                    }}
                />
                </>
            )}
        </AnimatePresence>
    );
}

function DetailItem({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="group/item">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-0.5">{label}</p>
            <div className="flex items-center gap-2">
                {icon && <span className="text-primary/60">{icon}</span>}
                <div className="text-sm font-bold text-foreground group-hover/item:text-primary transition-colors">
                    {value}
                </div>
            </div>
        </div>
    );
}

function ActionButton({ icon, label, color, isDanger, onClick }: { icon: React.ReactNode; label: string; color: string; isDanger?: boolean; onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-border/60 transition-all active:scale-95 shadow-sm",
                color,
                isDanger ? "hover:border-red-500" : "hover:border-border"
            )}
        >
            {icon}
            {label}
        </button>
    );
}
