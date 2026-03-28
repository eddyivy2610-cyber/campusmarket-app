

"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError("Please enter both email and password");
            return;
        }

        setIsLoading(true);
        try {
            const response: any = await apiPost("api/auth/login", {
                email: formData.email,
                password: formData.password,
            });

            const token = response?.token || response?.data?.token;
            if (token) {
                localStorage.setItem("campus_token", token);
            }

            const userData =
                response?.user ||
                response?.data?.user ||
                response?.data;

            if (userData) {
                login({
                    id: userData._id || userData.userId || "user",
                    name: userData.profile?.displayName || userData.name || formData.email,
                    email: userData.email || formData.email,
                    role: userData.role === "seller" ? "pro" : "user",
                });
            }

            router.push("/home");
        } catch (err: any) {
            setError(err?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background">
            <div className="flex items-start justify-center px-4 pt-10 md:pt-14 pb-8">
                <div className="mx-auto flex w-full max-w-[1040px] flex-col overflow-hidden md:flex-row md:border md:border-border/40 md:rounded-xl md:shadow-sm md:min-h-[620px]">
                    <div className="hidden w-full items-center justify-center bg-[#cfe5eb] p-7 md:flex md:w-1/2 md:p-10">
                        <div className="w-full max-w-[420px]">
                            <img
                                src="/mobile.png"
                                alt="Shopping illustration"
                                className="h-auto w-full object-contain"
                            />
                        </div>
                    </div>

                    <div className="flex w-full items-center justify-center bg-background px-8 py-10 md:w-1/2 md:px-14">
                        <div className="w-full max-w-[380px] font-heading">
                            <h1 className="text-2xl font-semibold text-foreground">Log in to Campus Hive</h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Welcome back to Campus Hive.
                            </p>

                            <form onSubmit={handleLogin} className="mt-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                                        Email or Phone Number
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value });
                                            setError("");
                                        }}
                                        placeholder="jane.smith@gmail.com"
                                        className="w-full border-b border-border bg-transparent pb-2 text-base font-medium outline-none placeholder:text-muted-foreground/40 focus:border-primary/60"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => {
                                                setFormData({ ...formData, password: e.target.value });
                                                setError("");
                                            }}
                                            placeholder="********"
                                            className="w-full border-b border-border bg-transparent pb-2 pr-8 text-base font-medium outline-none placeholder:text-muted-foreground/40 focus:border-primary/60"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

                                <div className="flex items-center gap-4 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="inline-flex items-center justify-center rounded-md bg-primary px-7 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition hover:bg-primary/90"
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
                                    </button>
                                    <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                                        Forget Password?
                                    </Link>
                                </div>

                                <p className="pt-4 text-sm font-medium text-muted-foreground">
                                    New here?{" "}
                                    <Link href="/register" className="font-semibold text-primary hover:underline">
                                        Create an account
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
                    </div>
    );
}
