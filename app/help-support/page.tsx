import { PhoneCall, Mail } from "lucide-react";
import { Footer } from "../components/sections/Footer";
import { Breadcrumb } from "../components/common/Breadcrumb";

export default function HelpSupportPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-heading">
            <main className="flex-1 py-10 md:py-12 px-4 sm:px-6 xl:px-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <Breadcrumb items={[{ label: "Contact" }]} />

                    <section className="grid lg:grid-cols-[240px,1fr] gap-6">
                        <div className="border border-border/40 bg-card p-5 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                        <PhoneCall className="w-4 h-4" />
                                    </span>
                                    <h2 className="text-sm font-semibold">Call To Us</h2>
                                </div>
                                <p className="text-[11px] text-muted-foreground">We are available 24/7, 7 days a week.</p>
                                <p className="text-[11px] text-muted-foreground">Phone: +8801611112222</p>
                            </div>

                            <div className="h-px bg-border/40" />

                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </span>
                                    <h2 className="text-sm font-semibold">Write To Us</h2>
                                </div>
                                <p className="text-[11px] text-muted-foreground">Fill out our form and we will contact you within 24 hours.</p>
                                <p className="text-[11px] text-muted-foreground">Emails: customer@exclusive.com</p>
                                <p className="text-[11px] text-muted-foreground">Emails: support@exclusive.com</p>
                            </div>
                        </div>

                        <form className="border border-border/40 bg-card p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input type="text" placeholder="Your Name *" className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                <input type="email" placeholder="Your Email *" className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                <input type="text" placeholder="Your Phone *" className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <textarea rows={6} placeholder="Your Message" className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            <div className="flex justify-end">
                                <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground text-[12px] font-semibold shadow-sm hover:opacity-90 transition-colors">
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
