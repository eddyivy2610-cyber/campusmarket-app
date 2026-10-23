"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getRealtimeClient, disconnectRealtime } from "../lib/realtimeClient";
import type Pusher from "pusher-js";

interface RealtimeContextType {
    socket: Socket | null;
    pusher: Pusher | null;
    isConnected: boolean;
    onlineUsers: string[];
}

const RealtimeContext = createContext<RealtimeContextType>({
    socket: null,
    pusher: null,
    isConnected: false,
    onlineUsers: [],
});

export const useSocket = () => useContext(RealtimeContext);
export const useRealtime = () => useContext(RealtimeContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [pusher, setPusher] = useState<Pusher | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        // Disconnect if user logs out
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            disconnectRealtime();
            setPusher(null);
            setIsConnected(false);
            return;
        }

        // 1. Initialize hosted Realtime Client (Pusher / Soketi)
        const pusherClient = getRealtimeClient();
        if (pusherClient) {
            setPusher(pusherClient);
            if (pusherClient.connection.state === "connected") {
                setIsConnected(true);
            }

            pusherClient.connection.bind("connected", () => {
                setIsConnected(true);
            });
            pusherClient.connection.bind("disconnected", () => {
                setIsConnected(false);
            });
            pusherClient.connection.bind("unavailable", () => {
                setIsConnected(false);
            });
        }

        // 2. Keep legacy Express Socket.IO operational in parallel during migration
        let socketInstance: Socket | null = null;
        const expressUrl = process.env.NEXT_PUBLIC_API_URL;
        if (expressUrl && expressUrl.startsWith("http")) {
            try {
                socketInstance = io(expressUrl, {
                    withCredentials: true,
                    transports: ["websocket"],
                });

                socketInstance.on("connect", () => {
                    setIsConnected(true);
                });

                socketInstance.on("disconnect", () => {
                    // Do not mark disconnected if pusher is still connected
                    if (!pusherClient || pusherClient.connection.state !== "connected") {
                        setIsConnected(false);
                    }
                });

                // Track legacy online status
                socketInstance.on("user_online", ({ userId }: { userId: string }) => {
                    setOnlineUsers((prev) => [...new Set([...prev, userId])]);
                });

                socketInstance.on("user_offline", ({ userId }: { userId: string }) => {
                    setOnlineUsers((prev) => prev.filter((id) => id !== userId));
                });

                setSocket(socketInstance);
            } catch (err) {
                console.warn("[RealtimeProvider] Legacy socket connection skipped:", err);
            }
        }

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [user]);

    return (
        <RealtimeContext.Provider value={{ socket, pusher, isConnected, onlineUsers }}>
            {children}
        </RealtimeContext.Provider>
    );
}
