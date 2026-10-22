import mongoose from "mongoose";

export type JobType =
  | "email_verification"
  | "order_notification"
  | "seller_alert"
  | "system_maintenance"
  | "push_notification";

export type JobStatus = "pending" | "processing" | "completed" | "failed" | "dead_letter";

export interface JobRecord<T = Record<string, any>> {
  jobId: string;
  type: JobType;
  payload: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  idempotencyKey?: string;
  lastError?: string;
  scheduledAt: string;
  completedAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export interface EnqueueJobOptions {
  idempotencyKey?: string;
  maxAttempts?: number;
  delayMs?: number;
  session?: mongoose.ClientSession;
}

let jobIndexesEnsured = false;

/**
 * Ensures indexes exist on the background_jobs collection.
 */
export async function ensureJobIndexes(): Promise<void> {
  if (jobIndexesEnsured) return;
  try {
    const conn = mongoose.connection;
    if (conn.readyState !== 1 || !conn.db) return;
    const col = conn.db.collection("background_jobs");

    await col.createIndex({ jobId: 1 }, { unique: true });
    await col.createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true });
    await col.createIndex({ status: 1, scheduledAt: 1, attempts: 1 });
    await col.createIndex({ createdAt: -1 });

    jobIndexesEnsured = true;
  } catch {
    // Non-fatal if index exists
  }
}

/**
 * Transactional Enqueue:
 * Writes a job to the background_jobs collection. If a session is provided,
 * the job insertion is atomic with the originating business mutation.
 */
export async function enqueueJob<T = Record<string, any>>(
  type: JobType,
  payload: T,
  options: EnqueueJobOptions = {}
): Promise<{ success: boolean; jobId: string; duplicate?: boolean }> {
  const conn = mongoose.connection;
  if (conn.readyState !== 1 || !conn.db) {
    throw new Error("[JobQueue] Database connection not ready for job enqueue.");
  }

  await ensureJobIndexes();
  const col = conn.db.collection("background_jobs");

  const now = new Date();
  const scheduledTime = new Date(now.getTime() + (options.delayMs || 0));
  const jobId = `job_${crypto.randomUUID()}`;

  const doc: JobRecord<T> = {
    jobId,
    type,
    payload,
    status: "pending",
    attempts: 0,
    maxAttempts: options.maxAttempts || 3,
    idempotencyKey: options.idempotencyKey || undefined,
    scheduledAt: scheduledTime.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    schemaVersion: 1,
  };

  try {
    if (options.session) {
      await col.insertOne(doc, { session: options.session });
    } else {
      await col.insertOne(doc);
    }
    return { success: true, jobId };
  } catch (error: any) {
    // Check for duplicate idempotency key (11000)
    if (error?.code === 11000 && options.idempotencyKey) {
      const existing = (await col.findOne({ idempotencyKey: options.idempotencyKey })) as unknown as JobRecord | null;
      return { success: true, jobId: existing?.jobId || "existing", duplicate: true };
    }
    throw error;
  }
}

export type JobHandler = (payload: any, job: JobRecord) => Promise<void>;

const jobRegistry = new Map<JobType, JobHandler>();

/**
 * Registers an execution handler for a specific job type.
 */
export function registerJobHandler(type: JobType, handler: JobHandler): void {
  jobRegistry.set(type, handler);
}

/**
 * Default mock handlers for common jobs
 */
registerJobHandler("email_verification", async (payload) => {
  // Simulates email sending with verification token
  if (!payload?.email) throw new Error("Missing recipient email");
});

registerJobHandler("order_notification", async (payload) => {
  if (!payload?.orderId) throw new Error("Missing orderId for notification");
});

registerJobHandler("seller_alert", async (payload) => {
  if (!payload?.sellerId) throw new Error("Missing sellerId for alert");
});

/**
 * Processes pending background jobs up to batchLimit with bounded retries and dead-letter handling.
 */
export async function processNextJobBatch(batchLimit = 10): Promise<{
  processed: number;
  succeeded: number;
  retried: number;
  deadLetter: number;
}> {
  const conn = mongoose.connection;
  if (conn.readyState !== 1 || !conn.db) {
    return { processed: 0, succeeded: 0, retried: 0, deadLetter: 0 };
  }

  await ensureJobIndexes();
  const col = conn.db.collection("background_jobs");

  let processed = 0;
  let succeeded = 0;
  let retried = 0;
  let deadLetter = 0;

  for (let i = 0; i < batchLimit; i++) {
    const nowIso = new Date().toISOString();

    // Atomic claim of next eligible job
    const job = (await col.findOneAndUpdate(
      {
        status: "pending",
        scheduledAt: { $lte: nowIso },
      },
      {
        $set: {
          status: "processing",
          updatedAt: nowIso,
        },
        $inc: { attempts: 1 },
      },
      { returnDocument: "after" }
    )) as unknown as JobRecord | null;

    if (!job) break; // No more pending jobs

    processed++;
    const handler = jobRegistry.get(job.type);

    if (!handler) {
      // Unrecognized handler: move to dead letter immediately
      await col.updateOne(
        { jobId: job.jobId },
        {
          $set: {
            status: "dead_letter",
            lastError: `No registered handler for job type: ${job.type}`,
            failedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
      );
      deadLetter++;
      continue;
    }

    try {
      await handler(job.payload, job);

      // Job succeeded
      await col.updateOne(
        { jobId: job.jobId },
        {
          $set: {
            status: "completed",
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
      );
      succeeded++;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isDeadLetter = job.attempts >= job.maxAttempts;

      if (isDeadLetter) {
        // Exceeded max attempts: move to dead letter queue
        await col.updateOne(
          { jobId: job.jobId },
          {
            $set: {
              status: "dead_letter",
              lastError: errMsg,
              failedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        );
        deadLetter++;
      } else {
        // Retry with exponential backoff: 2^attempts * 10 seconds
        const backoffMs = Math.pow(2, job.attempts) * 10000;
        const nextSchedule = new Date(Date.now() + backoffMs).toISOString();

        await col.updateOne(
          { jobId: job.jobId },
          {
            $set: {
              status: "pending",
              scheduledAt: nextSchedule,
              lastError: errMsg,
              updatedAt: new Date().toISOString(),
            },
          }
        );
        retried++;
      }
    }
  }

  return { processed, succeeded, retried, deadLetter };
}
