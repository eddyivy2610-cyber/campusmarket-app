"use client";

import { ShieldCheck, TrendingUp, Info, Camera, BarChart3, Trash2, CheckCircle, EyeOff } from "lucide-react";
import type { DashboardProductRow } from "./DashboardProductsTable";
import { ModalSection, ModalActionButton } from "../common/BaseModal";
import { useState, useEffect } from "react";

export interface EditListingCardProps {
    listing: DashboardProductRow & {
        title?: string;
        description?: string;
        images?: string[];
        [key: string]: any;
    };
    onChange: (data: any) => void;
}

export function EditListingCard({ listing, onChange }: EditListingCardProps) {
    const [formData, setFormData] = useState({
        title: listing.title || listing.name || "",
        price: listing.price || 0,
        category: listing.category || "",
        condition: listing.condition || "Used",
        location: listing.location || "Campus",
        description: listing.description || "",
    });

    useEffect(() => {
        onChange(formData);
    }, [formData]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const statSections = [
        { label: "Views", value: listing.views || 0, icon: <TrendingUp className="w-3 h-3" /> },
        { label: "Messages", value: listing.messages || 0, icon: <Info className="w-3 h-3" /> },
        { label: "Offers", value: listing.offers || 0, icon: <Info className="w-3 h-3" /> },
        { label: "Orders", value: listing.orders || 0, icon: <BarChart3 className="w-3 h-3" /> },
    ];

    return (
        <div className="space-y-10">
            {/* Basic Info Section */}
            <ModalSection title="Basic Information" icon={<Info className="w-3.5 h-3.5" />}>
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Product Title</label>
                        <input
                            className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="Enter product title..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Price (NGN)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₦</span>
                                <input
                                    type="number"
                                    className="w-full bg-muted/30 border border-border/50 rounded-2xl pl-10 pr-5 py-3.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={formData.price}
                                    onChange={(e) => handleChange("price", Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Condition</label>
                            <select 
                                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                value={formData.condition}
                                onChange={(e) => handleChange("condition", e.target.value)}
                            >
                                <option value="New">New</option>
                                <option value="Used">Used</option>
                                <option value="Refurbished">Refurbished</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Category</label>
                            <input
                                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Location</label>
                            <input
                                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={formData.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </ModalSection>

            {/* Photos Section */}
            <ModalSection title="Product Media" icon={<Camera className="w-3.5 h-3.5" />}>
                <div className="flex flex-wrap gap-4">
                    {listing.images?.map((img: string, idx: number) => (
                        <div key={idx} className="group relative aspect-square w-24 rounded-2xl border border-border/50 bg-muted/20 overflow-hidden shadow-sm">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="p-1.5 bg-red-500 rounded-full text-white shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button className="aspect-square w-24 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <div className="p-2 bg-card rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <Camera className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">Add Photo</span>
                    </button>
                </div>
            </ModalSection>

            {/* Description Section */}
            <ModalSection title="Description" icon={<Info className="w-3.5 h-3.5" />}>
                <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/40 leading-relaxed"
                    placeholder="Enter detailed description..."
                />
            </ModalSection>

            {/* Performance Statistics */}
            <ModalSection title="Insights & Performance" icon={<TrendingUp className="w-3.5 h-3.5" />}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {statSections.map((item) => (
                        <div key={item.label} className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:border-primary/20 transition-colors">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary mb-2">
                                {item.icon}
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{item.label}</p>
                            <p className="text-xl font-black text-foreground tracking-tight">{item.value}</p>
                        </div>
                    ))}
                </div>
            </ModalSection>

            {/* Management Actions */}
            <ModalSection title="Listing Management" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ModalActionButton 
                        icon={<CheckCircle className="w-4 h-4" />} 
                        label="Mark as Sold" 
                        color="hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30"
                    />
                    <ModalActionButton 
                        icon={<EyeOff className="w-4 h-4" />} 
                        label="Hide Listing" 
                        color="hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30"
                    />
                    <ModalActionButton 
                        icon={<Trash2 className="w-4 h-4" />} 
                        label="Delete" 
                        isDanger 
                    />
                </div>
            </ModalSection>
        </div>
    );
}
