"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface FAQProps {
    question: string;
    answer: string;
}

function FAQItem({ question, answer }: FAQProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-border/20 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{question}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {isOpen && (
                <div className="pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
}

export function HelpSettings() {
    return (
        <div className="max-w-4xl space-y-12 pb-12">
            {/* FAQs Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Frequently Asked Questions</h2>
                </div>

                <div className="divide-y divide-border/20">
                    <FAQItem
                        question="How do I sell my items?"
                        answer="Simply click the 'Sell' button in the navigation bar, upload clear photos of your item, set a fair price, and provide a detailed description. Your listing will go live after a quick verification."
                    />
                    <FAQItem
                        question="How long does verification take?"
                        answer="Most listings and profiles are verified within 2 to 4 hours during business hours. You'll receive a notification as soon as it's approved."
                    />
                    <FAQItem
                        question="Is it safe to meet buyers on campus?"
                        answer="We always recommend meeting in well-lit, public campus areas during daylight hours. Bringing a friend along is also a great safety measure."
                    />
                </div>
            </div>

            {/* Contact Support Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Contact Support</h2>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Topic</label>
                            <div className="relative">
                                <select className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium">
                                    <option>Technical Bug</option>
                                    <option>Account Issue</option>
                                    <option>Reporting a User</option>
                                    <option>Other</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Message</label>
                        <textarea
                            placeholder="Describe your issue..."
                            rows={4}
                            className="w-full bg-muted/30 border-none rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
                        />
                    </div>

                    <button className="w-full lg:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98]">
                        Submit Ticket
                    </button>
                </div>
            </div>

            {/* Support History */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Support History</h2>
                </div>

                <div className="divide-y divide-border/20">
                    {[
                        { id: "#23456", title: "Payment Issue", status: "Resolved", date: "Oct 12, 2025" },
                        { id: "#23412", title: "Verification", status: "Closed", date: "Sep 28, 2025" }
                    ].map((ticket, i) => (
                        <div key={i} className="flex items-center justify-between py-4 group">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-medium">{ticket.id} - {ticket.title}</h4>
                                <p className="text-xs text-muted-foreground">{ticket.date}</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-semibold">{ticket.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
