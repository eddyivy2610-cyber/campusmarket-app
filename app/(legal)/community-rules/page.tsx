"use client";

import { motion } from "framer-motion";

export default function CommunityRules() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="text-foreground">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 font-heading tracking-tight">Community Rules</h1>
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary mb-10 border-b border-border pb-6">Last Updated: March 23, 2025</p>

                <p className="text-sm md:text-base text-muted-foreground font-medium mb-12 leading-relaxed">
                    Fostering a safe, trustworthy community for campus commerce starts with all of us. These are the core rules of conduct expected from every user.
                </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">1. General Conduct</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <ul className="list-disc pl-6 space-y-3 mt-4 marker:text-primary">
                        <li>Treat others with respect and courtesy at all times.</li>
                        <li>Communicate honestly and transparently in all your interactions.</li>
                        <li>Honor your commitments and transaction agreements.</li>
                        <li>Respect the privacy and personal boundaries of all community members.</li>
                        <li>Use Campus Market solely for its intended purpose of C2C university commerce.</li>
                    </ul>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">2. Prohibited Behavior</h2>
                <div className="overflow-x-auto text-sm text-muted-foreground">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className="py-3 px-4 text-foreground font-bold">Category</th>
                                <th className="py-3 px-4 text-foreground font-bold">Prohibited Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            <tr>
                                <td className="py-3 px-4 font-bold text-foreground/80">Fraud</td>
                                <td className="py-3 px-4">Scams, phishing, fake listings, misrepresentation.</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 font-bold text-foreground/80">Harassment</td>
                                <td className="py-3 px-4">Threats, bullying, stalking, intimidation, or using hate speech.</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 font-bold text-foreground/80">Impersonation</td>
                                <td className="py-3 px-4">Pretending to be another person, vendor, or entity.</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 font-bold text-foreground/80">Spam</td>
                                <td className="py-3 px-4">Unsolicited commercial messages, repetitive postings, or MLMs.</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 font-bold text-foreground/80">Manipulation</td>
                                <td className="py-3 px-4">Fake reviews, rating manipulations, or vote rigging.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">3. Harassment & Bullying (Zero Tolerance)</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        Campus Market maintains a absolute zero-tolerance policy towards harassment. This includes repeated unwanted contact, threatening language, personal attacks or insults, and unauthorized sharing of personal information (doxxing). <strong className="text-foreground">Verified harassment will result in immediate and permanent account termination.</strong>
                    </p>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">4. Privacy of Others</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        You may not share the personal information of others without explicit consent. Do not post private contact information, do not photograph or record individuals without permission, and never stalk or track user activity across the platform.
                    </p>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 mt-6 text-foreground text-sm">
                    <p className="font-bold mb-2">Notice a violation?</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Help us keep Campus Market safe. If you see someone breaking these rules, please use the report button available on all profiles, listings, and message threads, or contact support directly.</p>
                </div>
            </motion.div>
        </div>
    );
}
