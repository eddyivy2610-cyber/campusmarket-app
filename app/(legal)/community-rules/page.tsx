"use client";

import { motion } from "framer-motion";
import { Breadcrumb } from "../../components/common/Breadcrumb";

export default function CommunityRules() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-heading">
            <main className="py-10 md:py-12 px-4 sm:px-6 xl:px-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <Breadcrumb items={[{ label: "Community Rules" }]} />

                    <section className="grid lg:grid-cols-[240px,1fr] gap-6">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Last Updated: March 23, 2025</p>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Community Rules</h1>
                            <p className="text-sm text-muted-foreground">
                                Fostering a safe, trustworthy community for campus commerce starts with all of us. These are the core rules of conduct expected from every user.
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                                <h2 className="text-[13px] font-semibold text-foreground">1. General Conduct</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground marker:text-primary">
                                    <li>Treat others with respect and courtesy at all times.</li>
                                    <li>Communicate honestly and transparently in all your interactions.</li>
                                    <li>Honor your commitments and transaction agreements.</li>
                                    <li>Respect the privacy and personal boundaries of all community members.</li>
                                    <li>Use Campus Market solely for its intended purpose of C2C university commerce.</li>
                                </ul>
                            </motion.div>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                                <h2 className="text-[13px] font-semibold text-foreground">2. Prohibited Behavior</h2>
                                <div className="overflow-x-auto text-sm text-muted-foreground">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead>
                                            <tr className="border-b border-border/50">
                                                <th className="py-3 px-4 text-foreground font-semibold">Category</th>
                                                <th className="py-3 px-4 text-foreground font-semibold">Prohibited Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/20">
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-foreground/80">Fraud</td>
                                                <td className="py-3 px-4">Scams, phishing, fake listings, misrepresentation.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-foreground/80">Harassment</td>
                                                <td className="py-3 px-4">Threats, bullying, stalking, intimidation, or using hate speech.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-foreground/80">Impersonation</td>
                                                <td className="py-3 px-4">Pretending to be another person, vendor, or entity.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-foreground/80">Spam</td>
                                                <td className="py-3 px-4">Unsolicited commercial messages, repetitive postings, or MLMs.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-foreground/80">Manipulation</td>
                                                <td className="py-3 px-4">Fake reviews, rating manipulations, or vote rigging.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                                <h2 className="text-[13px] font-semibold text-foreground">3. Harassment & Bullying (Zero Tolerance)</h2>
                                <p className="text-sm text-muted-foreground">
                                    Campus Market maintains a absolute zero-tolerance policy towards harassment. This includes repeated unwanted contact, threatening language, personal attacks or insults, and unauthorized sharing of personal information (doxxing). <strong className="text-foreground">Verified harassment will result in immediate and permanent account termination.</strong>
                                </p>
                            </motion.div>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                                <h2 className="text-[13px] font-semibold text-foreground">4. Privacy of Others</h2>
                                <p className="text-sm text-muted-foreground">
                                    You may not share the personal information of others without explicit consent. Do not post private contact information, do not photograph or record individuals without permission, and never stalk or track user activity across the platform.
                                </p>
                            </motion.div>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                                <div className="bg-primary/10 p-4 border border-primary/20 text-foreground text-sm">
                                    <p className="font-semibold mb-2">Notice a violation?</p>
                                    <p className="text-xs md:text-sm text-muted-foreground">Help us keep Campus Market safe. If you see someone breaking these rules, please use the report button available on all profiles, listings, and message threads, or contact support directly.</p>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
