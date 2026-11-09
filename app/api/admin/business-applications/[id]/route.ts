import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import BusinessApplicationModel from "@/models/BusinessApplication";
import StoreModel, { generateSlug } from "@/models/Store";
import UserModel from "@/models/User";
import { MAX_STORES_PER_USER } from "@/constants/enums";
import { requireAdmin } from "@/lib/authServer";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";
import { createNotification } from "@/lib/notificationService";
import { generateUUIDv7 } from "@/lib/uuidv7";

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

      // Initialize storesCount on legacy/seeded user documents if missing before transaction
      if (application.applicantId && mongoose.Types.ObjectId.isValid(application.applicantId)) {
        const applicantDoc = await UserModel.findById(application.applicantId)
          .select("storesCount studentStoresCount")
          .lean();
        if (
          applicantDoc &&
          (typeof (applicantDoc as any).storesCount !== "number" ||
            typeof (applicantDoc as any).studentStoresCount !== "number")
        ) {
          const [liveTotal, liveStudent] = await Promise.all([
            StoreModel.countDocuments({
              ownerId: application.applicantId,
              status: { $ne: "deleted" },
            }),
            StoreModel.countDocuments({
              ownerId: application.applicantId,
              status: { $ne: "deleted" },
              storeType: "student_store",
            }),
          ]);
          await UserModel.updateOne(
            { _id: application.applicantId, storesCount: { $exists: false } },
            { $set: { storesCount: liveTotal, studentStoresCount: liveStudent } }
          );
        }
      }

      const runApprovalTransaction = async (session?: mongoose.ClientSession) => {
        const now = new Date().toISOString();
        const opts = session
          ? { session, returnDocument: "after" as const }
          : { returnDocument: "after" as const };

        // 1. Conditional findOneAndUpdate: Only match and update if status is 'pending_review'
        // Provides strict idempotency without relying on a unique index on stores.ownerId
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

        // Check if this application was created with a specific pre-linked storeId (Unified Onboarding)
        let linkedStore: any = null;
        if (updatedApp.storeId && mongoose.Types.ObjectId.isValid(updatedApp.storeId)) {
          const findStoreQuery = StoreModel.findOne({
            _id: updatedApp.storeId,
            ownerId: updatedApp.applicantId,
            status: { $ne: "deleted" },
          });
          linkedStore = session
            ? await findStoreQuery.session(session)
            : await findStoreQuery;
        }

        let storeToLink: any;

        if (!linkedStore) {
          // Standalone business application: atomically enforce MAX_STORES_PER_USER cap
          if (mongoose.Types.ObjectId.isValid(updatedApp.applicantId)) {
            const capUpdate = await UserModel.updateOne(
              {
                _id: updatedApp.applicantId,
                storesCount: { $lt: MAX_STORES_PER_USER },
              },
              {
                $inc: { storesCount: 1 },
                $set: {
                  role: "seller",
                  sellerStatus: "approved",
                },
              },
              session ? { session } : undefined
            );
            if (capUpdate.modifiedCount !== 1) {
              const conflictErr: any = new Error(
                `Applicant has already reached the maximum of ${MAX_STORES_PER_USER} stores.`
              );
              conflictErr.isConflict = true;
              throw conflictErr;
            }
          }

          const createOpts = session ? { session } : undefined;
          let targetSlug = generateSlug(updatedApp.businessName);
          const slugExists = await StoreModel.findOne({
            slugLower: targetSlug,
          }).session(session || null);
          if (slugExists) {
            targetSlug = `${targetSlug}-${Math.floor(100 + Math.random() * 900)}`;
          }

          const [newStore] = await StoreModel.create(
            [
              {
                publicId: generateUUIDv7(),
                ownerId: updatedApp.applicantId,
                name: updatedApp.businessName,
                slug: targetSlug,
                slugLower: targetSlug,
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
                  followersCount: 0,
                },
                createdAt: now,
                updatedAt: now,
              },
            ],
            createOpts
          );
          storeToLink = newStore;
        } else {
          // Upgrade the specific linked store to verified status (preserving student_store vs local_business)
          const isStudentVerification =
            linkedStore.verificationType === "student" ||
            linkedStore.storeType === "student_store" ||
            updatedApp.cacNumber === "Student ID Card";
          linkedStore.storeType = isStudentVerification ? "student_store" : "local_business";
          linkedStore.isVerified = true;
          linkedStore.verificationType = isStudentVerification ? "student" : "business";
          linkedStore.status = "active";
          linkedStore.businessApplicationId = updatedApp._id.toString();
          linkedStore.updatedAt = now;
          await (session ? linkedStore.save({ session }) : linkedStore.save());
          storeToLink = linkedStore;
        }

        // Link storeId to application within the same transaction
        updatedApp.storeId = storeToLink._id.toString();
        await (session ? updatedApp.save({ session }) : updatedApp.save());

        const isStudentApp =
          storeToLink?.verificationType === "student" ||
          storeToLink?.storeType === "student_store" ||
          updatedApp.cacNumber === "Student ID Card";

        // Update seller capability without mutating the user's private profile handle
        if (mongoose.Types.ObjectId.isValid(updatedApp.applicantId)) {
          await UserModel.findByIdAndUpdate(
            updatedApp.applicantId,
            {
              $set: {
                role: "seller",
                sellerStatus: "approved",
                ...(isStudentApp ? { isStudent: true, studentVerified: true } : {}),
              },
            },
            session ? { session } : undefined
          );
        }

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
        if (
          approvedApplication?.applicantId &&
          mongoose.Types.ObjectId.isValid(approvedApplication.applicantId)
        ) {
          await createNotification({
            recipient: approvedApplication.applicantId,
            type: "seller_verification_approved",
            category: "account_security",
            priority: "high",
            title: "Congrats! Your storefront application has been accepted",
            message: `Congrats! Your storefront application for "${approvedApplication.businessName}" has been accepted. Your verified badge is now live—check out your new profile and storefront!`,
            link: "/stores?view=storefront",
            dedupeKey: `seller_verify_approved:${id}`,
          });
        }
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

      try {
        if (application.applicantId && mongoose.Types.ObjectId.isValid(application.applicantId)) {
          await UserModel.findByIdAndUpdate(application.applicantId, {
            $set: { sellerStatus: "rejected" },
          });

          await createNotification({
            recipient: application.applicantId,
            type: "seller_verification_rejected",
            category: "account_security",
            priority: "high",
            title: "Storefront Application Not Approved",
            message: `Your storefront application for "${application.businessName}" was declined: ${String(reason).trim()}. You can retry your verification or contact Help & Support.`,
            link: "/onboarding/seller?retry=true",
            dedupeKey: `seller_verify_rejected:${id}:${application.updatedAt}`,
          });
        }
      } catch (notifErr) {
        console.error("[Reject notification error]:", notifErr);
      }

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

      try {
        if (application.applicantId && mongoose.Types.ObjectId.isValid(application.applicantId)) {
          await createNotification({
            recipient: application.applicantId,
            type: "seller_verification_changes_requested",
            category: "account_security",
            priority: "high",
            title: "Additional Verification Details Requested",
            message: `An administrator requested additional information for "${application.businessName}": ${reason || "Please review your verification submission."}`,
            link: "/onboarding/seller?retry=true",
            dedupeKey: `seller_verify_changes:${id}:${application.updatedAt}`,
          });
        }
      } catch (notifErr) {
        console.error("[Changes requested notification error]:", notifErr);
      }

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
