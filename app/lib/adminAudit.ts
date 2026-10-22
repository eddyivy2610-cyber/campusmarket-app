import mongoose from "mongoose";

export interface AdminAuditLogEntry {
  actorId: string;
  actorEmail?: string;
  targetType: "user" | "store" | "listing" | "business_application" | "review" | "order";
  targetId: string;
  action: string;
  reason?: string;
  details?: Record<string, any>;
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
  const doc = {
    actorId: entry.actorId,
    actorEmail: entry.actorEmail || null,
    targetType: entry.targetType,
    targetId: entry.targetId,
    action: entry.action,
    reason: entry.reason || null,
    details: entry.details || {},
    schemaVersion: 1,
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
