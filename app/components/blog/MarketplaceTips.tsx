"use client";

import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";
import Image from "next/image";

interface Tip {
    id: string;
    title: string;
    description: string;
    tag: string;
    tagColor: string;
    author: string;
    date: string;
    reads: number;
    comments: number;
}

const TIPS: Tip[] = [
    {
        id: "1",
        title: "How to Price Your Used Textbooks for Maximum Profit",
        description: "Learn the art of pricing your used textbooks to sell quickly while still making a good return. Our experts breakdown the depreciation curve.",
        tag: "Selling",
        tagColor: "bg-amber-100 text-amber-700",
        author: "Alex Johnson",
        date: "Oct 8, 2023",
        reads: 782,
        comments: 45
    },
    {
        id: "2",
        title: "Stay Safe: Red Flags to Watch for When Buying Used Electronics",
        description: "Protect yourself from scams and faulty products when purchasing used electronics on campus. A comprehensive checklist for buyers.",
        tag: "Safety",
        tagColor: "bg-red-100 text-red-600",
        author: "Maya Patel",
        date: "Oct 5, 2023",
        reads: 936,
        comments: 62
    }
];

export function MarketplaceTips() {
    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                    <span className="text-primary">🏪</span> Marketplace Tips
                </h2>
                <Link href="#" className="font-bold text-sm text-primary hover:underline">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TIPS.map((tip) => (
                    <Link key={tip.id} href="#" className="flex flex-col group bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className="h-40 bg-secondary relative">
                            {/* <Image src="/placeholder-tip.jpg" alt={tip.title} fill className="object-cover" /> */}
                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-white/90 shadow-sm backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
                                <span className={tip.tagColor.split(" ")[1]}>{tip.tag}</span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                                {tip.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                {tip.description}
                            </p>

                            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-secondary" />
                                    <span className="font-medium text-foreground">{tip.author}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {tip.reads}</span>
                                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {tip.comments}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
