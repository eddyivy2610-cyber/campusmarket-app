"use client";

import { motion } from "framer-motion";

export default function UsagePolicy() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="text-foreground">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 font-heading tracking-tight">Usage Policy</h1>
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary mb-10 border-b border-border pb-6">Last Updated: March 23, 2025</p>

                <p className="text-sm md:text-base text-muted-foreground font-medium mb-12 leading-relaxed">
                    This document outlines the operational rules for using Campus Market, including eligibility, account types, and how you may list and review items.
                </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">1. User Eligibility</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <ul className="list-disc pl-6 space-y-3 mt-4 marker:text-primary">
                        <li>You must be at least 18 years old to register.</li>
                        <li>Campus Market is designed for university communities within Nigeria.</li>
                        <li>You must have the legal capacity to enter into binding contracts.</li>
                    </ul>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">2. Account Types</h2>
                <div className="space-y-6 mt-4">
                    <div className="bg-secondary/20 p-5 rounded-2xl border border-border">
                        <h3 className="text-base font-bold text-foreground mb-2">Guest Accounts</h3>
                        <p className="text-sm text-muted-foreground">Can view the homepage and limited listings, but cannot message other users, view full details, save items, or create listings.</p>
                    </div>
                    <div className="bg-secondary/20 p-5 rounded-2xl border border-border">
                        <h3 className="text-base font-bold text-foreground mb-2">Buyer Accounts</h3>
                        <p className="text-sm text-muted-foreground">Can view all listings, message vendors, save and share listings, customize profiles, receive notifications, and leave reviews after purchasing.</p>
                    </div>
                    <div className="bg-secondary/20 p-5 rounded-2xl border border-border">
                        <h3 className="text-base font-bold text-foreground mb-2">Vendor Accounts</h3>
                        <p className="text-sm text-muted-foreground">Have all buyer privileges plus the ability to create and manage listings, earn badges and certifications, view performance metrics, and create ads.</p>
                    </div>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">3. Listing Policies</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        Only verified vendors with approved accounts may create listings. Vendors are subject to tier-based listing limits (from 20 up to unlimited active listings based on sales volume).
                    </p>
                    <h3 className="text-base font-bold text-foreground mt-6 mb-3">Prohibited & Restricted Items</h3>
                    <p>Listings must not include:</p>
                    <ul className="list-disc pl-6 space-y-3 mt-4 marker:text-primary">
                        <li><strong className="text-foreground">Illegal Items:</strong> Drugs, weapons, stolen goods, counterfeit items, or prescription meds.</li>
                        <li><strong className="text-foreground">Dangerous Items:</strong> Hazardous materials, recalled products, or tobacco/alcohol for minors.</li>
                        <li><strong className="text-foreground">Inappropriate Content:</strong> Pornography, hate speech, or violent material.</li>
                        <li><strong className="text-foreground">Prohibited Services:</strong> Academic dishonesty (essay writing), illegal services, escort services, or gambling.</li>
                    </ul>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">4. Reviews & Ratings</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        Only users who have completed a verified transaction may leave a <strong className="text-foreground">single review</strong> for that specific item and vendor.
                    </p>
                    <ul className="list-disc pl-6 space-y-3 mt-4 marker:text-primary">
                        <li>Reviews must be honest, accurate, respectful, and focused on the transaction.</li>
                        <li>Fake, paid, revenge, or duplicate reviews will be removed.</li>
                        <li>Vendors may publicly respond to reviews within 30 days in a respectful and professional manner.</li>
                        <li>Rating manipulation (soliciting positive reviews, offering incentives) is strictly prohibited and can result in account suspension.</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
}
