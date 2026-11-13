"use client";

import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

export function SmoothScroll({ children }: { children: ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
