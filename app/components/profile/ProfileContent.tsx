"use client";

import { Star, MessageSquare, Quote, Flag, ShieldAlert, Sparkles, MapPin, Clock, Calendar } from "lucide-react";
import Image from "next/image";

export function ReviewsSection() {
    const reviews = [
        {
            id: 1,
            user: "Sophie Aminu",
            rating: 5,
            comment: "Super smooth transaction! Lucky was very professional and met me at the Faculty as agreed. The iPhone 13 was exactly as described. Recommended seller!",
            date: "2 days ago",
            tag: "Buyer",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
        },
        {
            id: 2,
            user: "Michael Obi",
            rating: 5,
            comment: "Bought his old study desk. He even helped me carry it to the car! Really cool guy.",
            date: "1 week ago",
            tag: "Buyer",
            image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-secondary/30 rounded-2xl p-6 border border-foreground/5 space-y-4">
                    <h3 className="text-sm font-bold text-foreground">Rating Distribution</h3>

                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-500 w-3">{star}</span>
                                <Star className="w-3 h-3 text-gray-400 fill-current" />
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-foreground/80 rounded-full"
                                        style={{ width: star === 5 ? '85%' : star === 4 ? '10%' : '2%' }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 w-6 text-right">
                                    {star === 5 ? '38' : star === 4 ? '4' : '0'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* List: Review Cards */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between mb-4 border-b border-foreground/5 pb-4">
                    <h3 className="text-base font-bold text-foreground">Recent Feedback</h3>
                    <div className="flex gap-2">
                        <button className="text-xs font-bold text-foreground hover:text-primary transition-colors">Most Recent</button>
                    </div>
                </div>

                <div className="space-y-6">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="relative bg-secondary/20 rounded-2xl p-6 border border-foreground/5 hover:border-foreground/10 transition-all group">
                            <div className="flex gap-4">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <Image src={rev.image} alt={rev.user} fill className="object-cover" />
                                </div>

                                <div className="space-y-2 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">{rev.user}</h4>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-foreground text-foreground" />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500">{rev.date}</span>
                                    </div>

                                    <p className="text-xs text-gray-500 leading-relaxed">"{rev.comment}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function AboutSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="lg:col-span-8 space-y-8">
                <section className="space-y-3">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Bio
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Final year Engineering student. I love gadgets and tech. Always upgrading my gear so you can find my slightly used items here for great prices! Safe campus meetups only.
                    </p>
                </section>

                <div className="h-px bg-foreground/5"></div>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            Meetup Locations
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-foreground bg-secondary/30 p-3 rounded-lg border border-foreground/5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                Faculty of Engineering
                            </li>
                            <li className="flex items-center gap-3 text-sm text-foreground bg-secondary/30 p-3 rounded-lg border border-foreground/5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                Main Gate
                            </li>
                            <li className="flex items-center gap-3 text-sm text-foreground bg-secondary/30 p-3 rounded-lg border border-foreground/5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                ICSA Junction
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Availability
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-foreground bg-secondary/30 p-3 rounded-lg border border-foreground/5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                Weekdays: After 4 PM
                            </li>
                            <li className="flex items-center gap-3 text-sm text-foreground bg-secondary/30 p-3 rounded-lg border border-foreground/5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                Saturdays: All day
                            </li>
                        </ul>
                    </div>
                </section>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-secondary/20 rounded-2xl p-6 border border-foreground/5 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-emerald-500" />
                        Safety First
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                        "I verify all my electronics before selling. Let's meet at the Engineering Faculty for a safe exchange."
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-secondary/50 p-2 rounded">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            No upfront payments
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-secondary/50 p-2 rounded">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Inspect before paying
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
