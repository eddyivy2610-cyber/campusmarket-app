import mongoose, { Schema, Model } from "mongoose";

export type ContextEntityType = "product" | "service" | "wanted" | "store" | "offer";

export type ContextWorkflowStatus =
  | "Available"
  | "Offer pending"
  | "Pending"
  | "Accepted"
  | "Sold"
  | "Closed"
  | "Deal completed"
  | "Open request"
  | "Open today";

export type OfferLifecycleStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Withdrawn"
  | "Countered";

export type DealStatus =
  | "In progress"
  | "Needs confirmation"
  | "Completed"
  | "Didn't happen / Cancelled"
  | "Needs clarification";

export type CheckInResponseChoice =
  | "Completed"
  | "Still arranging"
  | "Didn't happen";

export interface ChatParticipantProfile {
  id: string;
  name: string;
  subtitle: string;
  avatar?: string;
  isVerified: boolean;
  accountType: "student" | "student_store" | "approved_business";
  // Distinct Trust Signals (Section 8: never conflate with payment verification)
  campusIdentityVerified?: boolean;
  businessApproved?: boolean;
  mutuallyConfirmedExchanges?: number;
  customerRating?: number;
  customerReviewsCount?: number;
  memberSince?: string;
  campusLocation?: string;
}

export interface ConversationContextRef {
  contextType: ContextEntityType;
  contextId: string;
  label: string;
  title: string;
  priceFormatted: string;
  numericPrice?: number;
  image?: string;
  status: ContextWorkflowStatus;
  href: string;
  attachedAt: string;
}

export interface AttachmentMetadata {
  url: string;
  fileName: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  sizeBytes: number;
}

export interface StructuredOfferDTO {
  id: string;
  conversationId: string;
  contextType: ContextEntityType;
  contextId: string;
  title: string;
  requesterId: string;
  sellerId: string;
  proposerId: string;
  amount: number;
  amountFormatted: string;
  explanation: string;
  conditionOrAvailability?: string;
  meetupDetails?: string;
  status: OfferLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrackedDealDTO {
  id: string;
  conversationId: string;
  contextType?: ContextEntityType;
  contextId?: string;
  resourceTitle: string;
  buyerId: string;
  sellerId: string;
  initiatedById: string;
  agreedPriceFormatted: string;
  agreedTerms: string;
  expectedMeetupDate?: string;
  status: DealStatus;
  // Independent participant responses: userId -> CheckInResponseChoice
  participantResponses: Record<string, CheckInResponseChoice>;
  isMutuallyConfirmed: boolean;
  hasConflict: boolean;
  checkInTriggered: boolean;
  reminderCount: number; // Max 1 automated reminder after initial check-in
  remindersStopped: boolean;
  schemaVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealReviewDTO {
  id: string;
  dealId: string;
  conversationId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  rating: number; // 1 to 5
  tags: string[];
  comment?: string;
  moderationStatus: "approved" | "flagged";
  schemaVersion?: number;
  createdAt: string;
}

export interface ChatMessageDTO {
  id: string;
  clientMessageId?: string;
  conversationId: string;
  senderId: string;
  type: "text" | "image" | "offer" | "system";
  text: string;
  attachment?: AttachmentMetadata;
  attachedContext?: ConversationContextRef;
  offer?: StructuredOfferDTO;
  deliveryStatus: "sent" | "delivered" | "read";
  schemaVersion?: number;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  participants: ChatParticipantProfile[];
  otherParticipant: ChatParticipantProfile;
  context: ConversationContextRef | null;
  additionalContexts: ConversationContextRef[];
  isBannerCollapsed: boolean;
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: string;
    type: "text" | "image" | "offer" | "system";
  } | null;
  unreadCount: number;
  activeOffer: StructuredOfferDTO | null;
  trackedDeal: TrackedDealDTO | null;
  reviews: DealReviewDTO[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Mongoose Schemas (Conversation, Message, Deal, Review)
// ============================================================================

const ParticipantSchema = new Schema<ChatParticipantProfile>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "Campus Member" },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    accountType: {
      type: String,
      enum: ["student", "student_store", "approved_business"],
      default: "student",
    },
    campusIdentityVerified: { type: Boolean, default: true },
    businessApproved: { type: Boolean, default: false },
    mutuallyConfirmedExchanges: { type: Number, default: 0 },
    customerRating: { type: Number, default: 4.9 },
    customerReviewsCount: { type: Number, default: 0 },
    memberSince: { type: String, default: "2025" },
    campusLocation: { type: String, default: "Main Campus" },
  },
  { _id: false }
);

const ContextRefSchema = new Schema<ConversationContextRef>(
  {
    contextType: {
      type: String,
      enum: ["product", "service", "wanted", "store", "offer"],
      required: true,
    },
    contextId: { type: String, required: true },
    label: { type: String, required: true },
    title: { type: String, required: true },
    priceFormatted: { type: String, required: true },
    numericPrice: { type: Number },
    image: { type: String },
    status: {
      type: String,
      enum: [
        "Available",
        "Offer pending",
        "Pending",
        "Accepted",
        "Sold",
        "Closed",
        "Deal completed",
        "Open request",
        "Open today",
      ],
      default: "Available",
    },
    href: { type: String, required: true },
    attachedAt: { type: String, required: true },
  },
  { _id: false }
);

export interface IConversationDoc {
  conversationId: string;
  participantIds: string[];
  participants: any[];
  context: ConversationContextRef | null;
  additionalContexts?: ConversationContextRef[];
  collapsedBy?: string[];
  unreadCounts: Record<string, number>;
  lastMessage?: any;
  status?: string;
  schemaVersion?: number;
  createdAt: any;
  updatedAt: any;
}

const ConversationSchema = new Schema<IConversationDoc>(
  {
    conversationId: { type: String, required: false, default: () => new mongoose.Types.ObjectId().toString(), index: true },
    participantIds: { type: [String], default: [] },
    participants: { type: [Schema.Types.Mixed] as any, required: true },
    context: { type: ContextRefSchema, default: null },
    additionalContexts: { type: [ContextRefSchema], default: [] },
    collapsedBy: { type: [String], default: [] },
    unreadCounts: { type: Schema.Types.Mixed, default: {} },
    lastMessage: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
      index: true,
    },
    schemaVersion: { type: Number, default: 1, required: true, index: true },
    createdAt: { type: Schema.Types.Mixed, default: () => new Date() },
    updatedAt: { type: Schema.Types.Mixed, default: () => new Date() },
  },
  {
    timestamps: true,
    minimize: false,
    strict: false,
    collection: "conversations",
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

export function extractParticipantId(p: any): string {
  if (!p) return "";
  if (typeof p === "string") return p;
  if (typeof p.toHexString === "function") return p.toHexString();
  if (p._id) {
    if (typeof p._id.toHexString === "function") return p._id.toHexString();
    return String(p._id);
  }
  if (typeof p.id === "string") return p.id;
  if (typeof p.toString === "function" && p.toString() !== "[object Object]") return p.toString();
  return String(p);
}

// Synchronize both participants (ObjectId) and participantIds (String) for dual-ecosystem interoperability
ConversationSchema.pre("validate", function (this: any, next: any) {
  if (this.participants && Array.isArray(this.participants)) {
    const stringIds = this.participants.map(extractParticipantId).filter(Boolean);
    this.participantIds = stringIds;
    // Normalize participants to ObjectIds so Express queries and population work seamlessly
    this.participants = stringIds
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));
  }
  if (!this.conversationId && this._id) {
    this.conversationId = String(this._id);
  }
  if (typeof next === "function") next();
});

(ConversationSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
  const update = this.getUpdate();
  if (update) {
    const parts = update.participants || update.$set?.participants;
    if (parts && Array.isArray(parts)) {
      const pIds = parts.map(extractParticipantId).filter(Boolean);
      const pObjIds = pIds
        .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
        .map((id: string) => new mongoose.Types.ObjectId(id));
      if (update.$set) {
        update.$set.participantIds = pIds;
        update.$set.participants = pObjIds;
      } else {
        update.participantIds = pIds;
        update.participants = pObjIds;
      }
    }
  }
});

// Dual compound indexes supporting both Express query patterns and Next.js query patterns with tie-breakers
ConversationSchema.index({ participants: 1, status: 1, "lastMessage.time": -1, _id: -1 });
ConversationSchema.index({ participantIds: 1, status: 1, updatedAt: -1, _id: -1 });

const DealSchema = new Schema<TrackedDealDTO>(
  {
    id: { type: String, required: true, unique: true, index: true },
    conversationId: { type: String, required: true, index: true },
    contextType: { type: String },
    contextId: { type: String },
    resourceTitle: { type: String, required: true },
    buyerId: { type: String, required: true },
    sellerId: { type: String, required: true },
    initiatedById: { type: String, required: true },
    agreedPriceFormatted: { type: String, required: true },
    agreedTerms: { type: String, default: "" },
    expectedMeetupDate: { type: String },
    status: {
      type: String,
      enum: [
        "In progress",
        "Needs confirmation",
        "Completed",
        "Didn't happen / Cancelled",
        "Needs clarification",
      ],
      default: "In progress",
    },
    participantResponses: { type: Schema.Types.Mixed, default: {} },
    isMutuallyConfirmed: { type: Boolean, default: false },
    hasConflict: { type: Boolean, default: false },
    checkInTriggered: { type: Boolean, default: true },
    reminderCount: { type: Number, default: 0 },
    remindersStopped: { type: Boolean, default: false },
    schemaVersion: { type: Number, default: 1, required: true, index: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { minimize: false, strict: true }
);

(DealSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
});

const ReviewSchema = new Schema<DealReviewDTO>({
  id: { type: String, required: true, unique: true, index: true },
  dealId: { type: String, required: true, index: true },
  conversationId: { type: String, required: true, index: true },
  reviewerId: { type: String, required: true },
  reviewerName: { type: String, required: true },
  revieweeId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  tags: { type: [String], default: [] },
  comment: { type: String },
  moderationStatus: {
    type: String,
    enum: ["approved", "flagged"],
    default: "approved",
  },
  schemaVersion: { type: Number, default: 1, required: true, index: true },
  createdAt: { type: String, required: true },
}, { strict: true });

(ReviewSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
});

const MessageSchema = new Schema<ChatMessageDTO>({
  id: { type: String, required: false },
  clientMessageId: { type: String, index: true },
  conversationId: { type: Schema.Types.Mixed, required: true },
  senderId: { type: Schema.Types.Mixed, required: true },
  type: {
    type: String,
    enum: ["text", "image", "offer", "system", "listing-card"],
    default: "text",
  },
  text: { type: String, required: true },
  attachment: {
    type: {
      url: String,
      fileName: String,
      mimeType: String,
      sizeBytes: Number,
    },
    required: false,
  },
  attachedContext: { type: ContextRefSchema, required: false },
  offer: { type: Schema.Types.Mixed, required: false },
  deliveryStatus: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "delivered",
  },
  schemaVersion: { type: Number, default: 1, required: true, index: true },
  createdAt: { type: Schema.Types.Mixed, default: () => new Date() },
}, {
  strict: false,
  collection: "messages",
  autoIndex: process.env.NODE_ENV !== "production",
});

MessageSchema.pre("validate", function (this: any, next: any) {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
  if (typeof next === "function") next();
});

(MessageSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
});

MessageSchema.index(
  { id: 1 },
  { unique: true, partialFilterExpression: { id: { $type: "string" } } }
);
MessageSchema.index({ conversationId: 1, createdAt: 1, _id: 1 });

export const ConversationModel: Model<IConversationDoc> =
  mongoose.models.CampusConversation ||
  mongoose.model<IConversationDoc>("CampusConversation", ConversationSchema, "conversations");

export const DealModel: Model<TrackedDealDTO> =
  mongoose.models.CampusDeal ||
  mongoose.model<TrackedDealDTO>("CampusDeal", DealSchema);

export const ReviewModel: Model<DealReviewDTO> =
  mongoose.models.CampusReview ||
  mongoose.model<DealReviewDTO>("CampusReview", ReviewSchema);

export const MessageModel: Model<ChatMessageDTO> =
  mongoose.models.CampusMessage ||
  mongoose.model<ChatMessageDTO>("CampusMessage", MessageSchema, "messages");
