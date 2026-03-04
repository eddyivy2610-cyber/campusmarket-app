"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, LogIn, UserCircle2 } from "lucide-react";
import { getAdminSession, signInAdmin } from "@/lib/adminAuth";

export default function AdminSignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") || "/admin";

    const [identity, setIdentity] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        const session = getAdminSession();
        if (session) {
            router.replace(nextPath);
        }
    }, [nextPath, router]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        await new Promise((r) => setTimeout(r, 250));

        const result = signInAdmin(identity, password);
        setIsSubmitting(false);
        if (!result.ok) {
            setError(result.error);
            return;
        }
        router.push(nextPath);
    };

    return (
        <main className="min-h-screen bg-background text-foreground font-heading flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl shadow-sm p-6 sm:p-7">
                <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Admin Suite</p>
                    <h1 className="text-2xl font-extrabold tracking-tight">Admin Sign In</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Sign in with username or email plus password.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-3.5">
                    <div className="relative">
                        <UserCircle2 className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={identity}
                            onChange={(e) => setIdentity(e.target.value)}
                            placeholder="username or email"
                            className="w-full h-11 rounded-xl border border-border/50 bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/50"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                            className="w-full h-11 rounded-xl border border-border/50 bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/50"
                        />
                    </div>

                    {error && <p className="text-xs font-bold text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <LogIn className="w-4 h-4" />
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-sm text-muted-foreground mt-5 text-center">
                    Need an admin account?{" "}
                    <Link href="/admin/auth/sign-up" className="font-bold text-primary inline-flex items-center gap-1">
                        Sign up <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </p>
            </div>
        </main>
    );
}
