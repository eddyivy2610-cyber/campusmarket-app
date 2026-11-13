import type { Transition } from "framer-motion";

/**
 * Shared spring presets for Campus Hive UI animations.
 * Respects <MotionConfig reducedMotion="user"> globally.
 */
export const SPRING_SMOOTH: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 26,
  mass: 0.85,
};

export const SPRING_MODAL: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.8,
};

export const SPRING_DRAWER: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 32,
  mass: 0.9,
};

export const SPRING_POPOVER: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 28,
  mass: 0.7,
};

export const VIEWPORT_ONCE = {
  once: true,
  amount: 0.06,
} as const;

/**
 * Generates staggered spring-in-view props for grid cards (products, stores, reviews).
 */
export function cardInViewProps(index: number) {
  return {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: VIEWPORT_ONCE,
    transition: {
      ...SPRING_SMOOTH,
      delay: Math.min((index % 8) * 0.035, 0.24),
    },
  };
}
