"use client";

import Link from "next/link";
import { Clock, Eye, MessageCircle } from "lucide-react";
import Image from "next/image";

interface Article {
    id: string;
    title: string;
    description: string;
    category: string;
    categoryColor: string;
    author: string;
    date: string;
    reads: number;
    comments: number;
    image?: string;
}

const ARTICLES: Article[] = [
    {
        id: "1",
        title: "5 Ways to Transform Your Hostel Room on a Budget",
        description: "Turn your standard-issue hostel room into a personalized haven without breaking the bank. Our top tips for maximizing space and style.",
        category: "Dorm Life",
        categoryColor: "bg-blue-100 text-blue-600",
        author: "Blessing John",
        date: "Oct 12, 2023",
        reads: 423,
        comments: 18,
    },
    {
        id: "2",
        title: "Fall Festival Highlights: What You Missed Last Weekend",
        description: "From amazing performances to delicious food trucks, this year's Fall Festival was one for the books. Check out our photo recap.",
        category: "Events",
        categoryColor: "bg-green-100 text-green-600",
        author: "Jason Miller",
        date: "Oct 10, 2023",
        reads: 651,
        comments: 32,
    },
];

export function BlogFeatureGrid() {
    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                    <span className="text-primary">🎓</span> Campus Life
                </h2>
                <Link href="#" className="font-bold text-sm text-primary hover:underline">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {ARTICLES.map((article) => (
                    <Link key={article.id} href="#" className="group block bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm hover:shadow-md transition-all">
                        {/* Image Placeholder */}
                        <div className="h-48 bg-secondary relative">
                            {/* <Image src={article.image || "/placeholder.jpg"} alt={article.title} fill className="object-cover" /> */}
                            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 shadow-sm backdrop-blur-sm">
                                <span className={article.categoryColor.split(" ")[1]}>{article.category}</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="font-bold text-xl mb-3 leading-tight group-hover:text-primary transition-colors">
                                {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                                {article.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-secondary" />
                                    <div className="text-xs">
                                        <p className="font-bold text-foreground">{article.author}</p>
                                        <p className="text-muted-foreground">{article.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" /> {article.reads}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="w-3.5 h-3.5" /> {article.comments}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
