import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import OrderModel, { generateOrderId, saveOrderWithIdRetry, IOrderItem } from "@/models/Order";
import ListingModel from "@/models/Listing";
import { requireAuth } from "@/lib/authServer";
import { normalizeOrderStatus } from "@/lib/orderPolicy";
import { ORDER_FULFILLMENT_METHODS, ORDER_PAYMENT_METHODS } from "@/constants/enums";
import { applyRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders
 * Create an intended exchange coordination order:
 * STRICT PRODUCT & SECURITY RULES:
 * 1. Authenticated user is strictly enforced as the buyer (derived from session).
 * 2. Listing is validated against database (must exist and status must be "active").
 * 3. Seller ID, store ID, title, and price are snapshotted from database, NEVER from client input.
 * 4. Self-ordering is strictly forbidden (buyerId cannot equal sellerId).
 * 5. Quantities validated (integer >= 1). No inventory or stock reservation is performed.
 * 6. Total amount computed server-side: sum(price * qty).
 * 7. Non-custodial: No in-app payment processing or escrow claims.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    // Rate limiting: prevent order spam
    const rateCheck = applyRateLimit(req, "order_create", RATE_LIMIT_PRESETS.ORDERS, user.id);
    if (!rateCheck.allowed) {
      return rateCheck.response!;
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const {
      items: rawItems,
      listingId, // convenient shorthand for single-item order
      quantity = 1,
      paymentMethod = "cash",
      fulfillmentMethod = "pickup",
      meetupLocation,
      shippingAddress,
      notes,
      conversationId,
    } = body;

    // Normalizing item input
    let itemsToProcess: Array<{ listingId: string; quantity?: number }> = [];
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      itemsToProcess = rawItems;
    } else if (listingId) {
      // Validate shorthand single-item quantity if provided
      if (quantity !== undefined) {
        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
          return NextResponse.json(
            { success: false, error: "Item quantity must be a positive integer between 1 and 100." },
            { status: 400 }
          );
        }
      }
      itemsToProcess = [{ listingId, quantity: quantity || 1 }];
    } else {
      return NextResponse.json(
        { success: false, error: "At least one listing item is required to create an order." },
        { status: 400 }
      );
    }

    const rawIdempotencyKey =
      req.headers.get("Idempotency-Key") ||
      req.headers.get("X-Idempotency-Key") ||
      body.idempotencyKey;
    const idempotencyKey =
      typeof rawIdempotencyKey === "string" && rawIdempotencyKey.trim().length > 0
        ? rawIdempotencyKey.trim().slice(0, 100)
        : undefined;

    await dbConnect();

    // Idempotency check: if an order with this idempotency key already exists for this buyer, return it safely
    if (idempotencyKey) {
      const existingOrder = await OrderModel.findOne({
        buyerId: user.id,
        idempotencyKey,
      }).lean();
      if (existingOrder) {
        return NextResponse.json(
          {
            success: true,
            message: "Order already processed (idempotent request).",
            data: existingOrder,
            order: existingOrder,
          },
          { status: 200 }
        );
      }
    }

    // Validate fulfillment & payment methods
    if (!ORDER_FULFILLMENT_METHODS.includes(fulfillmentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid fulfillment method. Allowed: ${ORDER_FULFILLMENT_METHODS.join(", ")}`,
        },
        { status: 400 }
      );
    }
    if (!ORDER_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid payment method. Allowed: ${ORDER_PAYMENT_METHODS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const processedItems: IOrderItem[] = [];
    const seenListingIds = new Set<string>();
    let detectedSellerId: string | null = null;
    let detectedStoreId: string | undefined = undefined;
    let calculatedTotal = 0;

    for (const item of itemsToProcess) {
      const targetListingId = item.listingId;
      if (!targetListingId || !mongoose.Types.ObjectId.isValid(targetListingId)) {
        return NextResponse.json(
          { success: false, error: `Invalid or malformed listing ID: "${targetListingId}".` },
          { status: 400 }
        );
      }

      // Check for duplicate items within the same order
      const listingIdStr = targetListingId.toString();
      if (seenListingIds.has(listingIdStr)) {
        return NextResponse.json(
          {
            success: false,
            error: `Duplicate listing ID in order items: "${listingIdStr}". Please consolidate item quantities.`,
          },
          { status: 400 }
        );
      }
      seenListingIds.add(listingIdStr);

      // Strict quantity validation: positive, bounded integer
      const rawQty = item.quantity === undefined ? 1 : item.quantity;
      if (typeof rawQty !== "number" || !Number.isInteger(rawQty) || rawQty < 1 || rawQty > 100) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid quantity for listing "${listingIdStr}". Quantity must be a positive integer between 1 and 100.`,
          },
          { status: 400 }
        );
      }
      const numQty = rawQty;

      const listing = await ListingModel.findById(targetListingId).lean();
      if (!listing) {
        return NextResponse.json(
          { success: false, error: `Listing not found: "${targetListingId}".` },
          { status: 404 }
        );
      }

      // Check listing eligibility
      if (listing.status !== "active") {
        return NextResponse.json(
          {
            success: false,
            error: `Listing "${listing.title}" is not available for ordering (status: ${listing.status}).`,
          },
          { status: 400 }
        );
      }

      const sellerIdStr = listing.sellerId.toString();

      // Rule: Self-ordering prohibited
      if (sellerIdStr === user.id.toString()) {
        return NextResponse.json(
          { success: false, error: "Self-ordering is not permitted. You cannot purchase your own listing." },
          { status: 400 }
        );
      }

      // Ensure all items in a single order belong to the same seller
      if (!detectedSellerId) {
        detectedSellerId = sellerIdStr;
        detectedStoreId = listing.storeId ? listing.storeId.toString() : undefined;
      } else if (detectedSellerId !== sellerIdStr) {
        return NextResponse.json(
          {
            success: false,
            error: "Multi-seller cart orders are not supported. All items must belong to the same seller.",
          },
          { status: 400 }
        );
      }

      // Price snapshot strictly from DB with consistent 2-decimal rounding policy
      const snapshotPrice = Number(listing.price) || 0;
      const itemSubtotal = Math.round(snapshotPrice * numQty * 100) / 100;
      calculatedTotal = Math.round((calculatedTotal + itemSubtotal) * 100) / 100;

      processedItems.push({
        listingId: listing._id,
        title: listing.title,
        price: snapshotPrice,
        image: Array.isArray(listing.images) && listing.images.length > 0 ? listing.images[0] : undefined,
        quantity: numQty,
        listingType: listing.listingType,
        serviceDetails: listing.serviceDetails,
      });
    }

    if (!detectedSellerId || processedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid items could be processed for this order." },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const newOrder = new OrderModel({
      orderId,
      buyerId: user.id,
      sellerId: detectedSellerId,
      storeId: detectedStoreId,
      conversationId: typeof conversationId === "string" ? conversationId.trim() : undefined,
      idempotencyKey,
      items: processedItems,
      totalAmount: calculatedTotal,
      status: "pending",
      paymentMethod,
      fulfillmentMethod,
      meetupLocation: typeof meetupLocation === "string" ? meetupLocation.trim().slice(0, 300) : undefined,
      shippingAddress: shippingAddress && typeof shippingAddress === "object" ? {
        street: typeof shippingAddress.street === "string" ? shippingAddress.street.trim().slice(0, 200) : undefined,
        city: typeof shippingAddress.city === "string" ? shippingAddress.city.trim().slice(0, 100) : undefined,
        state: typeof shippingAddress.state === "string" ? shippingAddress.state.trim().slice(0, 100) : undefined,
        phone: typeof shippingAddress.phone === "string" ? shippingAddress.phone.trim().slice(0, 30) : undefined,
      } : undefined,
      notes: typeof notes === "string" ? notes.trim().slice(0, 1000) : undefined,
      history: [
        {
          status: "pending",
          updatedBy: user.id,
          updatedAt: new Date(),
          comment: "Order coordination initiated by buyer.",
        },
      ],
      schemaVersion: 1,
    });

    await saveOrderWithIdRetry(newOrder);

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        data: newOrder,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/orders] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Fetch orders for the authenticated user:
 * - If role=seller: returns orders where sellerId === user.id
 * - If role=buyer: returns orders where buyerId === user.id
 * - If user.role=admin: returns all orders if role=admin
 * Strictly isolates orders to the buyer and seller involved.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role")?.toLowerCase() || "buyer";
    const statusParam = searchParams.get("status");
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const skip = (page - 1) * limit;

    await dbConnect();

    const query: Record<string, any> = {};

    if (user.role === "admin" && roleParam === "admin") {
      // Admin sees all orders
    } else if (roleParam === "seller") {
      query.sellerId = user.id;
    } else {
      query.buyerId = user.id;
    }

    if (statusParam) {
      const canonicalStatus = normalizeOrderStatus(statusParam);
      if (canonicalStatus) {
        query.status = canonicalStatus;
      }
    }

    const total = await OrderModel.countDocuments(query);
    const orders = await OrderModel.find(query)
      .populate("buyerId", "name email profile.displayName profile.avatar")
      .populate("sellerId", "name email profile.displayName profile.avatar")
      .populate("storeId", "storeName storeSlug logo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders,
      orders,
    });
  } catch (error: any) {
    console.error("[GET /api/orders] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve orders." },
      { status: 500 }
    );
  }
}
