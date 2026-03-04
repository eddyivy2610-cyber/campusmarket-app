import { LifeBuoy, MessageCircle, ShieldAlert, Wrench } from "lucide-react";
import { Footer } from "../components/sections/Footer";
import Link from "next/link";
import { BackToHomeBar } from "../components/common/BackToHomeBar";

const supportTopics = [
    { label: "Technical issue", icon: Wrench },
    { label: "Report a user", icon: ShieldAlert },
    { label: "Account support", icon: LifeBuoy },
    { label: "General question", icon: MessageCircle },
];

export default function HelpSupportPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-heading">

            <main className="flex-1 py-10 md:py-14 px-4 sm:px-6 xl:px-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <BackToHomeBar />
                    <section className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="mb-10 border-b border-border pb-4">
                            <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary">Help & Support</p>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 font-heading tracking-tight">Tell us what you need.</h1>
                        <p className="text-sm md:text-base text-muted-foreground font-medium mb-12 leading-relaxed">
                            Use the forms below to ask product questions, report account problems, or share marketplace concerns.
                            Our support team usually responds within one business day.
                        </p>
                    </section>

                    <section className="grid lg:grid-cols-2 gap-6">
                        <form className="bg-card border border-border/50 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">General query form</h2>
                            <p className="text-sm text-muted-foreground space-y-4">For how-to questions, listing guidance, or general platform support.</p>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <input type="text" placeholder="Full name" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                <input type="email" placeholder="Campus email" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <input type="text" placeholder="Subject" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />

                            <textarea rows={5} placeholder="Describe your question..." className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />

                            <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-95 transition-opacity">
                                Send query
                            </button>
                        </form>

                        <form className="bg-card border border-border/50 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">Issue escalation form</h2>
                            <p className="text-sm text-muted-foreground">For failed transactions, safety incidents, and urgent account access issues.</p>

                            <div className="grid grid-cols-2 gap-3">
                                {supportTopics.map((topic) => (
                                    <label key={topic.label} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:border-primary/40 transition-colors">
                                        <input type="radio" name="topic" className="accent-primary" />
                                        <topic.icon className="w-4 h-4 text-primary" />
                                        <span>{topic.label}</span>
                                    </label>
                                ))}
                            </div>

                            <input type="text" placeholder="Order or ticket reference (optional)" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />

                            <textarea rows={5} placeholder="Give us the details and timeline..." className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />

                            <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-95 transition-opacity">
                                Submit escalation
                            </button>
                        </form>
                    </section>

                    <section className="grid md:grid-cols-3 gap-4">
                        <Link href="/services" className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/40 transition-colors">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Services Board</p>
                            <h3 className="font-bold text-foreground">Post a job or service request</h3>
                            <p className="text-sm text-muted-foreground mt-2">Create service ads and find students for tasks.</p>
                        </Link>
                        <Link href="/promotions/request" className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/40 transition-colors">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Promotions</p>
                            <h3 className="font-bold text-foreground">Request listing promotion</h3>
                            <p className="text-sm text-muted-foreground mt-2">Submit valid listing and campaign details for review.</p>
                        </Link>
                        <Link href="/help-center/chat-room" className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/40 transition-colors">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Live Help</p>
                            <h3 className="font-bold text-foreground">Open Help Center Chat</h3>
                            <p className="text-sm text-muted-foreground mt-2">Join support rooms and chat with moderators.</p>
                        </Link>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
