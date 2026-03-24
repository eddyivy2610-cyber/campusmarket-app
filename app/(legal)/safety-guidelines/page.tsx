"use client";

import { motion } from "framer-motion";
import { Breadcrumb } from "../../components/common/Breadcrumb";

export default function SafetyGuidelines() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-heading">
            <main className="py-10 md:py-12 px-4 sm:px-6 xl:px-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <Breadcrumb items={[{ label: "Safety Guidelines" }]} />

                    <section className="grid lg:grid-cols-[240px,1fr] gap-6">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Last Updated: March 28, 2026</p>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Safety Guidelines</h1>
                            <p className="text-sm text-muted-foreground">
                                Your safety is our absolute priority. Follow these platform recommendations to ensure secure and trustworthy transactions on campus.
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                                <h2 className="text-[13px] font-semibold text-foreground">1. Communication Safety</h2>
                                <p className="text-sm text-muted-foreground">
                                    All communications related to transactions must occur through Campus Hive's built-in messaging system. This helps us protect your personal information and provides a record of the conversation in case a dispute arises.
                                </p>
                                <div className="bg-primary/10 text-primary p-4 border border-primary/20">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider block mb-1">Warning</span>
                                    <p className="text-[11px]">
                                        Moving conversations to external platforms (like WhatsApp or email) before a transaction is completed is strictly prohibited and forfeits your platform protections.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                                <h2 className="text-[13px] font-semibold text-foreground">2. Meeting for Delivery & Pickup</h2>
                                <p className="text-sm text-muted-foreground">Buyers and vendors are responsible for arranging their own delivery or pickup. We strongly recommend:</p>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground marker:text-primary">
                                    <li>Meeting in public, well-lit, highly trafficked locations.</li>
                                    <li>Campus police stations, library lobbies, or student centers are ideal meetup spots.</li>
                                    <li>Bring a friend with you whenever possible.</li>
                                    <li>Inform a roommate or friend of your meeting details (who, what, when, where).</li>
                                    <li>Never invite strangers into your private home or dorm room.</li>
                                </ul>
                            </motion.div>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                                <h2 className="text-[13px] font-semibold text-foreground">3. Payment Best Practices</h2>
                                <p className="text-sm text-muted-foreground">Currently, Campus Hive does not process payments or hold escrow. You are responsible for payment methods. To avoid fraud:</p>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground marker:text-primary">
                                    <li>Prefer in-person cash transactions when meeting safely.</li>
                                    <li>Always inspect an item thoroughly before transferring money.</li>
                                    <li>If using a digital transfer, wait until the money actually hits your real banking app (do not rely solely on screenshot proofs or SMS).</li>
                                    <li>Never send money in advance to a stranger for an item you haven't seen.</li>
                                </ul>
                            </motion.div>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                                <h2 className="text-[13px] font-semibold text-foreground">4. Shipping Items</h2>
                                <p className="text-sm text-muted-foreground">If shipping is arranged instead of a local meetup:</p>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground marker:text-primary">
                                    <li>Use trackable shipping services exclusively.</li>
                                    <li>Agree on shipping cost responsibilities in advance through platform chat.</li>
                                    <li>Document the item condition with photos/video exactly as it was packed before shipping it out.</li>
                                    <li>Always share the tracking information promptly.</li>
                                </ul>
                            </motion.div>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-3">
                                <h2 className="text-[13px] font-semibold text-foreground">5. Dispute Resolution</h2>
                                <p className="text-sm text-muted-foreground">
                                    In the event of a disagreement, try to resolve it directly through open, good-faith negotiation. Maintain records of your listing descriptions, chat histories, payment receipts, and delivery confirmations. If direct resolution fails, you can request platform mediation by submitting a dispute report to our team. Please note that while we act as a neutral mediator, we cannot force payments or financially compensate users directly.
                                </p>
                            </motion.div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
