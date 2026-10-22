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
 * Non-blocking: logs safely within session if provided, or independent write.
 */
export async function logAdminAudit(entry: AdminAuditLogEntry): Promise<void> {
  try {
    const conn = mongoose.connection;
    if (conn.readyState !== 1 || !conn.db) {
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

    if (entry.session) {
      await auditCollection.insertOne(doc, { session: entry.session });
    } else {
      await auditCollection.insertOne(doc);
    }
  } catch (err) {
    console.warn("[AdminAudit] Failed to record audit log:", err);
  }
}
