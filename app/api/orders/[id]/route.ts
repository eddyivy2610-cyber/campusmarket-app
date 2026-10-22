import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/models/Order";
import UserModel from "@/models/User";
import { requireAuth } from "@/lib/authServer";
import { validateOrderTransition, normalizeOrderStatus } from "@/lib/orderPolicy";
import { OrderStatus } from "@/constants/enums";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";
import { createNotification } from "@/lib/notificationService";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders/[id]
 * Fetch a single order by MongoDB ObjectId or canonical orderId (e.g. ORD-123456-CH).
 * STRICT PRIVACY: Restricts access exclusively to the buyer, seller, or administrator.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { id } = await context.params;
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Query by either _id or orderId
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { $or: [{ _id: id }, { orderId: id }] } : { orderId: id };

    const order = await OrderModel.findOne(filter)
      .populate("buyerId", "name email profile.displayName profile.avatar")
      .populate("sellerId", "name email profile.displayName profile.avatar")
      .populate("storeId", "storeName storeSlug logo")
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    // Authorization check
    const userIdStr = user.id.toString();
    const buyerIdStr = order.buyerId ? (order.buyerId as any)._id?.toString() || order.buyerId.toString() : "";
    const sellerIdStr = order.sellerId ? (order.sellerId as any)._id?.toString() || order.sellerId.toString() : "";

    const isParty = userIdStr === buyerIdStr || userIdStr === sellerIdStr;
    const isAdmin = user.role === "admin";

    if (!isParty && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Order not found." }, // 404 to avoid leaking existence
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
      order,
    });
  } catch (error: any) {
    console.error("[GET /api/orders/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve order." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Perform a status transition on an order:
 * STRICT CONCURRENCY & AUTHORIZATION:
 * 1. Validates that current user is authorized to perform the requested transition.
 * 2. Uses conditional atomic update (matching order ID and exact current status)
 *    to prevent race conditions and conflicting concurrent transitions.
 * 3. Appends audit history record for full transparency.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { id } = await context.params;
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 }
      );
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

    const { status: rawTargetStatus, comment } = body;
    if (!rawTargetStatus || typeof rawTargetStatus !== "string") {
      return NextResponse.json(
        { success: false, error: "Target status string is required." },
        { status: 400 }
      );
    }

    const targetStatus = normalizeOrderStatus(rawTargetStatus);
    if (!targetStatus) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid order status "${rawTargetStatus}".`,
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Query order
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { $or: [{ _id: id }, { orderId: id }] } : { orderId: id };
    const order = await OrderModel.findOne(filter);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    // Validate transition & permissions
    const transitionCheck = validateOrderTransition(order, targetStatus, user);
    if (!transitionCheck.allowed) {
      const isForbidden = transitionCheck.error?.startsWith("Unauthorized") || transitionCheck.error?.startsWith("Forbidden");
      return NextResponse.json(
        { success: false, error: transitionCheck.error },
        { status: isForbidden ? 403 : 400 }
      );
    }

    // Privileged action check: re-verify admin privileges directly in the database
    if (transitionCheck.roleInOrder === "admin" || user.role === "admin") {
      const dbAdmin = await UserModel.findById(user.id).select("role accountStatus email").lean();
      if (!dbAdmin || dbAdmin.role !== "admin" || dbAdmin.accountStatus !== "active") {
        return NextResponse.json(
          { success: false, error: "Forbidden: Admin privileges could not be verified in the database." },
          { status: 403 }
        );
      }
    }

    // Construct durable audit comment identifying the actor and reason
    const actorRole = transitionCheck.roleInOrder;
    const finalComment =
      typeof comment === "string" && comment.trim()
        ? comment.trim().slice(0, 500)
        : actorRole === "admin"
        ? `Privileged transition executed by administrator (${user.email || user.id}).`
        : actorRole === "buyer" && targetStatus === "delivered"
        ? "Buyer confirmed delivery and receipt of item/service."
        : actorRole === "seller" && targetStatus === "delivered"
        ? "Seller marked exchange fulfilled."
        : `Order status updated to "${targetStatus}" by ${actorRole}.`;

    // Atomic conditional update on current status to prevent race conditions
    const updatedOrder = await OrderModel.findOneAndUpdate(
      {
        _id: order._id,
        status: order.status, // Strict concurrency guard
      },
      {
        $set: { status: targetStatus },
        $push: {
          history: {
            status: targetStatus,
            updatedBy: user.id,
            updatedAt: new Date(),
            comment: finalComment,
          },
        },
      },
      { returnDocument: "after" }
    )
      .populate("buyerId", "name email profile.displayName profile.avatar")
      .populate("sellerId", "name email profile.displayName profile.avatar")
      .populate("storeId", "storeName storeSlug logo");

    if (!updatedOrder) {
      // Order status was modified concurrently!
      return NextResponse.json(
        {
          success: false,
          error: "Conflict: The order status was modified by another request concurrently. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    if (actorRole === "admin" || user.role === "admin") {
      await logAdminAudit({
        actorId: user.id,
        actorEmail: user.email,
        targetType: "order",
        targetId: updatedOrder._id.toString(),
        action: `order_status_${targetStatus}`,
        requestId: getRequestId(req),
        reason: finalComment,
        details: {
          previousStatus: order.status,
          newStatus: targetStatus,
          orderId: updatedOrder.orderId,
        },
      });
    }

    const buyerId = (order.buyerId as any)?.toString?.() || String(order.buyerId || "");
    const sellerId = (order.sellerId as any)?.toString?.() || String(order.sellerId || "");
    const otherPartyId = user.id === buyerId ? sellerId : buyerId;
    if (otherPartyId && otherPartyId !== user.id) {
      try {
        await createNotification({
          recipient: otherPartyId,
          sender: user.id,
          type: "order_update",
          category: "orders",
          priority: "high",
          title: "Order exchange update",
          message: `An order was updated to ${targetStatus.replaceAll("_", " ")}.`,
          link: `/orders/${updatedOrder._id}`,
          dedupeKey: `order:${updatedOrder._id}:${targetStatus}`,
        });
      } catch (notificationError) {
        console.warn("[Notifications] Order notification failed:", notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order status successfully updated to "${targetStatus}".`,
      data: updatedOrder,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("[PATCH /api/orders/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order." },
      { status: 500 }
    );
  }
}
