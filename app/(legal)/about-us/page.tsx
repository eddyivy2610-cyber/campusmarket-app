"use client";

import { motion } from "framer-motion";

export default function AboutUs() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="text-foreground">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 font-heading tracking-tight">About Us</h1>
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary mb-10 border-b border-border pb-6">The Campus Market Story</p>

                <p className="text-sm md:text-base text-muted-foreground font-medium mb-12 leading-relaxed">
                    Campus Market was born out of a simple need: creating a safe, centralized, and student-focused marketplace for university communities. We understand the unique challenges and opportunities of campus life.
                </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">Our Mission</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        To empower students by providing a trustworthy platform to buy, sell, and trade goods and services within their local academic ecosystem. We aim to foster a circular campus economy, making college living more affordable, sustainable, and connected.
                    </p>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">What We Do</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <p>
                        We connect buyers and sellers within the same university community. Whether you're looking to sell textbooks from last semester, find affordable dorm furniture, or offer freelance design services, Campus Market provides the dedicated space to do it safely.
                    </p>
                    <ul className="list-disc pl-6 space-y-3 mt-4 marker:text-primary">
                        <li><strong className="text-foreground">C2C Marketplace:</strong> Direct student-to-student commerce.</li>
                        <li><strong className="text-foreground">Verified Users:</strong> Maintaining a trusted environment for local meetups.</li>
                        <li><strong className="text-foreground">Community Hub:</strong> More than just listings, a place to discover campus talent and resources.</li>
                    </ul>
                </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 font-heading">Our Values</h2>
                <div className="text-sm text-muted-foreground space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="bg-secondary/20 p-5 rounded-2xl border border-border">
                            <h3 className="text-base font-bold text-foreground mb-2">Safety First</h3>
                            <p className="text-sm text-muted-foreground">Prioritizing the security of our users in all physical and digital interactions.</p>
                        </div>
                        <div className="bg-secondary/20 p-5 rounded-2xl border border-border">
                            <h3 className="text-base font-bold text-foreground mb-2">Accessibility</h3>
                            <p className="text-sm text-muted-foreground">Creating an intuitive platform that works seamlessly for every student.</p>
                        </div>
                        <div className="bg-secondary/20 p-5 rounded-2xl border border-border">
                            <h3 className="text-base font-bold text-foreground mb-2">Community</h3>
                            <p className="text-sm text-muted-foreground">Building strong local networks and fostering meaningful connections on campus.</p>
                        </div>
                        <div className="bg-secondary/20 p-5 rounded-2xl border border-border">
                            <h3 className="text-base font-bold text-foreground mb-2">Empowerment</h3>
                            <p className="text-sm text-muted-foreground">Giving student entrepreneurs the tools they need to launch and grow.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
