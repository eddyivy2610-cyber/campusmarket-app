"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { registerAdmin } from "@/lib/adminAuth";

export default function AdminSignUpPage() {
    const router = useRouter();
    const [form, setForm] = React.useState({
        email: "",
        username: "",
        password: "",
        key: "",
    });
    const [error, setError] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        await new Promise((r) => setTimeout(r, 300));

        const result = registerAdmin(form);
        setIsSubmitting(false);
        if (!result.ok) {
            setError(result.error);
            return;
        }

        router.push("/admin/auth/sign-in");
    };

    return (
        <main className="min-h-screen bg-background text-foreground font-heading flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl shadow-sm p-6 sm:p-7">
                <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Admin Suite</p>
                    <h1 className="text-2xl font-extrabold tracking-tight">Create Admin Account</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Requires valid email, username, password, and admin key.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-3.5">
                    <Field
                        icon={Mail}
                        type="email"
                        placeholder="admin@campusmarket.com"
                        value={form.email}
                        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                    />
                    <Field
                        icon={User}
                        placeholder="username"
                        value={form.username}
                        onChange={(v) => setForm((f) => ({ ...f, username: v }))}
                    />
                    <Field
                        icon={Lock}
                        type="password"
                        placeholder="password (min 8 chars)"
                        value={form.password}
                        onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                    />
                    <Field
                        icon={KeyRound}
                        type="password"
                        placeholder="admin key"
                        value={form.key}
                        onChange={(v) => setForm((f) => ({ ...f, key: v }))}
                    />

                    {error && <p className="text-xs font-bold text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        {isSubmitting ? "Creating..." : "Create Admin Account"}
                    </button>
                </form>

                <p className="text-sm text-muted-foreground mt-5 text-center">
                    Already registered?{" "}
                    <Link href="/admin/auth/sign-in" className="font-bold text-primary inline-flex items-center gap-1">
                        Sign in <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </p>
            </div>
        </main>
    );
}

function Field({
    icon: Icon,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
}) {
    return (
        <div className="relative">
            <Icon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-11 rounded-xl border border-border/50 bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/50"
            />
        </div>
    );
}
