"use client";

import { motion } from "framer-motion";
import { SPRING_SMOOTH } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_SMOOTH}
            className="w-full flex-1 flex flex-col"
        >
            {children}
        </motion.div>
    );
}
