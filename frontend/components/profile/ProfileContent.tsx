"use client";

import { Star, MessageSquare, Quote, Flag, ShieldAlert, Sparkles, MapPin, Clock } from "lucide-react";
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
                <div className="bg-secondary rounded-[2rem] p-8 border border-foreground/10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Success Rate</h3>
                    </div>

                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-4">
                                <div className="flex items-center gap-1 w-8">
                                    <span className="text-[10px] font-black text-foreground">{star}</span>
                                    <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                                </div>
                                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: star === 5 ? '85%' : star === 4 ? '10%' : '2%' }}
                                    ></div>
                                </div>
                                <span className="text-[9px] font-black text-gray-500 w-6">
                                    {star === 5 ? '38' : star === 4 ? '4' : '0'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 flex flex-col items-center text-center">
                        <div className="bg-white/10 p-3 rounded-full mb-4">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight mb-2">Campus Star Seller</h4>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Lucky has maintained a 4.9+ rating for over 6 months with perfectly safe meetups.</p>
                    </div>
                </div>

                <div className="bg-red-500/5 rounded-[1.5rem] p-5 border border-red-500/10 flex items-center justify-between group cursor-pointer hover:bg-red-500/10 transition-all">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        <span className="text-[10px] font-black text-red-500/80 uppercase tracking-widest">Report this profile</span>
                    </div>
                    <Flag className="w-4 h-4 text-red-500/50 group-hover:text-red-500 transition-colors" />
                </div>
            </div>

            {/* List: Review Cards */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Community <span className="text-primary italic">Feedback</span></h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-secondary rounded-xl text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">All</button>
                        <button className="px-4 py-2 bg-secondary rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 border border-foreground/10">Positive</button>
                    </div>
                </div>

                <div className="space-y-6">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="relative bg-secondary/50 rounded-[2rem] p-8 border border-foreground/10 hover:border-primary/20 transition-all group overflow-hidden">
                            <Quote className="absolute -top-4 -right-4 w-32 h-32 text-primary/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

                            <div className="relative flex gap-6">
                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-xl shrink-0">
                                    <Image src={rev.image} alt={rev.user} fill className="object-cover" />
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-base font-black text-foreground uppercase tracking-tight">{rev.user}</h4>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                                <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md">{rev.tag}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{rev.date}</span>
                                    </div>

                                    <p className="text-sm font-medium text-gray-400 leading-relaxed italic">"{rev.comment}"</p>

                                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest border-t border-foreground/10 pt-4">
                                        <button className="hover:text-primary transition-colors flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            <span>Reply</span>
                                        </button>
                                        <button className="hover:text-primary transition-colors">Helpful (12)</button>
                                    </div>
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
            <div className="lg:col-span-8 space-y-10">
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Bio</h3>
                    </div>
                    <p className="text-base text-gray-400 leading-relaxed font-medium">
                        Final year Engineering student at UniAbuja. I love gadgets and tech. Always upgrading my gear so you can find my slightly used items here for great prices! Safe campus meetups only.
                    </p>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Trade Preferences</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-secondary/50 rounded-2xl p-6 border border-foreground/10 space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <MapPin className="w-5 h-5" />
                                <h4 className="text-[11px] font-black uppercase tracking-widest">Preferred Meetups</h4>
                            </div>
                            <ul className="space-y-2">
                                <li className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                                    Faculty of Engineering (Common Room)
                                </li>
                                <li className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                                   Main Gate
                                </li>
                                <li className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                                    ICSA Junction
                                </li>
                            </ul>
                        </div>

                        <div className="bg-secondary/50 rounded-2xl p-6 border border-foreground/10 space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <Clock className="w-5 h-5" />
                                <h4 className="text-[11px] font-black uppercase tracking-widest">Availability</h4>
                            </div>
                            <ul className="space-y-2">
                                <li className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                                    Weekdays: After 4 PM
                                </li>
                                <li className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                                    Saturdays: All day
                                </li>
                                <li className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                                    Sundays: By appointment
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-secondary rounded-[2rem] p-8 border border-foreground/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                    <div className="relative space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <ShieldAlert className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Safety Protocol</h3>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
                            "I always recommend meeting in open, well-lit campus areas. Feel free to bring a friend!"
                        </p>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-widest">
                                <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono">1</div>
                                <span>No upfront payments</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-widest">
                                <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono">2</div>
                                <span>Inspect item carefully</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-widest">
                                <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono">3</div>
                                <span>Physical cash or transfer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
