"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Eye, Loader2, CheckCircle2, X, RefreshCw } from "lucide-react";
import { BaseModal, ModalActionButton } from "../common/BaseModal";
import { userService } from "@/lib/userService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ProfilePhotoModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentImage: string | null;
    userName: string;
    userId: string;
}

type PhotoStep = "options" | "camera" | "preview";

export function ProfilePhotoModal({ isOpen, onClose, currentImage, userName, userId }: ProfilePhotoModalProps) {
    const { refreshUser } = useAuth();
    const [step, setStep] = useState<PhotoStep>("options");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Reset state when opening/closing
    useEffect(() => {
        if (!isOpen) {
            setStep("options");
            setPreviewUrl(null);
            setSelectedFile(null);
            stopCamera();
        }
    }, [isOpen]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File is too large. Max 5MB allowed.");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setStep("preview");
        }
    };

    const startCamera = async () => {
        try {
            setStep("camera");
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (err) {
            console.error("Camera access failed", err);
            toast.error("Could not access camera. Please check permissions.");
            setStep("options");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            
            if (context) {
                // Set canvas dimensions to match video stream
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Draw current video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert canvas to blob/file
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(blob));
                        stopCamera();
                        setStep("preview");
                    }
                }, "image/jpeg", 0.9);
            }
        }
    };

    const handleSave = async () => {
        if (!selectedFile) return;
        
        setIsSaving(true);
        try {
            await userService.updateAvatar(userId, selectedFile);
            await refreshUser();
            toast.success("Profile photo updated successfully!");
            onClose();
        } catch (err: any) {
            console.error("Save failed", err);
            toast.error(err.message || "Failed to update profile photo");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <BaseModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={step === "options" ? "Profile Image" : step === "camera" ? "Take Photo" : "Preview Photo"}
            maxWidth="max-w-md"
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />

            <AnimatePresence mode="wait">
                {step === "options" && (
                    <motion.div 
                        key="options"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-col items-center gap-6 py-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/10 shadow-xl bg-secondary/30 relative">
                                {currentImage ? (
                                    <img src={currentImage} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-4xl font-bold">
                                        {userName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full grid grid-cols-1 gap-2.5">
                                <button 
                                    onClick={handleUploadClick}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-border/40 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-foreground">Upload Photo</p>
                                        <p className="text-[11px] text-muted-foreground">Select from your device</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={startCamera}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-border/40 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-foreground">Take Photo</p>
                                        <p className="text-[11px] text-muted-foreground">Use your camera</p>
                                    </div>
                                </button>

                                {currentImage && (
                                    <button 
                                        onClick={() => window.open(currentImage, '_blank')}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-border/40 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <Eye className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-foreground">View Profile Image</p>
                                            <p className="text-[11px] text-muted-foreground">Open in full size</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === "camera" && (
                    <motion.div 
                        key="camera"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-black border border-border/40">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover scale-x-[-1]" 
                            />
                            {!isStreaming && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                                    <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-50">Starting Camera...</p>
                                </div>
                            )}
                            
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4">
                                <button 
                                    onClick={() => { stopCamera(); setStep("options"); }}
                                    className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={takePhoto}
                                    disabled={!isStreaming}
                                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all disabled:opacity-50"
                                >
                                    <div className="w-12 h-12 rounded-full border-4 border-black/10" />
                                </button>
                                <button 
                                    className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all active:scale-90 opacity-0 pointer-events-none"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </motion.div>
                )}

                {step === "preview" && (
                    <motion.div 
                        key="preview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-primary shadow-2xl bg-secondary/30 relative">
                                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
                            </div>
                            
                            <div className="text-center space-y-1">
                                <p className="text-sm font-bold text-foreground">Looks great!</p>
                                <p className="text-[11px] text-muted-foreground">Save this as your new profile photo</p>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => { setStep("options"); setPreviewUrl(null); setSelectedFile(null); }}
                                    className="h-12 bg-secondary/50 text-foreground font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-border/40 hover:bg-secondary transition-all active:scale-95"
                                >
                                    Retake / Change
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="h-12 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Save Photo
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </BaseModal>
    );
}
