import mongoose from "mongoose";

export class DatabaseUnavailableError extends Error {
  statusCode = 503;
  constructor(message = "Database temporarily unavailable.", options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DatabaseUnavailableError";
  }
}

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalWithCache = globalThis as typeof globalThis & { _mongoose?: MongooseCache };
const cache = (globalWithCache._mongoose ??= { conn: null, promise: null });

export function getMongooseConnectionOptions(): mongoose.ConnectOptions {
  return {
    bufferCommands: false,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 5),
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 0),
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 4000),
    connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 4000),
    socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000),
    maxIdleTimeMS: Number(process.env.MONGODB_MAX_IDLE_TIME_MS || 30000),
    autoIndex: process.env.NODE_ENV !== "production",
  };
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;
  const configuredUri = process.env.MONGODB_URI;
  const allowLocalFallback = process.env.NODE_ENV !== "production" && process.env.ALLOW_LOCAL_DB_FALLBACK === "true";
  const uri = configuredUri || (allowLocalFallback ? "mongodb://127.0.0.1:27017/campushive" : "");
  if (!uri) throw new DatabaseUnavailableError("Database configuration is missing.");

  cache.promise ??= mongoose
    .connect(uri, getMongooseConnectionOptions())
    .then((connection) => { cache.conn = connection; return connection; })
    .catch((error) => {
      cache.promise = null;
      cache.conn = null;
      console.error("[MongoDB] Connection failed:", error?.message || error);
      throw new DatabaseUnavailableError("Database temporarily unavailable.", { cause: error });
    });
  return cache.promise;
}

export async function checkDbHealth() {
  const start = Date.now();
  try {
    const conn = await dbConnect();
    await conn.connection.db?.admin().ping();
    return { connected: true, readyState: conn.connection.readyState, latencyMs: Date.now() - start };
  } catch (error: any) {
    return { connected: false, readyState: mongoose.connection.readyState, latencyMs: Date.now() - start, error: error?.message || "Database unavailable" };
  }
}

export default dbConnect;
