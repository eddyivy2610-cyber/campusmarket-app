"use client";

import React from "react";

interface InViewMountProps {
    children: React.ReactNode;
    placeholder?: React.ReactNode;
    rootMargin?: string;
    once?: boolean;
    className?: string;
}

export function InViewMount({
    children,
    placeholder = null,
    rootMargin = "220px",
    once = true,
    className,
}: InViewMountProps) {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.disconnect();
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { root: null, rootMargin, threshold: 0.01 }
        );

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [once, rootMargin]);

    return (
        <div ref={ref} className={className}>
            {isVisible ? children : placeholder}
        </div>
    );
}
