import mongoose, { Schema, Model, Document, Types } from "mongoose";
import crypto from "crypto";
import "./User";
import "./Listing";
import "./Store";
import {
  ORDER_STATUSES,
  ORDER_FULFILLMENT_METHODS,
  ORDER_PAYMENT_METHODS,
  OrderStatus,
  OrderFulfillmentMethod,
  OrderPaymentMethod,
} from "@/constants/enums";

export interface IOrderItem {
  listingId: Types.ObjectId | string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  listingType?: "product" | "service";
  serviceDetails?: {
    pricingModel?: string;
    deliveryTime?: string;
    serviceLocationType?: string;
  };
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  updatedBy: string; // User ID who initiated the transition
  updatedAt: Date;
  comment?: string;
}

export interface IOrder {
  id: string;
  orderId: string; // e.g. "ORD-123456-CH"
  buyerId: Types.ObjectId | string;
  sellerId: Types.ObjectId | string;
  storeId?: Types.ObjectId | string;
  conversationId?: string; // Links order to conversation/chat context
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  fulfillmentMethod: OrderFulfillmentMethod;
  meetupLocation?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    phone?: string;
  };
  notes?: string;
  idempotencyKey?: string; // Client idempotency key to prevent accidental duplicate orders
  history: IOrderStatusHistory[];
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderDocument extends Omit<IOrder, "id">, Document {}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "CampusListing",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    listingType: { type: String, enum: ["product", "service"], default: "product" },
    serviceDetails: {
      pricingModel: { type: String },
      deliveryTime: { type: String },
      serviceLocationType: { type: String },
    },
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    updatedBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "CampusUser",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "CampusUser",
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "CampusStore",
      index: true,
      sparse: true,
    },
    conversationId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    idempotencyKey: {
      type: String,
      trim: true,
      sparse: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [
        (val: IOrderItem[]) => val.length > 0,
        "Order must contain at least one item.",
      ],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ORDER_PAYMENT_METHODS,
      required: true,
      default: "cash",
    },
    fulfillmentMethod: {
      type: String,
      enum: ORDER_FULFILLMENT_METHODS,
      required: true,
      default: "pickup",
    },
    meetupLocation: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    shippingAddress: {
      street: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, maxlength: 100 },
      state: { type: String, trim: true, maxlength: 100 },
      phone: { type: String, trim: true, maxlength: 30 },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    history: {
      type: [OrderStatusHistorySchema],
      default: [],
    },
    schemaVersion: {
      type: Number,
      default: 1,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Database-enforced unique index for human-readable order references
OrderSchema.index({ orderId: 1 }, { unique: true });

// Scoped idempotency index to prevent duplicate order placements on client retries.
// Uses partialFilterExpression to ignore documents without an idempotencyKey.
OrderSchema.index(
  { buyerId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } },
  }
);

// High-performance ESR compound indexes
OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ storeId: 1, createdAt: -1 }, { sparse: true });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "items.listingId": 1 });

(OrderSchema as any).pre(
  ["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  function (this: any) {
    this.setOptions({ runValidators: true });
  }
);

/**
 * Generate human-readable canonical order reference ID: ORD-XXXXXX-CH
 * Cryptographically random 6-digit numeric portion
 */
export function generateOrderId(): string {
  const randomPart = crypto.randomInt(100000, 1000000);
  return `ORD-${randomPart}-CH`;
}

/**
 * Saves order document with automatic retry on orderId collision.
 * Enforces that retries occur strictly for an orderId uniqueness collision,
 * never for unrelated duplicate-key errors or model validation failures.
 */
export async function saveOrderWithIdRetry<T extends Document>(
  orderDoc: T,
  maxRetries = 5
): Promise<T> {
  let attempt = 0;
  const orderObj = orderDoc as any;

  while (attempt <= maxRetries) {
    try {
      return (await orderDoc.save()) as T;
    } catch (err: any) {
      // Retries occur strictly for an orderId uniqueness collision, NOT for unrelated duplicate-key errors
      const isOrderIdConflict =
        err?.code === 11000 &&
        (Boolean(err?.keyPattern?.orderId) ||
          Boolean(err?.keyValue?.orderId) ||
          (typeof err?.message === "string" && err.message.includes("index: orderId_")));

      if (isOrderIdConflict && attempt < maxRetries) {
        attempt += 1;
        orderObj.orderId = generateOrderId();
      } else {
        // Non-orderId conflicts or exhausted retries: rethrow immediately without retrying
        throw err;
      }
    }
  }
  return (await orderDoc.save()) as T;
}

const OrderModel: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);

export { OrderModel };
export default OrderModel;
