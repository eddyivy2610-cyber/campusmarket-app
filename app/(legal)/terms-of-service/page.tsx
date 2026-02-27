"use client";

import { motion } from "framer-motion";

export default function TermsOfService() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="text-foreground">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 font-heading tracking-tight">Terms of Service</h1>
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary mb-10 border-b border-border pb-6">Effective Date: March 1, 2025 | Last Updated: March 23, 2025</p>

                <p className="text-sm md:text-base text-muted-foreground font-medium mb-12 leading-relaxed">
                    Welcome to Campus Market, a centralized C2C e-commerce platform designed for the exchange of goods and services within university communities.
                </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">1. Acceptance of Terms</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        These Terms of Use ("Terms," "Agreement," "Policies") constitute a legally binding agreement between you ("User," "you," "your") and Campus Market ("Platform," "we," "us," "our") governing your access to and use of the Campus Market website, mobile applications, and related services (collectively, the "Services").
                    </p>
                    <p className="font-bold text-foreground">
                        By registering for, accessing, or using Campus Market, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
                    </p>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">2. Account Policies & Terminations</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        You agree to provide accurate, current, and complete information during registration. You are solely responsible for maintaining the confidentiality of your credentials and all activities that occur under your account. Campus Market reserves the right to terminate accounts for severe or repeated policy violations, illegal activity, fraud or scams, harassment or threats, impersonation, or unauthorized commercial solicitation.
                    </p>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">3. Platform Role & Limitations of Liability</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        <strong className="text-foreground">Campus Market is an intermediary platform</strong> that facilitates connections between buyers and sellers. We are not a party to any transaction. We do not guarantee the quality, safety, or legality of items, the truth or accuracy of listings, or the ability of users to complete transactions.
                    </p>
                    <div className="bg-secondary/30 p-5 rounded-2xl italic border border-border mt-4">
                        "THE PLATFORM IS PROVIDED 'AS IS' AND 'AS AVAILABLE' WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, CAMPUS MARKET SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES."
                    </div>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">4. Privacy & Data Protection</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        We collect registration information, usage data, and device information to operate the platform and facilitate transactions. We share information with hosting providers, analytics services, and when required by legal obligatons. You have the right to access your personal data, request corrections, and request deletion of your account.
                    </p>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">5. Intellectual Property</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        Campus Market, including all code, design, logos, trademarks, and original content, is owned by Campus Market and protected by intellectual property laws. You retain ownership of content you create and post on Campus Market, but you grant Campus Market a worldwide, royalty-free, perpetual license to host, store, and display the content.
                    </p>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">6. Dispute Resolution & Governing Law</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Before initiating any formal proceeding, you agree to attempt informal resolution by contacting <a href="mailto:disputes@campusmarket.com" className="text-primary hover:underline">disputes@campusmarket.com</a>. Any unresolved dispute shall be resolved by binding arbitration in accordance with the Arbitration and Conciliation Act, Cap A18, Laws of the Federation of Nigeria, 2004, taking place in Zaria, Kaduna State.
                    </p>
                    <p className="font-bold text-foreground mt-4">
                        YOU AND CAMPUS MARKET AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
