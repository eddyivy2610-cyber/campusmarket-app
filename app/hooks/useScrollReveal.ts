"use client";

import { useEffect } from 'react';

export function useScrollReveal() {
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Once animated, we don't need to observe it anymore
                    // observer.unobserve(entry.target); 
                }
            });
        }, observerOptions);

        const scrollElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        scrollElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);
}
