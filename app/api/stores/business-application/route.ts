import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BusinessApplicationModel from "@/models/BusinessApplication";
import StoreModel from "@/models/Store";
import { requireAuth, requireCompletedOnboarding } from "@/lib/authServer";

/**
 * GET /api/stores/business-application
 * Fetch applications submitted by the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireCompletedOnboarding(req);
    if (!user || errorResponse) return errorResponse;

    await dbConnect();

    const applications = await BusinessApplicationModel.find({
      applicantId: user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error: any) {
    console.error("[GET /api/stores/business-application] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve business applications." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stores/business-application
 * Submit a local business registration application for administrative review.
 * STRICT SECURITY:
 * - Applicant ID strictly bound to authenticated user.
 * - Client cannot set status, approve itself, or bind a storeId directly.
 * - Prevents duplicate applications while one is already pending review.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireCompletedOnboarding(req);
    if (!user || errorResponse) return errorResponse;

    await dbConnect();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // 1. Check if user already owns an active storefront
    const existingStore = await StoreModel.findOne({ ownerId: user.id });
    if (existingStore) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your account already owns a storefront. Each Campus Hive account is limited to one storefront.",
        },
        { status: 409 }
      );
    }

    // 2. Check if user already has an application pending review
    const pendingApp = await BusinessApplicationModel.findOne({
      applicantId: user.id,
      status: "pending_review",
    });
    if (pendingApp) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You already have a business application pending review. Please wait for an administrator to complete the review.",
        },
        { status: 409 }
      );
    }

    // 3. Validate required fields
    const {
      businessName,
      businessCategory,
      campus,
      operatingLocation,
      contactPhone,
      contactEmail,
    } = body;

    if (
      !businessName ||
      !businessCategory ||
      !campus ||
      !operatingLocation ||
      !contactPhone ||
      !contactEmail
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: businessName, businessCategory, campus, operatingLocation, contactPhone, and contactEmail are required.",
        },
        { status: 400 }
      );
    }

    // 4. Create business application in pending_review
    const newApplication = new BusinessApplicationModel({
      applicantId: user.id, // Strictly server-enforced applicant ID
      businessName: String(businessName).trim(),
      businessCategory: String(businessCategory).trim(),
      campus: String(campus).trim(),
      operatingLocation: String(operatingLocation).trim(),
      contactPhone: String(contactPhone).trim(),
      contactEmail: String(contactEmail).trim().toLowerCase(),
      registeredBusinessName: body.registeredBusinessName
        ? String(body.registeredBusinessName).trim()
        : undefined,
      cacNumber: body.cacNumber ? String(body.cacNumber).trim() : undefined,
      supportingDocuments: Array.isArray(body.supportingDocuments)
        ? body.supportingDocuments
        : [],
      notes: body.notes ? String(body.notes).trim() : undefined,
      status: "pending_review", // Strictly enforced server-controlled status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await newApplication.save();

    return NextResponse.json(
      {
        success: true,
        data: newApplication,
        message:
          "Business application submitted successfully. An administrator will review your application.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/stores/business-application] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit business application.",
      },
      { status: 500 }
    );
  }
}
