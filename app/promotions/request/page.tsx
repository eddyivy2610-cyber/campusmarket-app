"use client";

import React, { useMemo, useState } from "react";
import { BadgeCheck, Megaphone, ShieldCheck, WalletCards } from "lucide-react";
import Image from "next/image";
import { Footer } from "../../components/sections/Footer";
import { BackToHomeBar } from "../../components/common/BackToHomeBar";
import { saveHeroBanner } from "../../lib/heroBanners";

const placements = ["Homepage Spotlight", "Category Top Slot", "Search Boost", "Weekend Promo Banner"];

export default function PromotionRequestPage() {
    const [form, setForm] = useState({
        sellerName: "",
        campusEmail: "",
        listingUrl: "",
        placement: placements[0],
        budget: "",
        startDate: "",
        endDate: "",
        objective: "",
        agreed: false,
    });
    const [message, setMessage] = useState<string>("");
    const [bannerPreview, setBannerPreview] = useState<string>("");

    const isValid = useMemo(() => {
        const budgetNumber = Number(form.budget);
        const hasDates = form.startDate && form.endDate && form.endDate >= form.startDate;
        const hasListing = form.listingUrl.includes("/listings/");
        return (
            form.sellerName.trim().length > 1 &&
            form.campusEmail.includes("@") &&
            hasListing &&
            budgetNumber >= 5000 &&
            hasDates &&
            form.objective.trim().length >= 15 &&
            form.agreed
        );
    }, [form]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            setMessage("Please provide valid campaign details before submitting.");
            return;
        }
        if (bannerPreview) {
            saveHeroBanner(bannerPreview);
        }
        setMessage("Promotion request submitted. Review typically completes within 24 hours.");
        setForm({
            sellerName: "",
            campusEmail: "",
            listingUrl: "",
            placement: placements[0],
            budget: "",
            startDate: "",
            endDate: "",
            objective: "",
            agreed: false,
        });
        setBannerPreview("");
    };

    const onBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage("Uploaded file must be an image.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setBannerPreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-heading">
            <main className="flex-1 py-10 md:py-14 px-4 sm:px-6 xl:px-10">
                <div className="max-w-5xl mx-auto space-y-7">
                    <BackToHomeBar />
                    <section className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Ads & Promotions</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold font-heading tracking-tight mb-3">Promote your listing with verified campaign requests.</h1>
                        <p className="text-sm text-muted-foreground">Submit your listing details, preferred placement, and budget. Incomplete or invalid entries are not approved.</p>
                    </section>

                    <section className="grid md:grid-cols-3 gap-4">
                        <div className="bg-card border border-border/50 rounded-2xl p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Requirement</p>
                            <p className="text-sm font-semibold inline-flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary" />Valid listing URL</p>
                        </div>
                        <div className="bg-card border border-border/50 rounded-2xl p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Minimum budget</p>
                            <p className="text-sm font-semibold inline-flex items-center gap-2"><WalletCards className="w-4 h-4 text-primary" />NGN 5,000</p>
                        </div>
                        <div className="bg-card border border-border/50 rounded-2xl p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Review flow</p>
                            <p className="text-sm font-semibold inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" />Manual verification</p>
                        </div>
                    </section>

                    <form onSubmit={onSubmit} className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 space-y-4">
                        <h2 className="text-xl font-bold font-heading inline-flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" />Promotion request form</h2>

                        {message && (
                            <div className={`text-sm font-semibold rounded-xl px-4 py-3 ${message.startsWith("Promotion request submitted") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                                {message}
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">
                            <input value={form.sellerName} onChange={(e) => setForm((f) => ({ ...f, sellerName: e.target.value }))} placeholder="Seller name" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                            <input value={form.campusEmail} onChange={(e) => setForm((f) => ({ ...f, campusEmail: e.target.value }))} placeholder="Campus email" type="email" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                        </div>

                        <input value={form.listingUrl} onChange={(e) => setForm((f) => ({ ...f, listingUrl: e.target.value }))} placeholder="Listing URL (must contain /listings/)" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />

                        <div className="grid sm:grid-cols-3 gap-4">
                            <select value={form.placement} onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm">
                                {placements.map((placement) => (
                                    <option key={placement}>{placement}</option>
                                ))}
                            </select>
                            <input value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} placeholder="Budget (NGN)" type="number" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                            <div className="text-xs text-muted-foreground bg-secondary/40 rounded-xl px-3 py-3">Minimum approved budget: NGN 5,000</div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <input value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} type="date" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                            <input value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} type="date" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Custom Hero Banner (optional)</label>
                            <input type="file" accept="image/*" onChange={onBannerUpload} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                            {bannerPreview && (
                                <Image
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    width={1200}
                                    height={360}
                                    unoptimized
                                    className="w-full h-40 object-cover rounded-xl border border-border/60"
                                />
                            )}
                        </div>

                        <textarea value={form.objective} onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))} rows={5} placeholder="Campaign objective and expected outcome..." className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none" />

                        <label className="flex items-start gap-3 text-sm text-muted-foreground">
                            <input type="checkbox" checked={form.agreed} onChange={(e) => setForm((f) => ({ ...f, agreed: e.target.checked }))} className="mt-1 accent-primary" />
                            <span>I confirm this listing is mine, details are accurate, and I accept ad review and rejection policies.</span>
                        </label>

                        <button type="submit" className="w-full sm:w-auto px-6 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                            Submit Promotion Request
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
