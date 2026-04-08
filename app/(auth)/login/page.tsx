"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        if (searchParams?.get("registered") === "true") {
            setSuccessMsg("Registration successful! Please log in to continue.");
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError("Please enter both email and password");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const response: any = await apiPost("auth/login", {
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
                    name: userData.profile?.displayName || userData.personalDetails?.fullName || userData.name || formData.email,
                    email: userData.email || formData.email,
                    handle: userData.profile?.handle || (userData.profile?.displayName || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
                    role: userData.role === "seller" ? "pro" : "user",
                    isStudent: userData.studentStatus?.isStudent || false,
                    studentVerified: userData.studentStatus?.isVerified || false,
                });
            }

            const nextUrl = searchParams?.get("next") || "/home";
            router.push(nextUrl);
        } catch (err: any) {
            setError(err?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError("");
        try {
            // This would normally call Firebase or Google SDK
            // We simulate it by calling our backend with mock Google data for now
            const mockGoogleData = {
                email: "google_user@gmail.com",
                name: "Google Member",
                avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=google",
                providerId: "google_" + Date.now()
            };

            const response: any = await apiPost("auth/google-login", mockGoogleData);
            
            const userData = response?.user || response?.data?.user;
            if (userData) {
                login({
                    id: userData._id || userData.userId,
                    name: userData.profile?.displayName || userData.name,
                    email: userData.email,
                    handle: userData.profile?.handle,
                    role: userData.role === "seller" ? "pro" : "user",
                    isStudent: userData.studentStatus?.isStudent || false,
                    studentVerified: userData.studentStatus?.isVerified || false,
                });
                const nextUrl = searchParams?.get("next") || "/home";
                router.push(nextUrl);
            }
        } catch (err: any) {
            setError("Google login failed. Please try again.");
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

                            {successMsg && (
                                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold">
                                    {successMsg}
                                </div>
                            )}

                            <div className="mt-6 space-y-4">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-border/80 dark:border-zinc-700 text-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary/20 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest bg-background px-2 text-muted-foreground/50">
                                        Or sign in with email
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleLogin} className="mt-4 space-y-5">
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
