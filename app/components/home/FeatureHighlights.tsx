"use client";

import { Truck, ShieldCheck, Headphones, RefreshCw } from "lucide-react";

export function FeatureHighlights() {
    const features = [
        {
            icon: <Truck className="w-6 h-6" />,
            title: "Free Delivery",
            desc: "On campus orders > $50"
        },
        {
            icon: <ShieldCheck className="w-6 h-6" />,
            title: "Secure Payment",
            desc: "100% secure payment"
        },
        {
            icon: <Headphones className="w-6 h-6" />,
            title: "24/7 Support",
            desc: "Dedicated support"
        },
        {
            icon: <RefreshCw className="w-6 h-6" />,
            title: "Easy Returns",
            desc: "Simple return policy"
        }
    ];

    return (
        <div className="py-12 border-b border-border/40">
            <div className="max-w-[1780px] mx-auto px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-4 group cursor-default">
                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colos duration-300 shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold font-heading text-sm uppercase tracking-wide text-foreground">{feature.title}</h3>
                                <p className="text-xs text-muted-foreground font-body mt-0.5">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
