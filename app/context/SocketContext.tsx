"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: [],
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        // Disconnect if user logs out
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const token = localStorage.getItem("campus_token");
        if (!token) return;

        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
            auth: { token },
            transports: ["websocket"], // force websocket
        });

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });

        // Track online status
        socketInstance.on("user_online", ({ userId }) => {
            setOnlineUsers(prev => [...new Set([...prev, userId])]);
        });

        socketInstance.on("user_offline", ({ userId }) => {
            setOnlineUsers(prev => prev.filter(id => id !== userId));
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
}
