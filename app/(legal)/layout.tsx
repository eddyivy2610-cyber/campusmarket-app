import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBasket } from "lucide-react";
import { Footer } from "../components/sections/Footer";

export default function LegalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-secondary/10 font-sans text-foreground">
            <div className="flex-1 py-10 md:py-16 px-4 md:px-8">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-primary">
                                <ShoppingBasket className="w-8 h-8" />
                            </span>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 font-heading tracking-tight">
                                CampusMarket
                            </span>
                        </Link>

                        {/* Back to Home button */}
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors font-heading bg-background px-4 py-2.5 rounded-full border border-border/50 shadow-sm hover:shadow hover:-translate-y-0.5 transform duration-200">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>

                    {/* Content Document */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-14 shadow-sm">
                        {children}
                    </div>
                </div>
            </div>

            {/* Global Footer */}
            <Footer />
        </div>
    );
}
