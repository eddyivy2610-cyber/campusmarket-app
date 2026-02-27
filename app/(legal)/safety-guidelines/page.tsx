"use client";

import { motion } from "framer-motion";

export default function SafetyGuidelines() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="text-foreground">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 font-heading tracking-tight">Safety Guidelines</h1>
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary mb-10 border-b border-border pb-6">Last Updated: March 23, 2025</p>

                <p className="text-sm md:text-base text-muted-foreground font-medium mb-12 leading-relaxed">
                    Your safety is our absolute priority. Follow these platform recommendations to ensure secure and trustworthy transactions on campus.
                </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">1. Communication Safety</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        All communications related to transactions must occur through Campus Market's built-in messaging system. This helps us protect your personal information and provides a record of the conversation in case a dispute arises.
                    </p>
                    <div className="bg-red-500/10 text-red-500 p-5 rounded-2xl border border-red-500/20 mt-6">
                        <strong className="font-bold flex items-center gap-2 mb-1">Warning:</strong>
                        Moving conversations to external platforms (like WhatsApp or email) before a transaction is completed is strictly prohibited and forfeits your platform protections.
                    </div>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">2. Meeting for Delivery & Pickup</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>Buyers and vendors are responsible for arranging their own delivery or pickup. We strongly recommend:</p>
                    <ul className="list-disc pl-6 space-y-3 mt-4 marker:text-primary">
                        <li>Meeting in public, well-lit, highly trafficked locations.</li>
                        <li>Campus police stations, library lobbies, or student centers are ideal meetup spots.</li>
                        <li>Bring a friend with you whenever possible.</li>
                        <li>Inform a roommate or friend of your meeting details (who, what, when, where).</li>
                        <li>Never invite strangers into your private home or dorm room.</li>
                    </ul>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">3. Payment Best Practices</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>Currently, Campus Market does not process payments or hold escrow. You are responsible for payment methods. To avoid fraud:</p>
                    <ul className="list-disc pl-6 space-y-3 mt-4 marker:text-primary">
                        <li>Prefer in-person cash transactions when meeting safely.</li>
                        <li>Always inspect an item thoroughly before transferring money.</li>
                        <li>If using a digital transfer, wait until the money actually hits your real banking app (do not rely solely on screenshot proofs or SMS).</li>
                        <li>Never send money in advance to a stranger for an item you haven't seen.</li>
                    </ul>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">4. Shipping Items</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>If shipping is arranged instead of a local meetup:</p>
                    <ul className="list-disc pl-6 space-y-3 mt-4 marker:text-primary">
                        <li>Use trackable shipping services exclusively.</li>
                        <li>Agree on shipping cost responsibilities in advance through platform chat.</li>
                        <li>Document the item condition with photos/video exactly as it was packed before shipping it out.</li>
                        <li>Always share the tracking information promptly.</li>
                    </ul>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">5. Dispute Resolution</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        In the event of a disagreement, try to resolve it directly through open, good-faith negotiation. Maintain records of your listing descriptions, chat histories, payment receipts, and delivery confirmations. If direct resolution fails, you can request platform mediation by submitting a dispute report to our team. Please note that while we act as a neutral mediator, we cannot force payments or financially compensate users directly.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
