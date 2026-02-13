"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BlogHero() {
    return (
        <section className="mb-12">
            <Link href="#" className="group block relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Background Image Placeholder */}
                <div className="absolute inset-0 bg-gray-200">
                    <div className="w-full h-full bg-gradient-to-t from-black/80 via-black/20 to-transparent absolute z-10" />
                    {/* <Image 
                        src="/placeholder-blog-hero.jpg" 
                        alt="Hero Article" 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    /> */}
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-4xl font-black text-secondary-foreground/20 uppercase tracking-widest">
                        Featured Article Image
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full md:max-w-3xl">
                    <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full mb-4">
                        Campus Life
                    </span>
                    <div className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                        <span>Oct 15, 2023</span>
                        <span>•</span>
                        <span>5 min read</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight group-hover:text-primary-foreground transition-colors">
                        10 Hidden Study Spots on Campus You Need to Discover
                    </h1>
                    <p className="text-gray-200 text-lg mb-6 line-clamp-2 md:line-clamp-3">
                        Tired of fighting for a seat at the main library? We've scouted the entire campus to find those perfect quiet corners where you can focus without distractions.
                    </p>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden" />
                        <div>
                            <p className="text-white font-bold text-sm">Emma Thompson</p>
                            <p className="text-gray-400 text-xs">Senior Editor</p>
                        </div>
                        <span className="ml-auto inline-flex items-center gap-2 text-white font-bold hover:text-primary transition-colors">
                            Read Article <ArrowRight className="w-4 h-4" />
                        </span>
                    </div>
                </div>
            </Link>
        </section>
    );
}
