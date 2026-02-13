"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BlogSpotlight() {
    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                    <span className="text-primary">⭐</span> Spotlight
                </h2>
                <Link href="#" className="font-bold text-sm text-primary hover:underline">
                    View All
                </Link>
            </div>

            <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                {/* Image Side */}
                <div className="w-full md:w-2/5 h-64 md:h-auto bg-secondary relative">
                    {/* <Image 
                        src="/placeholder-spotlight.jpg" 
                        alt="Spotlight" 
                        fill 
                        className="object-cover"
                    /> */}
                </div>

                {/* Content Side */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-600 font-bold text-xs">Interview</span>
                        <span>•</span>
                        <span>Oct 3, 2023</span>
                    </div>

                    <h3 className="text-2xl font-black mb-4 leading-tight">
                        Meet Tyler Williams: The Student Entrepreneur Behind CampusRepair
                    </h3>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                        From fixing his own broken laptop to running a campus-wide tech repair service, Tyler Williams has built an impressive business while maintaining a full course load. In this exclusive interview, he shares his journey, challenges, and advice for aspiring student entrepreneurs.
                    </p>

                    <blockquote className="bg-secondary/50 border-l-4 border-primary pl-4 py-2 mb-6 italic text-sm text-foreground/80">
                        "The marketplace platform gave me visibility I couldn't have achieved on my own. It connected me directly with students who needed my services."
                    </blockquote>

                    <Link href="#" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                        Read Full Story <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
