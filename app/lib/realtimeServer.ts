/**
 * app/lib/realtimeServer.ts
 *
 * Server-side realtime adapter for Campus Hive (Pusher / Soketi protocol).
 * Responsible for channel authorization and event broadcasting.
 *
 * Implements the Persistence-First & Outbox pattern:
 * - Messages must be saved to MongoDB before calling publish
 * - Failed publications return a failure response so callers can log
 *   an outbox entry or rely on cursor replay on client reconnect.
 */

import Pusher from "pusher";
import crypto from "crypto";

export interface RealtimeServerConfig {
  appId: string;
  key: string;
  secret: string;
  cluster: string;
  useTLS: boolean;
  host?: string;
  port?: string;
}

let pusherInstance: Pusher | null = null;

export function getPusherConfig(): RealtimeServerConfig {
  return {
    appId: process.env.PUSHER_APP_ID || "",
    key: process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || "",
    secret: process.env.PUSHER_SECRET || "",
    cluster: process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
    useTLS: process.env.PUSHER_USE_TLS !== "false",
    host: process.env.PUSHER_HOST,
    port: process.env.PUSHER_PORT,
  };
}

export function isRealtimeConfigured(): boolean {
  const config = getPusherConfig();
  return Boolean(config.appId && config.key && config.secret);
}

export function getRealtimeServer(): Pusher | null {
  if (pusherInstance) return pusherInstance;

  const config = getPusherConfig();
  if (!config.appId || !config.key || !config.secret) {
    return null;
  }

  // If mock mode is explicitly requested or test dummy keys are detected, use local mock
  if (process.env.PUSHER_MOCK === "true" || config.appId.startsWith("test_") || config.key.startsWith("test_")) {
    return null;
  }

  pusherInstance = new Pusher({
    appId: config.appId,
    key: config.key,
    secret: config.secret,
    cluster: config.cluster,
    useTLS: config.useTLS,
    host: config.host,
    port: config.port,
  });

  return pusherInstance;
}

/**
 * Resets the cached server instance (useful for test suites or reconfiguring env vars).
 */
export function resetRealtimeServer(): void {
  pusherInstance = null;
}

export interface AuthorizeChannelOptions {
  socketId: string;
  channelName: string;
  user: {
    id: string;
    name?: string;
    avatar?: string;
    accountType?: string;
  };
}

export interface ChannelAuthResponse {
  auth: string;
  channel_data?: string;
  shared_secret?: string;
}

/**
 * Authorizes a client socket connection for a private or presence channel.
 * Uses Pusher's cryptographic HMAC authorization protocol.
 */
export function authorizeChannel(options: AuthorizeChannelOptions): ChannelAuthResponse {
  const { socketId, channelName, user } = options;
  const pusher = getRealtimeServer();
  const config = getPusherConfig();

  const isPresence = channelName.startsWith("presence-");
  const presenceData = isPresence
    ? {
        user_id: user.id,
        user_info: {
          name: user.name || "Campus Member",
          avatar: user.avatar,
          accountType: user.accountType || "student",
        },
      }
    : undefined;

  if (pusher) {
    if (isPresence && presenceData) {
      return pusher.authorizeChannel(socketId, channelName, presenceData);
    }
    return pusher.authorizeChannel(socketId, channelName);
  }

  // Fallback signature generator when live Pusher credentials are not provided (e.g. test environment)
  const secret = config.secret || "mock_pusher_secret_for_tests";
  const key = config.key || "mock_pusher_key";

  if (isPresence && presenceData) {
    const channelDataStr = JSON.stringify(presenceData);
    const stringToSign = `${socketId}:${channelName}:${channelDataStr}`;
    const signature = crypto.createHmac("sha256", secret).update(stringToSign).digest("hex");
    return {
      auth: `${key}:${signature}`,
      channel_data: channelDataStr,
    };
  } else {
    const stringToSign = `${socketId}:${channelName}`;
    const signature = crypto.createHmac("sha256", secret).update(stringToSign).digest("hex");
    return {
      auth: `${key}:${signature}`,
    };
  }
}

export interface PublishResult {
  published: boolean;
  channel: string;
  event: string;
  error?: string;
  mocked?: boolean;
}

/**
 * Publishes an event to a specific conversation channel (private-conversation-[id]).
 */
export async function publishConversationEvent(
  conversationId: string,
  event: string,
  data: any
): Promise<PublishResult> {
  const channel = `private-conversation-${conversationId}`;
  const pusher = getRealtimeServer();

  if (!pusher) {
    return {
      published: true,
      channel,
      event,
      mocked: true,
    };
  }

  try {
    await pusher.trigger(channel, event, data);
    return { published: true, channel, event };
  } catch (err: any) {
    console.error(`[RealtimeServer] Failed to publish event '${event}' to channel '${channel}':`, err?.message || err);
    return {
      published: false,
      channel,
      event,
      error: err?.message || "Realtime publish failed",
    };
  }
}

/**
 * Publishes a targeted event to a specific user (private-user-[userId]).
 * Used for inbox updates, unread badges, and notifications.
 */
export async function publishUserEvent(
  userId: string,
  event: string,
  data: any
): Promise<PublishResult> {
  const channel = `private-user-${userId}`;
  const pusher = getRealtimeServer();

  if (!pusher) {
    return {
      published: true,
      channel,
      event,
      mocked: true,
    };
  }

  try {
    await pusher.trigger(channel, event, data);
    return { published: true, channel, event };
  } catch (err: any) {
    console.error(`[RealtimeServer] Failed to publish user event '${event}' to channel '${channel}':`, err?.message || err);
    return {
      published: false,
      channel,
      event,
      error: err?.message || "Realtime publish failed",
    };
  }
}
