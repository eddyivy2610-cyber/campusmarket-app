"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Breadcrumb } from "../../components/common/Breadcrumb";

export default function AboutUs() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-heading">
            <main className="py-10 md:py-12 px-4 sm:px-6 xl:px-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <Breadcrumb items={[{ label: "About" }]} />

                    <section className="grid sm:grid-cols-[420px,1fr] gap-8 items-start">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="space-y-5">
                            <div className="border border-border/40 bg-card p-6 space-y-4">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Our Story</h1>
                                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                                    <p>
                                        Campus Market was born out of a simple need: creating a safe, centralized, and student-focused marketplace for university communities. We understand the unique challenges and opportunities of campus life.
                                    </p>
                                    <p>
                                        We connect buyers and sellers within the same university community. Whether you&apos;re looking to sell textbooks from last semester, find affordable dorm furniture, or offer freelance design services, Campus Market provides the dedicated space to do it safely.
                                    </p>
                                    <p>
                                        We aim to foster a circular campus economy, making college living more affordable, sustainable, and connected.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                       
                    </section>

                    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { value: "10.5k", label: "Sellers active our site" },
                            { value: "33k", label: "Monthly Product Sale" },
                            { value: "45.5k", label: "Customer active in our site" },
                            { value: "25k", label: "Annual gross sale in our site" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="border border-border/40 bg-card p-4 text-center"
                            >
                                <div className="text-xl font-extrabold text-foreground">{stat.value}</div>
                                <p className="text-[10px] mt-1 text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </main>
        </div>
    );
}
