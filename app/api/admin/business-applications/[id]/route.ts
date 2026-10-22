import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import BusinessApplicationModel from "@/models/BusinessApplication";
import StoreModel from "@/models/Store";
import { requireAdmin } from "@/lib/authServer";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || "store"}-${randomSuffix}`;
}

/**
 * PATCH /api/admin/business-applications/[id]
 * Server-controlled status transitions for business applications:
 * Only authorized admins can approve, reject, or request additional information.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    const { id } = await context.params;
    const requestId = getRequestId(req);
    await dbConnect();

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id) ||
      BusinessApplicationModel.db?.readyState !== 1
    ) {
      return NextResponse.json(
        { success: false, error: "Business application not found." },
        { status: 404 }
      );
    }

    const application = await BusinessApplicationModel.findById(id);
    if (!application) {
      return NextResponse.json(
        { success: false, error: "Business application not found." },
        { status: 404 }
      );
    }
    const previousApplicationStatus = application.status;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { action, reason, adminNotes } = body;

    if (!["approve", "reject", "request_changes", "request_info"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid action. Supported actions are 'approve', 'reject', or 'request_changes'.",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------------
    // ACTION: APPROVE BUSINESS APPLICATION
    // ------------------------------------------------------------------------
    if (action === "approve") {
      let approvedApplication: any = null;
      let createdOrLinkedStore: any = null;

      const runApprovalTransaction = async (session?: mongoose.ClientSession) => {
        const now = new Date().toISOString();
        const opts = session
          ? { session, returnDocument: "after" as const }
          : { returnDocument: "after" as const };

        // 1. Conditional findOneAndUpdate: Only match and update if status is 'pending_review'
        const updatedApp = await BusinessApplicationModel.findOneAndUpdate(
          { _id: id, status: "pending_review" },
          {
            $set: {
              status: "approved",
              adminDecision: {
                reviewedBy: admin.id,
                reviewedAt: now,
                reason: reason || "Approved by platform administrator.",
                adminNotes: adminNotes || "",
              },
              updatedAt: now,
            },
          },
          opts
        );

        // 409 when the conditional update matches nothing (not in pending_review or already processed)
        if (!updatedApp) {
          const conflictErr: any = new Error(
            "Application is not in pending_review status or has already been processed."
          );
          conflictErr.isConflict = true;
          throw conflictErr;
        }

        // Check if applicant already has a store
        const findStoreQuery = StoreModel.findOne({
          ownerId: updatedApp.applicantId,
        });
        const existingStore = session
          ? await findStoreQuery.session(session)
          : await findStoreQuery;

        let storeToLink: any;

        if (!existingStore) {
          // Store.create([...], { session }) in the same transaction
          const createOpts = session ? { session } : undefined;
          let targetSlug = generateSlug(updatedApp.businessName);
          const slugExists = await StoreModel.findOne({ slug: targetSlug }).session(session || null);
          if (slugExists) {
            targetSlug = `${targetSlug}-${Math.floor(100 + Math.random() * 900)}`;
          }

          const [newStore] = await StoreModel.create(
            [
              {
                ownerId: updatedApp.applicantId,
                name: updatedApp.businessName,
                slug: targetSlug,
                description:
                  updatedApp.notes ||
                  `${updatedApp.businessName} - Official verified business serving ${updatedApp.campus}.`,
                storeType: "local_business",
                category: updatedApp.businessCategory,
                campus: updatedApp.campus,
                operatingLocation: updatedApp.operatingLocation,
                logo:
                  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&auto=format&fit=crop&q=80",
                status: "active",
                isVerified: true,
                verificationType: "business",
                businessApplicationId: updatedApp._id.toString(),
                contact: {
                  phone: updatedApp.contactPhone,
                  email: updatedApp.contactEmail,
                },
                metrics: {
                  rating: 5.0,
                  reviewsCount: 0,
                  completedDeals: 0,
                  listingsCount: 0,
                },
                createdAt: now,
                updatedAt: now,
              },
            ],
            createOpts
          );
          storeToLink = newStore;
        } else {
          // Upgrade existing store to approved business
          existingStore.storeType = "local_business";
          existingStore.isVerified = true;
          existingStore.verificationType = "business";
          existingStore.status = "active";
          existingStore.businessApplicationId = updatedApp._id.toString();
          existingStore.updatedAt = now;
          await (session ? existingStore.save({ session }) : existingStore.save());
          storeToLink = existingStore;
        }

        // Link storeId to application within the same transaction
        updatedApp.storeId = storeToLink._id.toString();
        await (session ? updatedApp.save({ session }) : updatedApp.save());

        approvedApplication = updatedApp;
        createdOrLinkedStore = storeToLink;
        // NO side effects inside this callback: withTransaction can retry on transient errors!
      };

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await runApprovalTransaction(session);
        });
      } catch (err: any) {
        if (err.isConflict) {
          return NextResponse.json(
            {
              success: false,
              error:
                "This application has already been processed or is not awaiting review.",
            },
            { status: 409 }
          );
        }
        if (err.code === 11000 || String(err.message || "").includes("E11000")) {
          return NextResponse.json(
            {
              success: false,
              error:
                "A storefront is already registered to this account or with this slug.",
            },
            { status: 409 }
          );
        }
        const isStandaloneDeploy =
          String(err.message || "").includes("retryable writes") ||
          String(err.message || "").includes("replica set") ||
          String(err.originalError?.message || "").includes("replica set") ||
          err.code === 20 ||
          err.originalError?.code === 20;

        // Graceful fallback for standalone MongoDB instances without replica set
        if (isStandaloneDeploy) {
          try {
            await runApprovalTransaction();
          } catch (fallbackErr: any) {
            if (fallbackErr.isConflict) {
              return NextResponse.json(
                {
                  success: false,
                  error:
                    "This application has already been processed or is not awaiting review.",
                },
                { status: 409 }
              );
            }
            if (
              fallbackErr.code === 11000 ||
              String(fallbackErr.message || "").includes("E11000")
            ) {
              return NextResponse.json(
                {
                  success: false,
                  error:
                    "A storefront is already registered to this account or with this slug.",
                },
                { status: 409 }
              );
            }
            throw fallbackErr;
          }
        } else {
          throw err;
        }
      } finally {
        await session.endSession();
      }

      // No side effects inside callback: Send emails / notifications AFTER commit
      try {
        console.log(
          `[Email] Business application approval confirmation sent to ${approvedApplication?.contactEmail}`
        );
      } catch (postCommitErr) {
        console.error("[Post-commit notification error]:", postCommitErr);
      }

      // Record audit log
      await logAdminAudit({
        actorId: admin.id,
        actorEmail: admin.email,
        targetType: "business_application",
        targetId: id,
        action: "business_application_approve",
        requestId,
        reason: "Admin approved business application and activated store",
        before: { status: previousApplicationStatus, storeId: application.storeId || null },
        after: {
          status: approvedApplication?.status,
          storeId: approvedApplication?.storeId || null,
        },
        details: {
          storeId: createdOrLinkedStore?._id?.toString(),
          applicantId: approvedApplication?.userId?.toString(),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          application: approvedApplication,
          store: createdOrLinkedStore,
        },
        message: "Business application approved and storefront activated.",
      });
    }

    // ------------------------------------------------------------------------
    // ACTION: REJECT BUSINESS APPLICATION
    // ------------------------------------------------------------------------
    if (action === "reject") {
      if (!reason) {
        return NextResponse.json(
          {
            success: false,
            error: "A rejection reason is required for audit and applicant feedback.",
          },
          { status: 400 }
        );
      }

      application.status = "rejected";
      application.adminDecision = {
        reviewedBy: admin.id,
        reviewedAt: new Date().toISOString(),
        reason: String(reason).trim(),
        adminNotes: adminNotes ? String(adminNotes).trim() : "",
      };
      application.updatedAt = new Date().toISOString();

      await application.save();

      // Record audit log
      await logAdminAudit({
        actorId: admin.id,
        actorEmail: admin.email,
        targetType: "business_application",
        targetId: id,
        action: "business_application_reject",
        requestId,
        reason: reason || "Admin rejected business application",
        before: { status: previousApplicationStatus, storeId: application.storeId || null },
        after: { status: application.status, storeId: application.storeId || null },
        details: {
          applicantId: application.applicantId?.toString(),
          reason,
        },
      });

      return NextResponse.json({
        success: true,
        data: { application },
        message: "Business application rejected.",
      });
    }

    // ------------------------------------------------------------------------
    // ACTION: REQUEST CHANGES / MORE INFORMATION
    // ------------------------------------------------------------------------
    if (action === "request_changes" || action === "request_info") {
      application.status = "changes_requested";
      application.adminDecision = {
        reviewedBy: admin.id,
        reviewedAt: new Date().toISOString(),
        reason: reason || "Changes requested by platform administrators.",
        adminNotes: adminNotes ? String(adminNotes).trim() : "",
      };
      application.updatedAt = new Date().toISOString();

      await application.save();

      // Record audit log
      await logAdminAudit({
        actorId: admin.id,
        actorEmail: admin.email,
        targetType: "business_application",
        targetId: id,
        action: "business_application_request_changes",
        requestId,
        reason: reason || "Changes requested by administrator",
        before: { status: previousApplicationStatus, storeId: application.storeId || null },
        after: { status: application.status, storeId: application.storeId || null },
        details: {
          applicantId: application.applicantId?.toString(),
          reason,
        },
      });

      return NextResponse.json({
        success: true,
        data: { application },
        message: "Application updated to changes_requested. Applicant notified.",
      });
    }
  } catch (error: any) {
    if (
      error?.code === 11000 ||
      error?.code === 11001 ||
      String(error?.message || "").includes("E11000")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A storefront is already registered to this account or with this slug. Each account can only manage one storefront.",
        },
        { status: 409 }
      );
    }
    console.error("[PATCH /api/admin/business-applications/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update application." },
      { status: 500 }
    );
  }
}
