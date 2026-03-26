"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react";

type VerifyState = "loading" | "success" | "invalid";

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string | undefined;
    const [state, setState] = useState<VerifyState>("loading");

    useEffect(() => {
        if (!token) {
            setState("invalid");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch("/api/auth/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                if (!res.ok) {
                    setState("invalid");
                    return;
                }

                setState("success");
                setTimeout(() => router.replace("/login"), 1200);
            } catch {
                setState("invalid");
            }
        };

        verify();
    }, [router, token]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 p-6 md:p-8 shadow-sm text-center font-heading">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center bg-secondary/40 border border-border/60">
                    {state === "loading" && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
                    {state === "success" && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                    {state === "invalid" && <XCircle className="w-6 h-6 text-red-500" />}
                </div>

                <h1 className="text-lg md:text-xl font-bold mb-2">
                    {state === "loading" && "Verifying Email..."}
                    {state === "success" && "Email Verified"}
                    {state === "invalid" && "Verification Failed"}
                </h1>

                <p className="text-sm text-muted-foreground mb-6">
                    {state === "loading" && "Please wait while we confirm your verification token."}
                    {state === "success" && "Your email is verified. Redirecting you to sign in..."}
                    {state === "invalid" && "This verification link is invalid or expired."}
                </p>

                <div className="flex flex-col gap-2">
                    {state !== "loading" && (
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
                        >
                            <MailCheck className="w-4 h-4" />
                            Go to Login
                        </Link>
                    )}
                    {state === "invalid" && (
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors"
                        >
                            Create Account
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
