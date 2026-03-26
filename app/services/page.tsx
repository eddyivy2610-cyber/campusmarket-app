"use client";

import React, { useMemo, useState } from "react";
import { CalendarClock, MapPin, PlusCircle, Send, Wallet } from "lucide-react";
import { BackToHomeBar } from "../components/common/BackToHomeBar";

type ServiceAd = {
    id: string;
    title: string;
    category: string;
    budget: string;
    location: string;
    due: string;
    details: string;
};

const INITIAL_ADS: ServiceAd[] = [
    {
        id: "svc-1",
        title: "Need UI redesign for student startup pitch deck",
        category: "Design",
        budget: "NGN 25,000",
        location: "ABU Main Campus",
        due: "Within 5 days",
        details: "Looking for a designer to refresh 12 slides. Must share one previous campus project.",
    },
    {
        id: "svc-2",
        title: "Math tutor needed for 200-level calculus",
        category: "Tutoring",
        budget: "NGN 6,000 / session",
        location: "Online or Kongo Campus",
        due: "Starts this week",
        details: "Need 3 evening sessions before test week. Prefer someone with strong engineering math background.",
    },
    {
        id: "svc-3",
        title: "Campus laundry pickup and delivery helper",
        category: "Errands",
        budget: "NGN 15,000 weekly",
        location: "Samaru Hostels",
        due: "Ongoing",
        details: "Daily pickup by 6pm. Looking for reliable student helper with references.",
    },
];

export default function ServicesPage() {
    const [ads, setAds] = useState<ServiceAd[]>(INITIAL_ADS);
    const [form, setForm] = useState({
        title: "",
        category: "",
        budget: "",
        location: "",
        due: "",
        details: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const totalAds = useMemo(() => ads.length, [ads]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.category || !form.budget || !form.location || !form.due || !form.details) return;

        const newAd: ServiceAd = {
            id: `svc-${Date.now()}`,
            title: form.title.trim(),
            category: form.category.trim(),
            budget: form.budget.trim(),
            location: form.location.trim(),
            due: form.due.trim(),
            details: form.details.trim(),
        };

        setAds((prev) => [newAd, ...prev]);
        setForm({ title: "", category: "", budget: "", location: "", due: "", details: "" });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-heading">
            <main className="flex-1 px-4 sm:px-6 xl:px-10 py-10 md:py-14">
                <div className="max-w-7xl mx-auto space-y-7">
                    <BackToHomeBar />
                    <section className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Services & Job Requests</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold font-heading tracking-tight mb-3">Post service ads and hire trusted campus talent.</h1>
                        <p className="text-sm text-muted-foreground">Create a job request, set your budget, and receive responses from qualified students.</p>
                    </section>

                    <section className="grid lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg font-bold font-heading">Open Requests</h2>
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{totalAds} ads</span>
                            </div>

                            {ads.map((ad) => (
                                <article key={ad.id} className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-base leading-snug">{ad.title}</h3>
                                            <p className="text-xs font-bold uppercase tracking-widest text-primary mt-1">{ad.category}</p>
                                        </div>
                                        <span className="text-xs font-bold bg-secondary px-2 py-1 rounded-lg">{ad.budget}</span>
                                    </div>

                                    <p className="text-sm text-muted-foreground leading-relaxed">{ad.details}</p>

                                    <div className="flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{ad.location}</span>
                                        <span className="inline-flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" />{ad.due}</span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="lg:col-span-2">
                            <form onSubmit={onSubmit} className="bg-card border border-border/50 rounded-3xl p-6 space-y-4 sticky top-24">
                                <h2 className="text-lg font-bold font-heading flex items-center gap-2"><PlusCircle className="w-5 h-5 text-primary" />Place a job ad</h2>
                                <p className="text-xs text-muted-foreground">All fields are required before submission.</p>

                                {submitted && (
                                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                        Job request posted successfully.
                                    </div>
                                )}

                                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Job title" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
                                <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Category (e.g. tutoring, design)" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
                                <input value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} placeholder="Budget (e.g. NGN 20,000)" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
                                <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Campus / location" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
                                <input value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))} placeholder="Deadline / timeline" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
                                <textarea value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} rows={5} placeholder="Describe exactly what you need..." className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm resize-none" />

                                <button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm inline-flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" /> Submit Request
                                </button>

                                <div className="text-[11px] text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2 inline-flex items-center gap-2">
                                    <Wallet className="w-3.5 h-3.5" />Tip: add a clear budget for faster responses.
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
                    </div>
    );
}
