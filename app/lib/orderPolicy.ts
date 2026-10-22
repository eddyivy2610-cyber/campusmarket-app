import { OrderStatus } from "@/constants/enums";
import { ServerAuthUser } from "./authTokens";
import { IOrderDocument } from "@/models/Order";

export interface StatusTransitionRule {
  from: OrderStatus;
  to: OrderStatus;
  allowedRoles: ("buyer" | "seller" | "admin")[];
  description: string;
}

/**
 * Canonical Order Transition State Machine
 * Defines valid transitions and which party (buyer, seller, admin) is authorized to perform them.
 */
export const ORDER_TRANSITION_RULES: StatusTransitionRule[] = [
  // From pending:
  {
    from: "pending",
    to: "confirmed",
    allowedRoles: ["seller", "admin"],
    description: "Seller confirms receipt and agreement to the order coordination request.",
  },
  {
    from: "pending",
    to: "cancelled",
    allowedRoles: ["buyer", "seller", "admin"],
    description: "Buyer or seller cancels the pending request prior to confirmation.",
  },

  // From confirmed:
  {
    from: "confirmed",
    to: "processing",
    allowedRoles: ["seller", "admin"],
    description: "Seller begins preparing the item or scheduling the service.",
  },
  {
    from: "confirmed",
    to: "shipped",
    allowedRoles: ["seller", "admin"],
    description: "Item dispatched directly for campus delivery or handover.",
  },
  {
    from: "confirmed",
    to: "delivered",
    allowedRoles: ["seller", "buyer", "admin"],
    description: "In-person campus meetup exchange completed.",
  },
  {
    from: "confirmed",
    to: "cancelled",
    allowedRoles: ["buyer", "seller", "admin"],
    description: "Mutual cancellation before processing begins.",
  },

  // From processing:
  {
    from: "processing",
    to: "shipped",
    allowedRoles: ["seller", "admin"],
    description: "Item dispatched for delivery across campus or meetup.",
  },
  {
    from: "processing",
    to: "delivered",
    allowedRoles: ["seller", "buyer", "admin"],
    description: "Item or service fulfilled and accepted.",
  },
  {
    from: "processing",
    to: "disputed",
    allowedRoles: ["buyer", "seller", "admin"],
    description: "Issue raised regarding fulfillment terms or meetup.",
  },

  // From shipped:
  {
    from: "shipped",
    to: "delivered",
    allowedRoles: ["buyer", "seller", "admin"],
    description: "Buyer confirms handover or delivery completion.",
  },
  {
    from: "shipped",
    to: "disputed",
    allowedRoles: ["buyer", "seller", "admin"],
    description: "Buyer or seller disputes delivery or item condition.",
  },

  // From disputed:
  {
    from: "disputed",
    to: "delivered",
    allowedRoles: ["admin"],
    description: "Admin mediation resolves dispute in favor of fulfillment.",
  },
  {
    from: "disputed",
    to: "cancelled",
    allowedRoles: ["admin"],
    description: "Admin mediation resolves dispute by cancelling the order.",
  },
];

/**
 * Validates whether a user can perform a specific status transition on an order.
 */
export function validateOrderTransition(
  order: IOrderDocument,
  targetStatus: OrderStatus,
  user: ServerAuthUser
): { allowed: boolean; error?: string; roleInOrder?: "buyer" | "seller" | "admin" } {
  const currentStatus = order.status;

  if (currentStatus === targetStatus) {
    return {
      allowed: false,
      error: `Order is already in "${currentStatus}" status.`,
    };
  }

  // Determine user's role relative to this order
  let roleInOrder: "buyer" | "seller" | "admin" | null = null;
  const userIdStr = user.id.toString();
  const buyerIdStr = order.buyerId.toString();
  const sellerIdStr = order.sellerId.toString();

  if (user.role === "admin") {
    roleInOrder = "admin";
  } else if (userIdStr === sellerIdStr) {
    roleInOrder = "seller";
  } else if (userIdStr === buyerIdStr) {
    roleInOrder = "buyer";
  }

  if (!roleInOrder) {
    return {
      allowed: false,
      error: "Forbidden: You are not a party to this order.",
    };
  }

  // Terminal states cannot be transitioned
  if (currentStatus === "cancelled") {
    return {
      allowed: false,
      error: "Cannot change status: Order has already been cancelled.",
    };
  }
  if (currentStatus === "delivered" && targetStatus !== "disputed") {
    return {
      allowed: false,
      error: "Cannot change status: Order has already been completed.",
    };
  }

  // Strict dispute boundary: disputed orders can ONLY be resolved by an administrator
  if (currentStatus === "disputed" && roleInOrder !== "admin") {
    return {
      allowed: false,
      error: "Disputed orders are locked under administrator review. Only an administrator can resolve a dispute.",
    };
  }

  // Fulfillment coherence: delivery orders cannot bypass the 'shipped' step
  if (
    order.fulfillmentMethod === "delivery" &&
    (currentStatus === "confirmed" || currentStatus === "processing") &&
    targetStatus === "delivered" &&
    roleInOrder !== "admin"
  ) {
    return {
      allowed: false,
      error: `For delivery orders, the item must be dispatched and marked "shipped" before delivery can be confirmed. Direct delivery completion is only permitted for in-person campus meetups.`,
    };
  }

  // Find matching rule
  const rule = ORDER_TRANSITION_RULES.find(
    (r) => r.from === currentStatus && r.to === targetStatus
  );

  if (!rule) {
    return {
      allowed: false,
      error: `Invalid transition from "${currentStatus}" to "${targetStatus}".`,
    };
  }

  if (!rule.allowedRoles.includes(roleInOrder)) {
    return {
      allowed: false,
      error: `Unauthorized: Only the ${rule.allowedRoles.join(
        " or "
      )} can transition an order from "${currentStatus}" to "${targetStatus}".`,
    };
  }

  return { allowed: true, roleInOrder };
}

/**
 * Normalizes client status strings to canonical OrderStatus
 */
export function normalizeOrderStatus(statusStr: string): OrderStatus | null {
  if (!statusStr || typeof statusStr !== "string") return null;
  const s = statusStr.trim().toLowerCase();
  switch (s) {
    case "pending":
    case "pending admin verification":
      return "pending";
    case "confirmed":
    case "active":
      return "confirmed";
    case "processing":
      return "processing";
    case "shipped":
      return "shipped";
    case "delivered":
    case "completed":
      return "delivered";
    case "cancelled":
      return "cancelled";
    case "disputed":
    case "failed":
      return "disputed";
    default:
      return null;
  }
}
