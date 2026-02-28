/**
 * @BACKEND: SAVED ITEMS CONTEXT — Currently uses localStorage for persistence.
 *
 * Replace with:
 *   - GET /api/users/me/saved        → fetch user's saved items on login
 *   - POST /api/users/me/saved/:id   → save an item
 *   - DELETE /api/users/me/saved/:id → unsave an item
 *
 * After backend integration, remove localStorage logic and sync state with the API.
 * Consider optimistic updates: update UI immediately, then sync with server.
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SavedItem {
    id: number;
    title: string;
    price: string | number;
    image: string;
    category: string;
    recommendedCount?: number;
    notRecommendedCount?: number;
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

    /* @BACKEND: Replace localStorage with API call — GET /api/users/me/saved on mount */
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

    /* @BACKEND: Replace localStorage with API sync — POST/DELETE on change */
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
