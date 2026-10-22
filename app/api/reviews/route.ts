import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, getServerAuthUser } from "@/lib/authServer";
import ReviewModel from "@/models/Review";
import OrderModel from "@/models/Order";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import { recomputeSellerRating, recomputeStoreRating } from "@/lib/reviewService";
import { applyRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function parseCursor(cursorStr: string | null): { createdAt: Date; id: string } | null {
  if (!cursorStr) return null;
  try {
    const decoded = Buffer.from(cursorStr, "base64").toString("utf-8");
    const [createdAtIso, id] = decoded.split("___");
    const createdAt = new Date(createdAtIso);
    if (isNaN(createdAt.getTime()) || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

function buildCursor(createdAt: Date | string, id: string): string {
  const iso = new Date(createdAt).toISOString();
  return Buffer.from(`${iso}___${id}`).toString("base64");
}

function toMatchId(id: string) {
  if (mongoose.isValidObjectId(id)) {
    return { $in: [id, new mongoose.Types.ObjectId(id)] };
  }
  return id;
}

/**
 * GET /api/reviews
 * Retrieves published reviews for a seller, store, or listing with keyset pagination.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    const storeId = searchParams.get("storeId");
    const listingId = searchParams.get("listingId");
    const cursorParam = searchParams.get("cursor");
    const rawLimit = parseInt(searchParams.get("limit") || "20", 10);
    const limit = Math.min(Math.max(isNaN(rawLimit) ? 20 : rawLimit, 1), 50);

    if (!sellerId && !storeId && !listingId) {
      return NextResponse.json(
        { success: false, error: "A sellerId, storeId, or listingId is required." },
        { status: 400 }
      );
    }

    // Parse and validate cursor
    let cursor: { createdAt: Date; id: string } | null = null;
    if (cursorParam) {
      cursor = parseCursor(cursorParam);
      if (!cursor) {
        return NextResponse.json(
          { success: false, error: "Invalid pagination cursor." },
          { status: 400 }
        );
      }
    }

    // Verify subject visibility (suspended accounts do not expose public reviews)
    if (sellerId) {
      const seller = await UserModel.findById(sellerId).select("accountStatus").lean();
      if (!seller || seller.accountStatus !== "active") {
        return NextResponse.json(
          { success: true, data: [], hasMore: false, nextCursor: null },
          {
            headers: {
              "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
            },
          }
        );
      }
    }

    if (storeId) {
      const store = await StoreModel.findById(storeId).select("status").lean();
      if (!store || store.status !== "active") {
        return NextResponse.json(
          { success: true, data: [], hasMore: false, nextCursor: null },
          {
            headers: {
              "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
            },
          }
        );
      }
    }

    // Build filter strictly for published reviews
    const filter: Record<string, any> = {
      status: "published",
    };

    if (sellerId) {
      filter.sellerId = toMatchId(sellerId);
    } else if (storeId) {
      filter.storeId = toMatchId(storeId);
    } else if (listingId) {
      filter.listingId = toMatchId(listingId);
    }

    if (cursor) {
      const cursorObjectId = mongoose.isValidObjectId(cursor.id)
        ? new mongoose.Types.ObjectId(cursor.id)
        : cursor.id;
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, _id: { $lt: cursorObjectId } },
      ];
    }

    // Fetch limit + 1 to determine hasMore
    const docs = await ReviewModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const items = hasMore ? docs.slice(0, limit) : docs;

    // Batch resolve reviewer display names and avatars with PII protection
    const reviewerIds = Array.from(
      new Set(items.map((r: any) => r.reviewerId?.toString()).filter(Boolean))
    );

    const reviewers = await UserModel.find(
      { _id: { $in: reviewerIds } },
      { name: 1, "profile.displayName": 1, "profile.avatar": 1 }
    ).lean();

    const reviewerMap = new Map<string, { name: string; avatar?: string }>();
    reviewers.forEach((rev: any) => {
      reviewerMap.set(rev._id.toString(), {
        name: rev.profile?.displayName || rev.name || "Campus Buyer",
        avatar: rev.profile?.avatar,
      });
    });

    const reviews = items.map((r: any) => {
      const revProfile = reviewerMap.get(r.reviewerId?.toString()) || {
        name: "Campus Buyer",
      };
      return {
        id: r._id.toString(),
        sellerId: r.sellerId?.toString(),
        storeId: r.storeId?.toString(),
        listingId: r.listingId?.toString(),
        rating: r.rating,
        comment: r.comment,
        images: r.images || [],
        createdAt: r.createdAt,
        reviewer: {
          name: revProfile.name,
          avatar: revProfile.avatar,
        },
      };
    });

    const lastItem = items[items.length - 1];
    const nextCursor =
      hasMore && lastItem ? buildCursor(lastItem.createdAt, lastItem._id.toString()) : null;

    const response = NextResponse.json({
      success: true,
      data: reviews,
      hasMore,
      nextCursor,
    });

    // Cache Control Boundary:
    // Identical-body rule: Public edge cache only for anonymous requests without auth headers/cookies.
    const hasAuthHeader = !!req.headers.get("authorization");
    const hasAuthCookie = !!(
      req.cookies.get("campus_token") ||
      req.cookies.get("token") ||
      req.cookies.get("refreshToken")
    );

    if (!hasAuthHeader && !hasAuthCookie) {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=300"
      );
    } else {
      response.headers.set(
        "Cache-Control",
        "private, no-cache, no-store, max-age=0, must-revalidate"
      );
    }

    return response;
  } catch (error: any) {
    console.error("[GET /api/reviews] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load reviews." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Submits a new review for a completed (delivered) order.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    // 1. Authenticate session & enforce live account status
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) {
      return (
        errorResponse ||
        NextResponse.json(
          { success: false, error: "Authentication required." },
          { status: 401 }
        )
      );
    }

    // Abuse prevention: Enforce rate limit
    const rateCheck = applyRateLimit(req, "review_create", RATE_LIMIT_PRESETS.REVIEWS, user.id);
    if (!rateCheck.allowed) {
      return rateCheck.response!;
    }

    const body = await req.json();
    const { orderId, rating, comment, images } = body;

    // 2. Validate input fields
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid orderId is required." },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be an integer between 1 and 5." },
        { status: 400 }
      );
    }

    if (typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment is required." },
        { status: 400 }
      );
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Comment cannot exceed 1000 characters." },
        { status: 400 }
      );
    }

    const sanitizedImages = Array.isArray(images)
      ? images
          .filter((img) => typeof img === "string" && img.startsWith("https://"))
          .slice(0, 5)
      : [];

    // 3. Verify Order Eligibility
    if (!mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    // Party eligibility: Only buyer can review
    if (order.buyerId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not a party to this order." },
        { status: 403 }
      );
    }

    // Self-review prevention
    if (order.sellerId.toString() === user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot review yourself or your own order." },
        { status: 400 }
      );
    }

    // Order status eligibility: strictly "delivered"
    if (order.status !== "delivered") {
      return NextResponse.json(
        {
          success: false,
          error: "Reviews are only available after an order has been delivered and completed.",
        },
        { status: 400 }
      );
    }

    // Re-check seller active status
    const seller = await UserModel.findById(order.sellerId).select("accountStatus").lean();
    if (!seller || seller.accountStatus !== "active") {
      return NextResponse.json(
        { success: false, error: "Seller account is not active." },
        { status: 400 }
      );
    }

    // 4. Duplicate pre-check
    const existing = await ReviewModel.findOne({
      reviewerId: user.id,
      orderId: order._id,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "You have already submitted a review for this order." },
        { status: 409 }
      );
    }

    // 5. Database write with atomic aggregate recomputation
    let createdReview: any;
    let mongoSession: mongoose.ClientSession | null = null;

    try {
      // Use transaction if replica set supports it
      mongoSession = await mongoose.startSession();
      mongoSession.startTransaction();

      const [newReview] = await ReviewModel.create(
        [
          {
            sellerId: order.sellerId,
            reviewerId: user.id,
            orderId: order._id,
            storeId: order.storeId || undefined,
            listingId: order.items?.[0]?.listingId || undefined,
            rating,
            comment: trimmedComment,
            images: sanitizedImages,
            status: "published",
            schemaVersion: 1,
          },
        ],
        { session: mongoSession }
      );

      createdReview = newReview;

      // Atomically recompute seller rating
      await recomputeSellerRating(order.sellerId.toString(), mongoSession);

      // If store order, atomically recompute store rating
      if (order.storeId) {
        await recomputeStoreRating(order.storeId.toString(), mongoSession);
      }

      await mongoSession.commitTransaction();
    } catch (txErr: any) {
      if (mongoSession) {
        try {
          await mongoSession.abortTransaction();
        } catch {
          // abort error
        }
      }

      // Check for duplicate key collision (11000) or concurrent transaction WriteConflict (112)
      const isDuplicate =
        txErr?.code === 11000 ||
        (typeof txErr?.message === "string" && txErr.message.includes("E11000"));

      const isWriteConflict =
        txErr?.code === 112 ||
        txErr?.codeName === "WriteConflict" ||
        (typeof txErr?.hasErrorLabel === "function" && txErr.hasErrorLabel("TransientTransactionError")) ||
        (Array.isArray(txErr?.errorLabels) && txErr.errorLabels.includes("TransientTransactionError")) ||
        (txErr?.errorLabelSet instanceof Set && txErr.errorLabelSet.has("TransientTransactionError"));

      if (isDuplicate) {
        return NextResponse.json(
          { success: false, error: "You have already submitted a review for this order." },
          { status: 409 }
        );
      }

      if (isWriteConflict) {
        // Under concurrent submissions for the exact same order, give the winning transaction
        // a moment to finish committing and verify whether the review now exists
        for (let attempt = 0; attempt < 8; attempt++) {
          await new Promise((r) => setTimeout(r, 25));
          const existingAfterConflict = await ReviewModel.findOne({
            reviewerId: user.id,
            orderId: order._id,
          });
          if (existingAfterConflict) {
            return NextResponse.json(
              { success: false, error: "You have already submitted a review for this order." },
              { status: 409 }
            );
          }
        }
      }

      // If transactions are unsupported (standalone mongo), fallback to sequential write with compensation
      if (
        txErr?.message?.includes("Transaction numbers are only allowed on a replica set") ||
        txErr?.message?.includes("standalone")
      ) {
        try {
          const directReview = await ReviewModel.create({
            sellerId: order.sellerId,
            reviewerId: user.id,
            orderId: order._id,
            storeId: order.storeId || undefined,
            listingId: order.items?.[0]?.listingId || undefined,
            rating,
            comment: trimmedComment,
            images: sanitizedImages,
            status: "published",
            schemaVersion: 1,
          });

          try {
            await recomputeSellerRating(order.sellerId.toString());
            if (order.storeId) {
              await recomputeStoreRating(order.storeId.toString());
            }
          } catch (aggErr) {
            // Roll back inserted review to prevent unaggregated drift
            await ReviewModel.deleteOne({ _id: directReview._id });
            throw aggErr;
          }

          createdReview = directReview;
        } catch (directErr: any) {
          if (
            directErr?.code === 11000 ||
            (typeof directErr?.message === "string" && directErr.message.includes("E11000"))
          ) {
            return NextResponse.json(
              { success: false, error: "You have already submitted a review for this order." },
              { status: 409 }
            );
          }
          throw directErr;
        }
      } else {
        throw txErr;
      }
    } finally {
      if (mongoSession) {
        mongoSession.endSession();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully.",
        data: {
          id: createdReview._id.toString(),
          sellerId: createdReview.sellerId?.toString(),
          orderId: createdReview.orderId?.toString(),
          rating: createdReview.rating,
          comment: createdReview.comment,
          status: createdReview.status,
          createdAt: createdReview.createdAt,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[POST /api/reviews] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review." },
      { status: 500 }
    );
  }
}
