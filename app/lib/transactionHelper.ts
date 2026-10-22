import mongoose from "mongoose";

/**
 * Executes a callback within a MongoDB session transaction.
 * Automatically falls back to ordered idempotent execution if the database
 * is running as a standalone node without replica set support (e.g. local dev / memory server).
 */
export async function executeInTransaction<T>(
  fn: (session: mongoose.ClientSession | null) => Promise<T>
): Promise<T> {
  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
  } catch {
    // If sessions are not supported at all, run directly
    return await fn(null);
  }

  try {
    let result: T;
    let transactionSucceeded = false;

    try {
      await session.withTransaction(async () => {
        result = await fn(session);
      });
      transactionSucceeded = true;
      return result!;
    } catch (txErr: any) {
      const isReplicaSetError =
        txErr?.message?.includes("replica set") ||
        txErr?.message?.includes("Transaction numbers are only allowed on a replica set member") ||
        txErr?.message?.includes("retryable writes") ||
        txErr?.originalError?.message?.includes("Transaction numbers") ||
        txErr?.errorResponse?.message?.includes("retryable writes") ||
        txErr?.errorResponse?.originalError?.message?.includes("Transaction numbers") ||
        txErr?.codeName === "IllegalOperation" ||
        txErr?.code === 20;

      if (isReplicaSetError && !transactionSucceeded) {
        return await fn(null);
      }
      throw txErr;
    }
  } finally {
    try {
      await session.endSession();
    } catch {
      // safe cleanup
    }
  }
}
