"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ShieldCheck, 
    FileText, 
    Upload, 
    CheckCircle2, 
    ArrowLeft, 
    Loader2, 
    Info,
    Home,
    ChevronRight,
    Search
} from "lucide-react";
import { apiPost } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

type Step = "terms" | "upload" | "processing";

export default function SellerOnboardingPage() {
    const [step, setStep] = useState<Step>("terms");
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { refreshUser } = useAuth();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            if (selected.size > 10 * 1024 * 1024) {
                setError("File is too large. Max 10MB allowed.");
                return;
            }
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError("Identification card is required.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("idImage", file);

            const res = await fetch("/api/onboarding/apply-seller", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("campus_token")}`
                },
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to submit application");
            }

            setStep("processing");
            await refreshUser();
            
            // Redirect home after some delay to show the success state
            setTimeout(() => {
                router.replace("/home");
            }, 3000);
        } catch (err: any) {
            setError(err.message || "An error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 font-heading">
            <div className="w-full max-w-2xl bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                             </div>
                             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                Seller Verification
                             </span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {step === "terms" && "Agreement & Policy"}
                            {step === "upload" && "Identity Verification"}
                            {step === "processing" && "Application Received"}
                        </h1>
                    </div>
                    
                    {step !== "processing" && (
                        <div className="flex gap-1.5 h-1.5 w-24 mt-4">
                            <div className={`flex-1 rounded-full ${step === "terms" || step === "upload" ? "bg-primary" : "bg-secondary"}`} />
                            <div className={`flex-1 rounded-full ${step === "upload" ? "bg-primary" : "bg-secondary"}`} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-8 pt-0 flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === "terms" && (
                            <motion.div 
                                key="terms"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6 flex-1 flex flex-col"
                            >
                                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed flex-1 overflow-y-auto max-h-[300px] p-4 bg-secondary/20 rounded-2xl border border-border/40">
                                    <p>
                                        To ensure a safe and trustworthy environment for all students, we require sellers to verify their identity. By clicking "Agree and Proceed", you acknowledge:
                                    </p>
                                    <ul className="space-y-3 list-disc pl-5">
                                        <li>You are a legitimate student at your designated institution.</li>
                                        <li>All items listed are accurately described and owned by you.</li>
                                        <li>You will complete transactions in safe, designated areas.</li>
                                        <li>Campus Market reserves the right to suspend accounts that violate safety protocols.</li>
                                    </ul>
                                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10 mt-4">
                                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-primary/80 font-medium italic">
                                            Your ID data is encrypted and only used for verification. We never share your sensitive personal data with other users.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => router.replace("/home")}
                                        className="flex-1 h-12 bg-secondary text-foreground font-bold uppercase tracking-widest text-[10px] rounded-xl border border-border/60 hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Home className="w-4 h-4" />
                                        Home
                                    </button>
                                    <button
                                        onClick={() => setStep("upload")}
                                        className="flex-[2] h-12 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/91 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        Agree & Proceed
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === "upload" && (
                            <motion.div 
                                key="upload"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6 flex-1 flex flex-col"
                            >
                                <p className="text-sm text-muted-foreground">
                                    Please upload a clear photo of your student ID card or national ID to continue.
                                </p>

                                <div 
                                    className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-colors ${file ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/60 hover:border-primary/40 bg-secondary/10"}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const dropped = e.dataTransfer.files[0];
                                        if (dropped) handleFileChange({ target: { files: [dropped] } } as any);
                                    }}
                                >
                                    {preview ? (
                                        <div className="relative w-full max-w-[300px] aspect-[1.6/1] rounded-xl overflow-hidden shadow-md">
                                            <img src={preview} alt="ID Preview" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => { setFile(null); setPreview(null); }}
                                                className="absolute top-2 right-2 p-1.5 bg-background/80 text-foreground rounded-full hover:bg-background transition-colors shadow-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="w-16 h-16 rounded-2xl bg-card border border-border/40 flex items-center justify-center shadow-sm">
                                                <Upload className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Click to upload or drag & drop</p>
                                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
                                            </div>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                id="id-upload"
                                                accept="image/*,.pdf"
                                                onChange={handleFileChange}
                                            />
                                            <label 
                                                htmlFor="id-upload"
                                                className="h-10 px-6 bg-background border border-border/60 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center"
                                            >
                                                Select File
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <p className="text-center text-xs font-bold text-red-500 bg-red-500/5 py-2 rounded-lg border border-red-500/20">
                                        {error}
                                    </p>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setStep("terms")}
                                        disabled={isUploading}
                                        className="flex-1 h-12 bg-secondary text-foreground font-bold uppercase tracking-widest text-[10px] rounded-xl border border-border/60 hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isUploading || !file}
                                        className="flex-[2] h-12 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/91 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === "processing" && (
                            <motion.div 
                                key="processing"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center border-4 border-card"
                                    >
                                        <Search className="w-3 h-3 text-white" />
                                    </motion.div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-foreground">Under Review</h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[320px]">
                                        Your application has been received and is currently being processed by our moderation team.
                                    </p>
                                </div>

                                <div className="w-full max-w-[280px] bg-secondary/20 p-4 rounded-2xl border border-border/40">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                        <span>Progress</span>
                                        <span className="text-emerald-600">Pending</span>
                                    </div>
                                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "65%" }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-emerald-500" 
                                        />
                                    </div>
                                </div>

                                <p className="text-[10px] text-muted-foreground italic">
                                    Redirecting you to homepage...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
