"use client";

import { ShoppingBag, MessageSquare, Zap, Users } from "lucide-react";
import { motion, Variants } from "framer-motion";

export function FeatureHighlights() {
    const features = [
        { icon: <ShoppingBag className="w-6 h-6" />, title: "Listings", desc: "Buy & sell anything" },
        { icon: <MessageSquare className="w-6 h-6" />, title: "Chat", desc: "Negotiate in real-time" },
        { icon: <Zap className="w-6 h-6" />, title: "Real-time Updates", desc: "Instant notifications" },
        { icon: <Users className="w-6 h-6" />, title: "Community", desc: "Trusted campus network" },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        // Hidden on mobile — shown only on md+ screens
        <div className="hidden md:block py-12 border-b border-border/40">
            <div className="max-w-[1780px] mx-auto px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    className="grid grid-cols-4 gap-8"
                >
                    {features.map((feature, idx) => (
                        <motion.div variants={itemVariants} key={idx} className="flex items-center gap-4 group cursor-default">
                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold font-heading text-sm uppercase tracking-wide text-foreground">{feature.title}</h3>
                                <p className="text-xs text-muted-foreground font-body mt-0.5">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
