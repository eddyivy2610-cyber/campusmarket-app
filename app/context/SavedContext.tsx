"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SavedItem {
    id: number;
    title: string;
    price: string | number;
    image: string;
    category: string;
    rating?: number;
    status?: string;
    location?: string;
    sellerId: string;
}

interface SavedContextType {
    savedItems: SavedItem[];
    addToSaved: (item: SavedItem) => void;
    removeFromSaved: (id: number) => void;
    isSaved: (id: number) => boolean;
    toggleSaved: (item: SavedItem) => void;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export function SavedProvider({ children }: { children: ReactNode }) {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem("saved_items");
        if (stored) {
            try {
                setSavedItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved items", e);
            }
        }
    }, []);

    // Save to local storage whenever savedItems changes
    useEffect(() => {
        localStorage.setItem("saved_items", JSON.stringify(savedItems));
    }, [savedItems]);

    const addToSaved = (item: SavedItem) => {
        setSavedItems((prev) => {
            if (prev.some((i) => i.id === item.id)) return prev;
            return [...prev, item];
        });
    };

    const removeFromSaved = (id: number) => {
        setSavedItems((prev) => prev.filter((item) => item.id !== id));
    };

    const isSaved = (id: number) => {
        return savedItems.some((item) => item.id === id);
    };

    const toggleSaved = (item: SavedItem) => {
        if (isSaved(item.id)) {
            removeFromSaved(item.id);
        } else {
            addToSaved(item);
        }
    };

    return (
        <SavedContext.Provider value={{ savedItems, addToSaved, removeFromSaved, isSaved, toggleSaved }}>
            {children}
        </SavedContext.Provider>
    );
}

export function useSaved() {
    const context = useContext(SavedContext);
    if (context === undefined) {
        throw new Error("useSaved must be used within a SavedProvider");
    }
    return context;
}
