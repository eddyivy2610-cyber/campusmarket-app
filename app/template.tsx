"use client";

import { Suspense } from "react";
import { PageTransition } from "./components/common/PageTransition";
import { GlobalLoader } from "./components/common/GlobalLoader";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<GlobalLoader />}>
            <PageTransition>{children}</PageTransition>
        </Suspense>
    );
}
