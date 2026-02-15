"use client";

import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

interface ImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    }, []);

    const handleFiles = (files: File[]) => {
        // In a real app, we would upload these to cloud storage here
        // For now, we'll create local object URLs for preview
        const newImages = files.map(file => URL.createObjectURL(file));
        onChange([...images, ...newImages]);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                    Photos
                    <span className="text-muted-foreground font-normal ml-2">
                        {images.length === 0 ? "(0/5)" : `(${images.length}/5)`}
                    </span>
                </h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                        <Image
                            src={url}
                            alt="Listing preview"
                            fill
                            className="object-cover"
                        />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {images.length < 5 && (
                    <label
                        className={`
                            relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileInput}
                        />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <div className="p-3 bg-secondary rounded-full">
                                <Upload className="w-5 h-5 text-foreground" />
                            </div>
                            <span className="text-xs font-medium">Add Photos</span>
                        </div>
                    </label>
                )}
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg">
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>Good photos increase buyer interest. clear lighting, avoid screenshots.</span>
            </p>
        </div>
    );
}
