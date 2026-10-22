import mongoose from "mongoose";

export interface AdminAuditLogEntry {
  actorId: string;
  actorEmail?: string;
  targetType: "user" | "store" | "listing" | "business_application" | "review" | "order";
  targetId: string;
  action: string;
  requestId?: string;
  reason?: string;
  details?: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  session?: mongoose.ClientSession;
}

let indexesEnsured = false;

/**
 * Ensures indexes exist on the admin_audit_logs collection.
 */
export async function ensureAdminAuditIndexes(): Promise<void> {
  if (indexesEnsured) return;
  try {
    const conn = mongoose.connection;
    if (conn.readyState !== 1 || !conn.db) return;
    const auditCollection = conn.db.collection("admin_audit_logs");
    await auditCollection.createIndex({ actorId: 1, createdAt: -1 });
    await auditCollection.createIndex({ targetType: 1, targetId: 1, createdAt: -1 });
    await auditCollection.createIndex({ requestId: 1, createdAt: -1 });
    indexesEnsured = true;
  } catch {
    // Non-fatal if index already exists
  }
}

/**
 * Persists an administrative audit event to the `admin_audit_logs` collection.
 * APPEND-ONLY GUARANTEE:
 * - Strictly executes insertOne; no update or deletion APIs exist on admin_audit_logs.
 * - When run inside a session, log persistence failure throws to prevent administrative
 *   mutations from committing without a durable audit record.
 */
export async function logAdminAudit(entry: AdminAuditLogEntry): Promise<void> {
  const conn = mongoose.connection;
  if (conn.readyState !== 1 || !conn.db) {
    if (entry.session) {
      throw new Error("[AdminAudit] Cannot persist required audit log: Database connection not ready.");
    }
    console.warn("[AdminAudit] Database not ready, cannot record audit log.");
    return;
  }

  const auditCollection = conn.db.collection("admin_audit_logs");
  await ensureAdminAuditIndexes();

  // Keep the audit trail useful without allowing credentials or raw request
  // payloads to become a second source of sensitive data.
  const sanitize = (value: unknown, depth = 0): unknown => {
    if (depth > 4 || value === null || value === undefined) return value ?? null;
    if (typeof value !== "object") return value;
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.slice(0, 100).map((item) => sanitize(item, depth + 1));

    const sensitiveKeys = new Set([
      "password",
      "passwordHash",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "secret",
      "otp",
      "verificationCode",
    ]);
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (sensitiveKeys.has(key.toLowerCase())) continue;
      result[key] = sanitize(child, depth + 1);
    }
    return result;
  };

  const doc = {
    actorId: entry.actorId,
    actorEmail: entry.actorEmail || null,
    targetType: entry.targetType,
    targetId: entry.targetId,
    action: entry.action,
    requestId: entry.requestId || null,
    reason: entry.reason || null,
    details: sanitize(entry.details || {}),
    before: sanitize(entry.before || {}),
    after: sanitize(entry.after || {}),
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
  };

  try {
    if (entry.session) {
      await auditCollection.insertOne(doc, { session: entry.session });
    } else {
      await auditCollection.insertOne(doc);
    }
  } catch (err) {
    console.error("[AdminAudit] Critical error recording audit log:", err);
    if (entry.session) {
      throw err; // Abort transaction if audit fails
    }
  }
}
