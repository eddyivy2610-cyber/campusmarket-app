"use client";

import { useState } from "react";
import { ChevronDown, User, Globe, ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import { motion, Variants } from "framer-motion";

export function FAQ() {
    const faqs = [
        {
            question: "What is CampusMarket?",
            answer: "CampusMarket is a dedicated platform for students to buy, sell, and trade items and services within their university community. We make campus commerce safer, faster, and more social.",
            icon: User,
            color: "border-orange-500"
        },
        {
            question: "Is CampusMarket only for my campus?",
            answer: "Yes! CampusMarket is designed to be hyper-local. When you sign up, you'll be connected with other students on your specific campus, making meetups and trades as convenient as possible.",
            icon: Globe,
            color: "border-orange-500"
        },
        {
            question: "How do you ensure trust and safety?",
            answer: "We use university email verification and a community rating system to ensure you're trading with real students. We also recommend meeting in well-lit, public campus areas for all transactions.",
            icon: ShieldCheck,
            color: "border-orange-500"
        },
        {
            question: "Do you handle payments or delivery?",
            answer: "Currently, we facilitate the connection and communication. Payments and delivery are handled directly between the buyer and seller during their meetup. This keeps the platform free and simple.",
            icon: CreditCard,
            color: "border-orange-500"
        },
        {
            question: "Is CampusMarket free to use?",
            answer: "Absolutely! Listing items and browsing on CampusMarket is completely free for all verified students. Our goal is to support the student community.",
            icon: Sparkles,
            color: "border-orange-500"
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <section className="hidden md:block py-10 bg-background overflow-hidden">
            <div className="max-w-[1780px] mx-auto px-4 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 flex flex-col items-center"
                >
                    <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-4 uppercase tracking-tighter">
                        Frequently Asked <span className="text-primary italic">Questions</span>
                    </h2>
                    <p className="text-gray-500 text-sm font-medium max-w-2xl">
                        Everything you need to know about how CampusMarket works.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="space-y-3"
                >
                    {faqs.map((faq, index) => (
                        <motion.div variants={itemVariants} key={index}>
                            <div
                                className={`group bg-secondary border border-border rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'ring-2 ring-primary/20 bg-secondary/80' : 'hover:border-accent/20'}`}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center gap-4 p-4 text-left"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border-l-4 ${faq.color} shrink-0 group-hover:bg-white/10 transition-colors`}>
                                        <faq.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="flex-1 font-bold text-sm text-foreground font-sans tracking-tight uppercase">
                                        {faq.question}
                                    </span>
                                    <div className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    </div>
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="p-4 pt-0 ml-14 text-gray-500 leading-relaxed text-[13px] font-medium border-t border-border mx-4">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
