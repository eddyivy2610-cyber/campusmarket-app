import { ReactNode } from "react";
import { Footer } from "../components/sections/Footer";

export default function LegalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
            <div className="flex-1 py-10 md:py-16 px-4 md:px-8">
                {children}
            </div>

            {/* Global Footer */}
            <Footer />
        </div>
    );
}
