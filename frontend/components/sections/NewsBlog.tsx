"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

export function NewsBlog() {
    const posts = [
        {
            title: "Abu announces matriculation ceremony date, gown hire procedure for 2025-2026 session",
            date: "10 June 2024",
            tag: "News",
            image: "https://myschool.ng/image_file/blog/MN4CHMjL7nzY3jcKSZh8cabMyzmVy2fNJ4DRZVwt.jpg?width=700&height=300",
        },
        {
            title: "ABU Update on commencement of course registration",
            date: "10 June 2024",
            tag: "News",
            image: "https://myschool.ng/image_file/blog/Q0mbOhFHQr3zEENW2tmI7mnuK2ZghYXypGFGmsVK.jpg?width=700&height=300",
        },
        {
            title: "Top 10 places to get great meals around campus",
            date: "10 June 2024",
            tag: "Blog",
            image: "https://images.unsplash.com/photo-1583258292688-d5003988ac21?auto=format&fit=crop&q=80&w=800",
        },
        {
            title: "How to make the most of your campus market experience",
            date: "10 June 2024",
            tag: "Updates",
            image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
        }
    ];

    return (
        <section className="py-10 bg-background">
            <div className="max-w-[1780px] mx-auto px-4 md:px-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-sans font-black text-foreground uppercase tracking-tighter">
                        Latest <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg">News & Blog</span>
                    </h2>
                    <div className="flex gap-1.5">
                        <button className="p-2 rounded-lg bg-secondary text-gray-500 hover:text-white border border-white/5 hover:border-white/10 transition-all shadow-lg active:scale-95">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-secondary text-gray-500 hover:text-white border border-white/5 hover:border-white/10 transition-all shadow-lg active:scale-95">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {posts.map((post, index) => (
                        <div key={index} className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-white/5 shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-secondary/90 backdrop-blur-md text-foreground px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-xl">
                                        {post.tag}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500 text-[10px] font-black uppercase font-sans tracking-wide">{post.date}</span>
                                    <div className="h-px flex-1 bg-white/5"></div>
                                </div>
                                <h3 className="text-sm font-black text-foreground font-sans leading-tight group-hover:text-emerald-400 transition-colors line-clamp-2 uppercase tracking-tight">
                                    {post.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
