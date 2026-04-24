"use client";

import React, { ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string; // e.g., "max-w-2xl"
    className?: string;
}

export function BaseModal({
    isOpen,
    onClose,
    title,
    icon,
    children,
    footer,
    maxWidth = "max-w-2xl",
    className,
}: BaseModalProps) {
    // Prevent scrolling when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
                        className={cn(
                            "relative w-full bg-card border border-border/50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]",
                            maxWidth,
                            className
                        )}
                    >
                        {/* Header */}
                        {title && (
                            <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-muted/20 backdrop-blur-xl relative z-10">
                                <div className="flex items-center gap-3.5">
                                    {icon && (
                                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/5">
                                            {icon}
                                        </div>
                                    )}
                                    <h2 className="text-lg font-black font-heading tracking-tight text-foreground truncate">
                                        {title}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-secondary/80 rounded-full transition-all text-muted-foreground hover:text-foreground active:scale-90 border border-transparent hover:border-border/50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {!title && (
                             <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 p-2 hover:bg-secondary/80 rounded-full transition-all text-muted-foreground hover:text-foreground active:scale-90 border border-transparent hover:border-border/50"
                             >
                                 <X className="w-5 h-5" />
                             </button>
                        )}

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar relative z-0">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-6 py-5 border-t border-border/40 bg-muted/20 backdrop-blur-xl flex justify-end gap-3 relative z-10">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function ModalSection({ title, children, icon, className }: { title: string; children: ReactNode; icon?: ReactNode; className?: string }) {
    return (
        <div className={cn("space-y-4", className)}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 border-b border-border/40 pb-2.5 flex items-center gap-2">
                {icon} {title}
            </h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

export function ModalDetailItem({ label, value, icon, className }: { label: string; value: ReactNode; icon?: ReactNode; className?: string }) {
    return (
        <div className={cn("group/item", className)}>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-center gap-2.5">
                {icon && <span className="text-primary/70">{icon}</span>}
                <div className="text-sm font-bold text-foreground group-hover/item:text-primary transition-colors duration-200">
                    {value}
                </div>
            </div>
        </div>
    );
}

export function ModalActionButton({ 
    icon, 
    label, 
    color = "hover:bg-primary/10 hover:text-primary", 
    isDanger, 
    onClick, 
    disabled 
}: { 
    icon?: ReactNode; 
    label: string; 
    color?: string; 
    isDanger?: boolean; 
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-border/60 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
                color,
                isDanger ? "hover:border-red-500 hover:bg-red-500/10 hover:text-red-600" : "hover:border-primary/20"
            )}
        >
            {icon}
            {label}
        </button>
    );
}
