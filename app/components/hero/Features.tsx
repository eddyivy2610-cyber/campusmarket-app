"use client";

import { Store, MessageSquareLock, Sparkles, Headset } from "lucide-react";

export function Features() {
    const features = [
        {
            title: "Shop Local",
            description: "Discover and support creators and sellers in your campus community.",
            icon: Store,
            color: "text-primary",
            bgColor: "bg-primary/10"
        },
        {
            title: "Secure Chat",
            description: "Buy and sell with confidence using our secure, built-in messaging.",
            icon: MessageSquareLock,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10"
        },
        {
            title: "Unique Finds",
            description: "Find one-of-a-kind items that match your unique style and personality.",
            icon: Sparkles,
            color: "text-primary",
            bgColor: "bg-primary/10"
        },
        {
            title: "24/7 Support",
            description: "Contact us anytime you want for any enquiries.",
            icon: Headset,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        }
    ];

    return (
        <section className="relative z-20 -mt-10 pb-8">
            <div className="max-w-[1780px] mx-auto px-4 md:px-12">
                <div className="bg-secondary text-foreground rounded-2xl shadow-2xl p-3 md:p-5 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-2 border border-border">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`flex flex-1 items-center gap-3 p-3 rounded-2xl transition-all duration-300 group ${index !== features.length - 1 ? 'md:border-r border-accent/20' : ''
                                }`}
                        >
                            <div className={`${feature.bgColor} ${feature.color} p-3 rounded-xl transition-transform`}>
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-xs tracking-tight font-sans text-foreground uppercase">{feature.title}</h3>
                                <p className="text-[10px] leading-relaxed text-gray-500 font-medium max-w-[130px]">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
