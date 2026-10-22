import mongoose from "mongoose";

/**
 * Global is used here to maintain a cached connection across hot reloads in development
 * and function invocations in serverless environments.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

let lastConnectionFailureAt = 0;
const FAILURE_RETRY_COOLDOWN_MS = 15000;

export function getMongooseConnectionOptions(): mongoose.ConnectOptions {
  const maxPoolSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10", 10);
  const minPoolSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE || "2", 10);
  const maxIdleTimeMS = parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || "30000", 10);
  const serverSelectionTimeoutMS = parseInt(
    process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || "5000",
    10
  );
  const socketTimeoutMS = parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || "45000", 10);
  const connectTimeoutMS = parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || "10000", 10);

  return {
    bufferCommands: false,
    serverSelectionTimeoutMS,
    connectTimeoutMS,
    socketTimeoutMS,
    maxPoolSize,
    minPoolSize,
    maxIdleTimeMS,
    autoIndex: process.env.NODE_ENV !== "production",
  };
}

/**
 * Probes MongoDB connection health and measures round-trip ping latency.
 */
export async function checkDbHealth(): Promise<{
  connected: boolean;
  readyState: number;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const conn = await dbConnect();
    if (!conn || mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return {
        connected: false,
        readyState: mongoose.connection.readyState,
        latencyMs: Date.now() - start,
        error: "Database connection not ready",
      };
    }

    await mongoose.connection.db.admin().ping();
    return {
      connected: true,
      readyState: 1,
      latencyMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      connected: false,
      readyState: mongoose.connection.readyState,
      latencyMs: Date.now() - start,
      error: err.message,
    };
  }
}

export async function dbConnect(): Promise<typeof mongoose | null> {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/campushive";

  if (cached?.conn) {
    return cached.conn;
  }

  // Prevent repeated 4-second timeout stalls if MongoDB is unavailable locally
  if (Date.now() - lastConnectionFailureAt < FAILURE_RETRY_COOLDOWN_MS) {
    return null;
  }

  if (!cached?.promise) {
    const opts = getMongooseConnectionOptions();

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        return m;
      })
      .catch((err) => {
        lastConnectionFailureAt = Date.now();
        // Log warning but don't crash app if MongoDB is temporarily unavailable locally
        console.warn("[MongoDB] Connection warning (using in-memory fallback if needed):", err.message);
        cached!.promise = null;
        return null as unknown as typeof mongoose;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    lastConnectionFailureAt = Date.now();
    cached!.promise = null;
    return null;
  }

  return cached!.conn;
}

export default dbConnect;
