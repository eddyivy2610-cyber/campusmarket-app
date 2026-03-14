"use client";

import { usePathname } from "next/navigation";
import { ScrollToTop } from "./ScrollToTop";
import { CustomerCareButton } from "./CustomerCareButton";

const HIDE_PREFIXES = ["/dashboard"];

export function FloatingActions() {
    const pathname = usePathname() || "";
    const shouldHide = HIDE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (shouldHide) {
        return null;
    }

    return (
        <>
            <ScrollToTop />
            <CustomerCareButton />
        </>
    );
}

