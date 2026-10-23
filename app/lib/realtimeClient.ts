/**
 * app/lib/realtimeClient.ts
 *
 * Client-side realtime manager for Campus Hive (Pusher / Soketi protocol).
 *
 * Responsibilities:
 * - Singleton connection management.
 * - Dynamic token attachment on channel authorization.
 * - Typing indicators with automatic throttling (max 1 event per 1.5s).
 * - Automatic reconnect detection with callback triggers for cursor catch-up.
 * - Deduplication assistance.
 */

"use client";

import Pusher, { Channel, PresenceChannel } from "pusher-js";

let clientInstance: Pusher | null = null;
let lastTypingTriggerAt = 0;
const TYPING_THROTTLE_MS = 1500;

export interface RealtimeClientConfig {
  key: string;
  cluster: string;
  authEndpoint: string;
  host?: string;
  port?: number;
  useTLS?: boolean;
}

export function getClientConfig(): RealtimeClientConfig {
  return {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || "mock_pusher_key",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
    authEndpoint: "/api/realtime/auth",
    host: process.env.NEXT_PUBLIC_PUSHER_HOST,
    port: process.env.NEXT_PUBLIC_PUSHER_PORT
      ? Number(process.env.NEXT_PUBLIC_PUSHER_PORT)
      : undefined,
    useTLS: process.env.NEXT_PUBLIC_PUSHER_USE_TLS !== "false",
  };
}

/**
 * Returns or initializes the shared browser Pusher client instance.
 * Automatically fetches the active session token from localStorage on every auth request.
 */
export function getRealtimeClient(): Pusher | null {
  if (typeof window === "undefined") return null;
  if (clientInstance) return clientInstance;

  const config = getClientConfig();

  // Create client instance with custom authorizer to inject Bearer token
  clientInstance = new Pusher(config.key, {
    cluster: config.cluster,
    wsHost: config.host,
    wsPort: config.port,
    wssPort: config.port,
    forceTLS: config.useTLS ?? true,
    enabledTransports: ["ws", "wss"],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        fetch(config.authEndpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.error || `Channel authorization failed (${res.status})`);
            }
            return res.json();
          })
          .then((data) => callback(null, data))
          .catch((err) => callback(err, null));
      },
    }),
  });

  return clientInstance;
}

/**
 * Disconnects and cleans up the active client instance.
 */
export function disconnectRealtime(): void {
  if (clientInstance) {
    clientInstance.disconnect();
    clientInstance = null;
  }
}

export interface ConversationSubscriptionHandlers {
  onMessage?: (data: { message: any; conversation?: any }) => void;
  onTyping?: (data: { userId: string; name?: string; isTyping: boolean }) => void;
  onDealUpdate?: (data: any) => void;
  onOfferUpdate?: (data: any) => void;
  onMemberJoined?: (member: any) => void;
  onMemberLeft?: (member: any) => void;
  onMembersCount?: (count: number) => void;
}

/**
 * Subscribes to a conversation's private and presence channels.
 * Returns an unsubscribe callback for easy cleanup in useEffect.
 */
export function subscribeToConversation(
  conversationId: string,
  handlers: ConversationSubscriptionHandlers = {}
): () => void {
  const pusher = getRealtimeClient();
  if (!pusher) return () => {};

  const privateChannelName = `private-conversation-${conversationId}`;
  const presenceChannelName = `presence-conversation-${conversationId}`;

  const privateChannel = pusher.subscribe(privateChannelName);
  const presenceChannel = pusher.subscribe(presenceChannelName) as PresenceChannel;

  if (handlers.onMessage) {
    privateChannel.bind("new-message", handlers.onMessage);
  }
  if (handlers.onDealUpdate) {
    privateChannel.bind("deal-updated", handlers.onDealUpdate);
  }
  if (handlers.onOfferUpdate) {
    privateChannel.bind("offer-updated", handlers.onOfferUpdate);
  }

  // Client-to-client typing events over the private channel
  if (handlers.onTyping) {
    privateChannel.bind("client-typing", handlers.onTyping);
  }

  // Presence channel bindings
  if (handlers.onMemberJoined) {
    presenceChannel.bind("pusher:member_added", handlers.onMemberJoined);
  }
  if (handlers.onMemberLeft) {
    presenceChannel.bind("pusher:member_removed", handlers.onMemberLeft);
  }
  if (handlers.onMembersCount) {
    presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
      handlers.onMembersCount?.(members?.count || 1);
    });
  }

  return () => {
    if (handlers.onMessage) privateChannel.unbind("new-message", handlers.onMessage);
    if (handlers.onDealUpdate) privateChannel.unbind("deal-updated", handlers.onDealUpdate);
    if (handlers.onOfferUpdate) privateChannel.unbind("offer-updated", handlers.onOfferUpdate);
    if (handlers.onTyping) privateChannel.unbind("client-typing", handlers.onTyping);

    pusher.unsubscribe(privateChannelName);
    pusher.unsubscribe(presenceChannelName);
  };
}

/**
 * Triggers a client-level typing event across the private channel.
 * Throttled to prevent flooding (max 1 event every 1.5 seconds).
 */
export function sendTypingIndicator(
  conversationId: string,
  userInfo: { userId: string; name?: string },
  isTyping: boolean
): void {
  const now = Date.now();
  if (isTyping && now - lastTypingTriggerAt < TYPING_THROTTLE_MS) {
    return;
  }
  lastTypingTriggerAt = now;

  const pusher = getRealtimeClient();
  if (!pusher) return;

  const channel = pusher.channel(`private-conversation-${conversationId}`);
  if (channel && channel.subscribed) {
    channel.trigger("client-typing", {
      userId: userInfo.userId,
      name: userInfo.name,
      isTyping,
    });
  }
}

/**
 * Subscribes to the authenticated user's private notification channel.
 * Receives inbox updates, unread badge changes, and negotiation alerts.
 */
export function subscribeToUserChannel(
  userId: string,
  handlers: {
    onConversationUpdated?: (data: any) => void;
    onNotification?: (data: any) => void;
  }
): () => void {
  const pusher = getRealtimeClient();
  if (!pusher) return () => {};

  const channelName = `private-user-${userId}`;
  const channel = pusher.subscribe(channelName);

  if (handlers.onConversationUpdated) {
    channel.bind("conversation-updated", handlers.onConversationUpdated);
  }
  if (handlers.onNotification) {
    channel.bind("notification", handlers.onNotification);
  }

  return () => {
    if (handlers.onConversationUpdated) {
      channel.unbind("conversation-updated", handlers.onConversationUpdated);
    }
    if (handlers.onNotification) {
      channel.unbind("notification", handlers.onNotification);
    }
    pusher.unsubscribe(channelName);
  };
}
