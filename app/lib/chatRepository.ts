import {
  ChatMessageDTO,
  ChatParticipantProfile,
  CheckInResponseChoice,
  ContextEntityType,
  ContextWorkflowStatus,
  ConversationContextRef,
  ConversationDTO,
  DealReviewDTO,
  IConversationDoc,
  StructuredOfferDTO,
  TrackedDealDTO,
} from "../models/ChatModels";

export const DEFAULT_CURRENT_USER: ChatParticipantProfile = {
  id: "user-current-student",
  name: "Usman Ibrahim",
  subtitle: "Student · Ribadu Hall",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
  isVerified: true,
  accountType: "student",
  campusIdentityVerified: true,
  businessApproved: false,
  mutuallyConfirmedExchanges: 6,
  customerRating: 4.9,
  customerReviewsCount: 5,
  memberSince: "Sep 2024",
  campusLocation: "Ribadu Hall",
};

interface InternalChatStore {
  conversations: Map<string, IConversationDoc>;
  messagesByConv: Map<string, ChatMessageDTO[]>;
  offersById: Map<string, StructuredOfferDTO>;
  dealsByConv: Map<string, TrackedDealDTO>;
  reviewsByConv: Map<string, DealReviewDTO[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __CAMPUSHIVE_CHAT_STORE_V4__: InternalChatStore | undefined;
}

export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

export function getContextBannerLabel(contextType: ContextEntityType): string {
  switch (contextType) {
    case "wanted":
      return "RADAR REQUEST";
    case "service":
      return "SERVICE LISTING";
    case "store":
      return "CAMPUS STORE";
    case "offer":
      return "STRUCTURED OFFER";
    case "product":
    default:
      return "PRODUCT LISTING";
  }
}

function createSeededStore(): InternalChatStore {
  const conversations = new Map<string, IConversationDoc>();
  const messagesByConv = new Map<string, ChatMessageDTO[]>();
  const offersById = new Map<string, StructuredOfferDTO>();
  const dealsByConv = new Map<string, TrackedDealDTO>();
  const reviewsByConv = new Map<string, DealReviewDTO[]>();

  const me = DEFAULT_CURRENT_USER;

  // ==========================================================================
  // 1. Tunde Bello — Verified Student Seller (Product Listing + Deal Tracking)
  // ==========================================================================
  const tunde: ChatParticipantProfile = {
    id: "seller-tunde-bello",
    name: "Tunde Bello",
    subtitle: "Student · Suleiman Hall",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80",
    isVerified: true,
    accountType: "student",
    campusIdentityVerified: true,
    businessApproved: false,
    mutuallyConfirmedExchanges: 28,
    customerRating: 4.8,
    customerReviewsCount: 28,
    memberSince: "Oct 2026",
    campusLocation: "Suleiman Hall",
  };

  const conv1Id = "conv-tunde-calculator";
  const conv1Context: ConversationContextRef = {
    contextType: "product",
    contextId: "102",
    label: "PRODUCT LISTING",
    title: "Scientific calculator (Casio fx-991ES Plus)",
    priceFormatted: "₦7,000",
    numericPrice: 7000,
    image:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=300&auto=format&fit=crop&q=80",
    status: "Available",
    href: "/listings/102",
    attachedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  };

  const conv1RadarContext: ConversationContextRef = {
    contextType: "wanted",
    contextId: "req-amina",
    label: "RADAR REQUEST",
    title: "Looking for Casio fx-991ES / fx-991EX calculator for test this week",
    priceFormatted: "₦5,000–₦8,000",
    status: "Open request",
    href: "/wanted?id=req-amina",
    attachedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  };

  const conv1Messages: ChatMessageDTO[] = [
    {
      id: "msg-tunde-0",
      conversationId: conv1Id,
      senderId: me.id,
      type: "text",
      text: "Hey Tunde, I posted this request on Campus Radar earlier — do you still have your Casio calculator available?",
      attachedContext: conv1RadarContext,
      deliveryStatus: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    },
    {
      id: "msg-tunde-1",
      conversationId: conv1Id,
      senderId: tunde.id,
      type: "text",
      text: "Hi! Yes, here is my listing. It's in great condition and the solar + battery display is super clear. You can inspect it before buying.",
      attachedContext: conv1Context,
      deliveryStatus: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 26).toISOString(),
    },
    {
      id: "msg-tunde-2",
      conversationId: conv1Id,
      senderId: me.id,
      type: "text",
      text: "Can you do ₦6,500? I can meet near the Faculty of Science lobby after 2 PM.",
      deliveryStatus: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: "msg-tunde-3",
      conversationId: conv1Id,
      senderId: tunde.id,
      type: "text",
      text: "₦6,500 works for me! Let's meet at the Faculty of Science entrance by 2:15 PM.",
      deliveryStatus: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    },
  ];

  const deal1: TrackedDealDTO = {
    id: "deal-tunde-calc",
    conversationId: conv1Id,
    contextType: "product",
    contextId: "102",
    resourceTitle: "Scientific calculator (Casio fx-991ES Plus)",
    buyerId: me.id,
    sellerId: tunde.id,
    initiatedById: me.id,
    agreedPriceFormatted: "₦6,500",
    agreedTerms: "Inspect at Faculty of Science entrance",
    expectedMeetupDate: "Today, 2:15 PM",
    status: "Needs confirmation",
    participantResponses: {
      [tunde.id]: "Completed",
    },
    isMutuallyConfirmed: false,
    hasConflict: false,
    checkInTriggered: true,
    reminderCount: 0,
    remindersStopped: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  };
  dealsByConv.set(conv1Id, deal1);

  conversations.set(conv1Id, {
    conversationId: conv1Id,
    participantIds: [me.id, tunde.id],
    participants: [me, tunde],
    context: conv1Context,
    additionalContexts: [conv1RadarContext],
    collapsedBy: [],
    unreadCounts: { [me.id]: 0, [tunde.id]: 0 },
    lastMessage: {
      text: conv1Messages[conv1Messages.length - 1].text,
      senderId: tunde.id,
      createdAt: conv1Messages[conv1Messages.length - 1].createdAt,
      type: "text",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: conv1Messages[conv1Messages.length - 1].createdAt,
  });
  messagesByConv.set(conv1Id, conv1Messages);

  // ==========================================================================
  // 2. Tech Corner — Verified Student Seller
  // ==========================================================================
  const techCorner: ChatParticipantProfile = {
    id: "store-tech-corner",
    name: "Tech Corner",
    subtitle: "Student Store · Faculty of Engineering",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    isVerified: true,
    accountType: "student_store",
    campusIdentityVerified: true,
    businessApproved: false,
    mutuallyConfirmedExchanges: 64,
    customerRating: 4.8,
    customerReviewsCount: 64,
    memberSince: "Jan 2026",
    campusLocation: "Faculty of Engineering",
  };

  const conv2Id = "conv-tech-corner";
  const conv2Context: ConversationContextRef = {
    contextType: "product",
    contextId: "115",
    label: "PRODUCT LISTING",
    title: "Anker PowerCore 20,000mAh Fast Power Bank",
    priceFormatted: "₦18,000",
    numericPrice: 18000,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&auto=format&fit=crop&q=80",
    status: "Available",
    href: "/listings/115",
    attachedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  };

  const conv2Messages: ChatMessageDTO[] = [
    {
      id: "msg-tech-1",
      conversationId: conv2Id,
      senderId: me.id,
      type: "text",
      text: "Hello Tech Corner, is the Anker 20,000mAh power bank still sealed and available today?",
      deliveryStatus: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: "msg-tech-2",
      conversationId: conv2Id,
      senderId: techCorner.id,
      type: "text",
      text: "Yes it is! Brand new sealed box. We can meet at the Faculty of Engineering foyer whenever you're ready.",
      deliveryStatus: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    },
  ];

  conversations.set(conv2Id, {
    conversationId: conv2Id,
    participantIds: [me.id, techCorner.id],
    participants: [me, techCorner],
    context: conv2Context,
    additionalContexts: [],
    collapsedBy: [],
    unreadCounts: { [me.id]: 1, [techCorner.id]: 0 },
    lastMessage: {
      text: conv2Messages[conv2Messages.length - 1].text,
      senderId: techCorner.id,
      createdAt: conv2Messages[conv2Messages.length - 1].createdAt,
      type: "text",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: conv2Messages[conv2Messages.length - 1].createdAt,
  });
  messagesByConv.set(conv2Id, conv2Messages);

  // ==========================================================================
  // 3. The Print Hub — Non-Student Seller (Unverified)
  // ==========================================================================
  const printHub: ChatParticipantProfile = {
    id: "store-the-print-hub",
    name: "The Print Hub",
    subtitle: "Campus Business · Social Centre",
    avatar:
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=240&auto=format&fit=crop&q=80",
    isVerified: false,
    accountType: "approved_business",
    campusIdentityVerified: false,
    businessApproved: true,
    mutuallyConfirmedExchanges: 112,
    customerRating: 4.7,
    customerReviewsCount: 112,
    memberSince: "Mar 2025",
    campusLocation: "Student Social Centre",
  };

  const conv3Id = "conv-print-hub";
  const conv3Context: ConversationContextRef = {
    contextType: "service",
    contextId: "111",
    label: "SERVICE LISTING",
    title: "Thesis Printing, Spiral Binding & CAD Plotting",
    priceFormatted: "from ₦1,500",
    numericPrice: 1500,
    image:
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=300&auto=format&fit=crop&q=80",
    status: "Available",
    href: "/listings/111",
    attachedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  };

  const conv3Messages: ChatMessageDTO[] = [
    {
      id: "msg-print-1",
      conversationId: conv3Id,
      senderId: printHub.id,
      type: "text",
      text: "Hi! Send over your PDF drawing files whenever you're ready — A1 and A2 CAD plotting takes about 20 minutes.",
      deliveryStatus: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: "msg-print-2",
      conversationId: conv3Id,
      senderId: me.id,
      type: "text",
      text: "Awesome, I'll stop by the Social Centre desk this afternoon.",
      deliveryStatus: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 170).toISOString(),
    },
  ];

  conversations.set(conv3Id, {
    conversationId: conv3Id,
    participantIds: [me.id, printHub.id],
    participants: [me, printHub],
    context: conv3Context,
    additionalContexts: [],
    collapsedBy: [],
    unreadCounts: { [me.id]: 0, [printHub.id]: 0 },
    lastMessage: {
      text: conv3Messages[conv3Messages.length - 1].text,
      senderId: me.id,
      createdAt: conv3Messages[conv3Messages.length - 1].createdAt,
      type: "text",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: conv3Messages[conv3Messages.length - 1].createdAt,
  });
  messagesByConv.set(conv3Id, conv3Messages);

  // ==========================================================================
  // 4. Campus Closet — Verified Student Store
  // ==========================================================================
  const campusCloset: ChatParticipantProfile = {
    id: "store-campus-closet",
    name: "Campus Closet",
    subtitle: "Student Store · Social Centre",
    avatar:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=240&auto=format&fit=crop&q=80",
    isVerified: true,
    accountType: "student_store",
    campusIdentityVerified: true,
    businessApproved: true,
    mutuallyConfirmedExchanges: 42,
    customerRating: 4.9,
    customerReviewsCount: 42,
    memberSince: "Sep 2025",
    campusLocation: "Social Centre",
  };

  const conv4Id = "conv-store-campus-closet";
  const conv4Context: ConversationContextRef = {
    contextType: "store",
    contextId: "campus-closet",
    label: "CAMPUS STORE",
    title: "Campus Closet · Thrift & Streetwear",
    priceFormatted: "5 active listings",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format&fit=crop&q=80",
    status: "Open today",
    href: "/profile/campus-closet",
    attachedAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  };

  const conv4Messages: ChatMessageDTO[] = [
    {
      id: "msg-store-1",
      conversationId: conv4Id,
      senderId: campusCloset.id,
      type: "text",
      text: "Welcome to Campus Closet! Let us know which size you need for the vintage denim jacket or sneakers.",
      deliveryStatus: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    },
  ];

  conversations.set(conv4Id, {
    conversationId: conv4Id,
    participantIds: [me.id, campusCloset.id],
    participants: [me, campusCloset],
    context: conv4Context,
    additionalContexts: [],
    collapsedBy: [],
    unreadCounts: { [me.id]: 0, [campusCloset.id]: 0 },
    lastMessage: {
      text: conv4Messages[0].text,
      senderId: campusCloset.id,
      createdAt: conv4Messages[0].createdAt,
      type: "text",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    updatedAt: conv4Messages[0].createdAt,
  });
  messagesByConv.set(conv4Id, conv4Messages);

  return {
    conversations,
    messagesByConv,
    offersById,
    dealsByConv,
    reviewsByConv,
  };
}

function getStore(): InternalChatStore {
  if (!globalThis.__CAMPUSHIVE_CHAT_STORE_V4__) {
    globalThis.__CAMPUSHIVE_CHAT_STORE_V4__ = createSeededStore();
  }
  return globalThis.__CAMPUSHIVE_CHAT_STORE_V4__;
}

export function getConversationDoc(conversationId: string): IConversationDoc | null {
  const store = getStore();
  return store.conversations.get(conversationId) || null;
}

function getActiveOfferForConversation(
  store: InternalChatStore,
  conversationId: string
): StructuredOfferDTO | null {
  const offers: StructuredOfferDTO[] = [];
  store.offersById.forEach((offer) => {
    if (offer.conversationId === conversationId) {
      offers.push(offer);
    }
  });
  if (offers.length === 0) return null;
  offers.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return offers[0];
}

function toConversationDTO(
  store: InternalChatStore,
  doc: IConversationDoc,
  currentUserId: string
): ConversationDTO {
  const other =
    doc.participants.find((p) => p.id !== currentUserId) ||
    doc.participants[0] ||
    DEFAULT_CURRENT_USER;

  const activeOffer = getActiveOfferForConversation(store, doc.conversationId);
  const trackedDeal = store.dealsByConv.get(doc.conversationId) || null;
  const reviews = store.reviewsByConv.get(doc.conversationId) || [];

  return {
    id: doc.conversationId,
    participants: doc.participants,
    otherParticipant: other,
    context: doc.context,
    additionalContexts: doc.additionalContexts || [],
    isBannerCollapsed: (doc.collapsedBy || []).includes(currentUserId),
    lastMessage: doc.lastMessage,
    unreadCount: doc.unreadCounts?.[currentUserId] ?? 0,
    activeOffer,
    trackedDeal,
    reviews,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function ensureParticipant(
  doc: IConversationDoc,
  userId: string
): boolean {
  return doc.participantIds.includes(userId);
}

export function listConversationsForUser(params: {
  userId: string;
  query?: string;
  filter?: "all" | "unread" | "offers";
  page?: number;
  limit?: number;
}): {
  conversations: ConversationDTO[];
  total: number;
  hasMore: boolean;
} {
  const store = getStore();
  const { userId, query = "", filter = "all", page = 1, limit = 30 } = params;
  const q = query.trim().toLowerCase();

  const matching: ConversationDTO[] = [];

  store.conversations.forEach((doc) => {
    if (!ensureParticipant(doc, userId)) return;
    const dto = toConversationDTO(store, doc, userId);

    if (filter === "unread" && dto.unreadCount === 0) return;
    if (filter === "offers" && !dto.trackedDeal && !dto.activeOffer) return;

    if (q) {
      const matchesPerson =
        dto.otherParticipant.name.toLowerCase().includes(q) ||
        dto.otherParticipant.subtitle.toLowerCase().includes(q);
      const matchesContext =
        dto.context?.title.toLowerCase().includes(q) ||
        dto.additionalContexts.some((c) => c.title.toLowerCase().includes(q));
      const matchesLastMsg = dto.lastMessage?.text.toLowerCase().includes(q);

      if (!matchesPerson && !matchesContext && !matchesLastMsg) {
        return;
      }
    }

    matching.push(dto);
  });

  matching.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const start = (page - 1) * limit;
  const paginated = matching.slice(start, start + limit);

  return {
    conversations: paginated,
    total: matching.length,
    hasMore: start + limit < matching.length,
  };
}

export function getConversationWithMessages(params: {
  conversationId: string;
  userId: string;
  page?: number;
  limit?: number;
}): {
  conversation: ConversationDTO;
  messages: ChatMessageDTO[];
  totalMessages: number;
  hasOlderMessages: boolean;
} | null {
  const store = getStore();
  const { conversationId, userId, page = 1, limit = 50 } = params;
  const doc = store.conversations.get(conversationId);
  if (!doc) return null;

  if (!ensureParticipant(doc, userId)) {
    throw new Error("FORBIDDEN_NOT_PARTICIPANT");
  }

  doc.unreadCounts = {
    ...doc.unreadCounts,
    [userId]: 0,
  };

  const allMessages = store.messagesByConv.get(conversationId) || [];
  const totalMessages = allMessages.length;
  const endIndex = Math.max(0, totalMessages - (page - 1) * limit);
  const startIndex = Math.max(0, endIndex - limit);
  const slice = allMessages.slice(startIndex, endIndex);

  return {
    conversation: toConversationDTO(store, doc, userId),
    messages: slice,
    totalMessages,
    hasOlderMessages: startIndex > 0,
  };
}

export function findOrCreateConversation(params: {
  currentUser: ChatParticipantProfile;
  targetParticipant: ChatParticipantProfile;
  context?: {
    contextType: ContextEntityType;
    contextId: string;
    title: string;
    priceFormatted: string;
    numericPrice?: number;
    image?: string;
    status?: ContextWorkflowStatus;
    href: string;
  };
}): {
  conversation: ConversationDTO;
  reused: boolean;
  secondaryContextAttached: boolean;
} {
  const store = getStore();
  const { currentUser, targetParticipant, context } = params;

  const enrichedTarget: ChatParticipantProfile = {
    campusIdentityVerified: true,
    businessApproved: targetParticipant.accountType !== "student",
    mutuallyConfirmedExchanges: 5,
    customerRating: 4.9,
    customerReviewsCount: 4,
    memberSince: "2024",
    campusLocation: "Main Campus",
    ...targetParticipant,
  };

  const incomingContextRef: ConversationContextRef | null = context
    ? {
        contextType: context.contextType,
        contextId: context.contextId,
        label: getContextBannerLabel(context.contextType),
        title: context.title,
        priceFormatted: context.priceFormatted,
        numericPrice: context.numericPrice,
        image: context.image,
        status: context.status || "Available",
        href: context.href,
        attachedAt: new Date().toISOString(),
      }
    : null;

  let existingDoc: IConversationDoc | undefined;

  store.conversations.forEach((doc) => {
    const hasBoth =
      doc.participantIds.includes(currentUser.id) &&
      doc.participantIds.includes(enrichedTarget.id);
    if (!hasBoth) return;

    if (
      incomingContextRef &&
      doc.context &&
      doc.context.contextType === incomingContextRef.contextType &&
      doc.context.contextId === incomingContextRef.contextId
    ) {
      existingDoc = doc;
    } else if (!existingDoc) {
      existingDoc = doc;
    }
  });

  if (existingDoc) {
    let secondaryContextAttached = false;
    existingDoc.collapsedBy = (existingDoc.collapsedBy || []).filter(
      (id) => id !== currentUser.id
    );

    if (incomingContextRef) {
      if (!existingDoc.context) {
        existingDoc.context = incomingContextRef;
      } else if (
        existingDoc.context.contextType !== incomingContextRef.contextType ||
        existingDoc.context.contextId !== incomingContextRef.contextId
      ) {
        const alreadyInAdditional = (existingDoc.additionalContexts || []).some(
          (c) =>
            c.contextType === incomingContextRef.contextType &&
            c.contextId === incomingContextRef.contextId
        );
        if (!alreadyInAdditional) {
          existingDoc.additionalContexts = [
            ...(existingDoc.additionalContexts || []),
            incomingContextRef,
          ];
          secondaryContextAttached = true;

          const msgs = store.messagesByConv.get(existingDoc.conversationId) || [];
          const refMsg: ChatMessageDTO = {
            id: `msg-ctx-${Date.now()}`,
            conversationId: existingDoc.conversationId,
            senderId: currentUser.id,
            type: "text",
            text: `Also inquiring about: ${incomingContextRef.title} (${incomingContextRef.priceFormatted})`,
            attachedContext: incomingContextRef,
            deliveryStatus: "delivered",
            createdAt: new Date().toISOString(),
          };
          msgs.push(refMsg);
          store.messagesByConv.set(existingDoc.conversationId, msgs);
          existingDoc.lastMessage = {
            text: refMsg.text,
            senderId: currentUser.id,
            createdAt: refMsg.createdAt,
            type: "text",
          };
          existingDoc.updatedAt = refMsg.createdAt;
        }
      }
    }

    return {
      conversation: toConversationDTO(store, existingDoc, currentUser.id),
      reused: true,
      secondaryContextAttached,
    };
  }

  const now = new Date().toISOString();
  const newConvId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const initialMsg: ChatMessageDTO = {
    id: `msg-init-${Date.now()}`,
    conversationId: newConvId,
    senderId: enrichedTarget.id,
    type: "text",
    text: incomingContextRef
      ? `Hi! Thanks for reaching out regarding "${incomingContextRef.title}". Let me know how we can coordinate on campus.`
      : `Hi! Feel free to send a message anytime.`,
    deliveryStatus: "delivered",
    createdAt: now,
  };

  const newDoc: IConversationDoc = {
    conversationId: newConvId,
    participantIds: [currentUser.id, enrichedTarget.id],
    participants: [currentUser, enrichedTarget],
    context: incomingContextRef,
    additionalContexts: [],
    collapsedBy: [],
    unreadCounts: { [currentUser.id]: 0, [enrichedTarget.id]: 0 },
    lastMessage: {
      text: initialMsg.text,
      senderId: initialMsg.senderId,
      createdAt: now,
      type: "text",
    },
    createdAt: now,
    updatedAt: now,
  };

  store.conversations.set(newConvId, newDoc);
  store.messagesByConv.set(newConvId, [initialMsg]);

  return {
    conversation: toConversationDTO(store, newDoc, currentUser.id),
    reused: false,
    secondaryContextAttached: false,
  };
}

export function setBannerCollapsedState(params: {
  conversationId: string;
  userId: string;
  collapsed: boolean;
  contextStatus?: ContextWorkflowStatus;
}): ConversationDTO {
  const store = getStore();
  const { conversationId, userId, collapsed, contextStatus } = params;
  const doc = store.conversations.get(conversationId);
  if (!doc) {
    throw new Error("NOT_FOUND");
  }
  if (!ensureParticipant(doc, userId)) {
    throw new Error("FORBIDDEN_NOT_PARTICIPANT");
  }

  if (typeof collapsed === "boolean") {
    const set = new Set(doc.collapsedBy || []);
    if (collapsed) {
      set.add(userId);
    } else {
      set.delete(userId);
    }
    doc.collapsedBy = Array.from(set);
  }

  // Allow updating resource status (Available | Sold | Closed | Deal completed) while preserving historical context
  if (contextStatus && doc.context) {
    doc.context = {
      ...doc.context,
      status: contextStatus,
    };
  }

  return toConversationDTO(store, doc, userId);
}

export function appendMessageToConversation(params: {
  conversationId: string;
  senderId: string;
  text: string;
  clientMessageId?: string;
  attachment?: {
    url: string;
    fileName: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    sizeBytes: number;
  };
  attachedContext?: ConversationContextRef;
}): {
  message: ChatMessageDTO;
  conversation: ConversationDTO;
  duplicate: boolean;
} {
  const store = getStore();
  const {
    conversationId,
    senderId,
    text,
    clientMessageId,
    attachment,
    attachedContext,
  } = params;

  const doc = store.conversations.get(conversationId);
  if (!doc) {
    throw new Error("NOT_FOUND");
  }
  if (!ensureParticipant(doc, senderId)) {
    throw new Error("FORBIDDEN_NOT_PARTICIPANT");
  }

  const msgs = store.messagesByConv.get(conversationId) || [];

  if (clientMessageId) {
    const existing = msgs.find((m) => m.clientMessageId === clientMessageId);
    if (existing) {
      return {
        message: existing,
        conversation: toConversationDTO(store, doc, senderId),
        duplicate: true,
      };
    }
  }

  const now = new Date().toISOString();
  const newMessage: ChatMessageDTO = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    clientMessageId,
    conversationId,
    senderId,
    type: attachment ? "image" : "text",
    text: text.trim() || (attachment ? `Sent an image: ${attachment.fileName}` : ""),
    attachment,
    attachedContext,
    deliveryStatus: "delivered",
    createdAt: now,
  };

  msgs.push(newMessage);
  store.messagesByConv.set(conversationId, msgs);

  doc.lastMessage = {
    text: newMessage.text,
    senderId,
    createdAt: now,
    type: newMessage.type,
  };
  doc.updatedAt = now;

  doc.participantIds.forEach((pid) => {
    if (pid !== senderId) {
      doc.unreadCounts[pid] = (doc.unreadCounts[pid] || 0) + 1;
    }
  });

  return {
    message: newMessage,
    conversation: toConversationDTO(store, doc, senderId),
    duplicate: false,
  };
}

// ============================================================================
// Lightweight Optional Deal Tracking & Follow-Up Check-Ins (Sections 7 & 8)
// ============================================================================

export function startTrackingDeal(params: {
  conversationId: string;
  actorId: string;
  agreedPriceFormatted?: string;
  agreedTerms?: string;
  expectedMeetupDate?: string;
}): {
  deal: TrackedDealDTO;
  conversation: ConversationDTO;
} {
  const store = getStore();
  const {
    conversationId,
    actorId,
    agreedPriceFormatted,
    agreedTerms,
    expectedMeetupDate,
  } = params;

  const doc = store.conversations.get(conversationId);
  if (!doc) throw new Error("NOT_FOUND");
  if (!ensureParticipant(doc, actorId)) {
    throw new Error("FORBIDDEN_NOT_PARTICIPANT");
  }

  const other =
    doc.participants.find((p) => p.id !== actorId) || doc.participants[0];

  const now = new Date().toISOString();
  const deal: TrackedDealDTO = {
    id: `deal-${Date.now()}`,
    conversationId,
    contextType: doc.context?.contextType,
    contextId: doc.context?.contextId,
    resourceTitle: doc.context?.title || "Campus Exchange",
    buyerId: actorId,
    sellerId: other.id,
    initiatedById: actorId,
    agreedPriceFormatted:
      agreedPriceFormatted?.trim() ||
      doc.context?.priceFormatted ||
      "Agreed terms",
    agreedTerms:
      agreedTerms?.trim() || "Campus meetup and inspection",
    expectedMeetupDate: expectedMeetupDate?.trim() || "Today on campus",
    status: "In progress",
    participantResponses: {},
    isMutuallyConfirmed: false,
    hasConflict: false,
    checkInTriggered: true,
    reminderCount: 0,
    remindersStopped: false,
    createdAt: now,
    updatedAt: now,
  };

  store.dealsByConv.set(conversationId, deal);

  const msgs = store.messagesByConv.get(conversationId) || [];
  msgs.push({
    id: `msg-deal-start-${Date.now()}`,
    conversationId,
    senderId: actorId,
    type: "system",
    text: `Started tracking this deal (${deal.agreedPriceFormatted} · ${deal.expectedMeetupDate})`,
    deliveryStatus: "delivered",
    createdAt: now,
  });
  store.messagesByConv.set(conversationId, msgs);

  return {
    deal,
    conversation: toConversationDTO(store, doc, actorId),
  };
}

export function recordDealCheckInResponse(params: {
  conversationId: string;
  actorId: string;
  choice: CheckInResponseChoice;
}): {
  deal: TrackedDealDTO;
  conversation: ConversationDTO;
  systemMessage: ChatMessageDTO;
} {
  const store = getStore();
  const { conversationId, actorId, choice } = params;

  const doc = store.conversations.get(conversationId);
  if (!doc) throw new Error("NOT_FOUND");
  if (!ensureParticipant(doc, actorId)) {
    throw new Error("FORBIDDEN_NOT_PARTICIPANT");
  }

  const actorProfile =
    doc.participants.find((p) => p.id === actorId) || doc.participants[0];
  const otherProfile =
    doc.participants.find((p) => p.id !== actorId) || doc.participants[0];

  const now = new Date().toISOString();
  let deal = store.dealsByConv.get(conversationId);
  if (!deal) {
    deal = {
      id: `deal-${Date.now()}`,
      conversationId,
      contextType: doc.context?.contextType,
      contextId: doc.context?.contextId,
      resourceTitle: doc.context?.title || "Campus Exchange",
      buyerId: actorId,
      sellerId: otherProfile.id,
      initiatedById: actorId,
      agreedPriceFormatted: doc.context?.priceFormatted || "Agreed terms",
      agreedTerms: "Campus meetup and inspection",
      expectedMeetupDate: "Today on campus",
      status: "In progress",
      participantResponses: {},
      isMutuallyConfirmed: false,
      hasConflict: false,
      checkInTriggered: true,
      reminderCount: 0,
      remindersStopped: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Only the buyer or seller can confirm/respond to this deal
  if (actorId !== deal.buyerId && actorId !== deal.sellerId) {
    throw new Error("FORBIDDEN_NOT_DEAL_PARTY");
  }

  const wasAlreadyMutuallyConfirmed = deal.isMutuallyConfirmed;
  deal.participantResponses = {
    ...deal.participantResponses,
    [actorId]: choice,
  };

  const responses = Object.values(deal.participantResponses);
  const completedCount = responses.filter((r) => r === "Completed").length;
  const didntHappenCount = responses.filter(
    (r) => r === "Didn't happen"
  ).length;

  // Evaluate independent responses:
  // 1. Conflicting responses (one says Completed, the other says Didn't happen) -> neutral clarification
  if (completedCount > 0 && didntHappenCount > 0) {
    deal.hasConflict = true;
    deal.isMutuallyConfirmed = false;
    deal.status = "Needs clarification";
    deal.remindersStopped = true;
  } else if (completedCount >= 2) {
    // 2. Mutual confirmation by both participants
    deal.hasConflict = false;
    deal.isMutuallyConfirmed = true;
    deal.status = "Completed";
    deal.remindersStopped = true;

    if (!wasAlreadyMutuallyConfirmed) {
      doc.participants = doc.participants.map((p) => ({
        ...p,
        mutuallyConfirmedExchanges: (p.mutuallyConfirmedExchanges || 0) + 1,
      }));
    }
  } else if (completedCount === 1) {
    // 3. One-sided confirmation -> waiting for the other participant
    deal.hasConflict = false;
    deal.isMutuallyConfirmed = false;
    deal.status = "Needs confirmation";
  } else if (didntHappenCount > 0) {
    deal.hasConflict = false;
    deal.isMutuallyConfirmed = false;
    deal.status = "Didn't happen / Cancelled";
    deal.remindersStopped = true;
  } else {
    deal.hasConflict = false;
    deal.isMutuallyConfirmed = false;
    deal.status = "In progress";
  }

  deal.updatedAt = now;
  store.dealsByConv.set(conversationId, deal);

  // Build non-removable grey system message for both users in the main chat thread
  let alertText = "";
  if (choice === "Completed") {
    if (deal.isMutuallyConfirmed) {
      alertText = `${actorProfile.name} marked the deal as completed · Deal mutually confirmed`;
    } else if (deal.hasConflict) {
      alertText = `${actorProfile.name} marked the deal as completed · Status needs clarification`;
    } else {
      alertText = `${actorProfile.name} marked the deal as completed · Waiting for ${otherProfile.name} to confirm`;
    }
  } else {
    if (deal.hasConflict) {
      alertText = `${actorProfile.name} marked the deal as incomplete · Status needs clarification`;
    } else {
      alertText = `${actorProfile.name} marked the deal as incomplete`;
    }
  }

  const systemMessage: ChatMessageDTO = {
    id: `msg-deal-action-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversationId,
    senderId: actorId,
    type: "system",
    text: alertText,
    deliveryStatus: "delivered",
    createdAt: now,
  };

  const msgs = store.messagesByConv.get(conversationId) || [];
  msgs.push(systemMessage);
  store.messagesByConv.set(conversationId, msgs);

  // Update conversation lastMessage and increment unread count for the other participant
  doc.lastMessage = {
    text: systemMessage.text,
    senderId: actorId,
    createdAt: now,
    type: "system",
  };
  doc.updatedAt = now;

  doc.participantIds.forEach((pid) => {
    if (pid !== actorId) {
      doc.unreadCounts[pid] = (doc.unreadCounts[pid] || 0) + 1;
    }
  });

  return {
    deal,
    conversation: toConversationDTO(store, doc, actorId),
    systemMessage,
  };
}

export function triggerIdempotentDealReminder(params: {
  conversationId: string;
  actorId: string;
}): {
  deal: TrackedDealDTO;
  reminderSent: boolean;
  reason?: string;
  conversation: ConversationDTO;
} {
  const store = getStore();
  const { conversationId, actorId } = params;

  const doc = store.conversations.get(conversationId);
  if (!doc) throw new Error("NOT_FOUND");
  if (!ensureParticipant(doc, actorId)) {
    throw new Error("FORBIDDEN_NOT_PARTICIPANT");
  }

  const deal = store.dealsByConv.get(conversationId);
  if (!deal) throw new Error("DEAL_NOT_FOUND");

  // Rule (Section 8): Send at most one reminder to non-responders after the initial check-in,
  // then stop automated reminders until a meaningful new event occurs.
  if (
    deal.remindersStopped ||
    deal.reminderCount >= 1 ||
    deal.status === "Completed" ||
    deal.status === "Didn't happen / Cancelled"
  ) {
    deal.remindersStopped = true;
    store.dealsByConv.set(conversationId, deal);
    return {
      deal,
      reminderSent: false,
      reason:
        "Maximum of 1 check-in reminder already sent. Automated reminders are stopped.",
      conversation: toConversationDTO(store, doc, actorId),
    };
  }

  deal.reminderCount += 1;
  deal.remindersStopped = true;
  deal.updatedAt = new Date().toISOString();
  store.dealsByConv.set(conversationId, deal);

  return {
    deal,
    reminderSent: true,
    conversation: toConversationDTO(store, doc, actorId),
  };
}

export function submitOptionalDealReview(params: {
  conversationId: string;
  reviewerId: string;
  rating: number;
  tags?: string[];
  comment?: string;
}): {
  review: DealReviewDTO;
  conversation: ConversationDTO;
} {
  const store = getStore();
  const { conversationId, reviewerId, rating, tags = [], comment } = params;

  const doc = store.conversations.get(conversationId);
  if (!doc) throw new Error("NOT_FOUND");
  if (!ensureParticipant(doc, reviewerId)) {
    throw new Error("FORBIDDEN_NOT_PARTICIPANT");
  }

  const deal = store.dealsByConv.get(conversationId);
  if (!deal) {
    throw new Error("NO_ELIGIBLE_DEAL");
  }

  // Only a party to the deal (buyer or seller) can submit a review
  if (reviewerId !== deal.buyerId && reviewerId !== deal.sellerId) {
    throw new Error("FORBIDDEN_NOT_DEAL_PARTY");
  }

  // Only eligible exchanges (where this participant confirmed completion or deal is mutually confirmed) can leave transaction-linked reviews
  const userChoice = deal.participantResponses[reviewerId];
  if (userChoice !== "Completed" && !deal.isMutuallyConfirmed && deal.status !== "Completed") {
    throw new Error("EXCHANGE_NOT_CONFIRMED");
  }

  const existingReviews = store.reviewsByConv.get(conversationId) || [];
  if (
    existingReviews.some(
      (r) => r.dealId === deal.id && r.reviewerId === reviewerId
    )
  ) {
    throw new Error("DUPLICATE_REVIEW");
  }

  const reviewer =
    doc.participants.find((p) => p.id === reviewerId) || DEFAULT_CURRENT_USER;
  const reviewee =
    doc.participants.find((p) => p.id !== reviewerId) || doc.participants[0];

  if (reviewer.id === reviewee.id) {
    throw new Error("CANNOT_REVIEW_SELF");
  }

  const cleanRating = Math.min(5, Math.max(1, Math.round(rating)));
  const newReview: DealReviewDTO = {
    id: `rev-${Date.now()}`,
    dealId: deal.id,
    conversationId,
    reviewerId,
    reviewerName: reviewer.name,
    revieweeId: reviewee.id,
    rating: cleanRating,
    tags: tags.slice(0, 5),
    comment: comment?.trim().slice(0, 400),
    moderationStatus: "approved",
    createdAt: new Date().toISOString(),
  };

  store.reviewsByConv.set(conversationId, [newReview, ...existingReviews]);

  // Update reviewee's customer rating
  doc.participants = doc.participants.map((p) => {
    if (p.id !== reviewee.id) return p;
    const prevCount = p.customerReviewsCount || 0;
    const prevRating = p.customerRating || 5.0;
    const nextCount = prevCount + 1;
    const nextRating = Number(
      ((prevRating * prevCount + cleanRating) / nextCount).toFixed(1)
    );
    return {
      ...p,
      customerReviewsCount: nextCount,
      customerRating: nextRating,
    };
  });

  return {
    review: newReview,
    conversation: toConversationDTO(store, doc, reviewerId),
  };
}

// Keep structured offer helpers for compatibility
export function createStructuredOffer(params: {
  conversationId: string;
  proposerId: string;
  amount: number;
  explanation?: string;
  conditionOrAvailability?: string;
  meetupDetails?: string;
}) {
  const store = getStore();
  const { conversationId, proposerId, amount, explanation } = params;
  const doc = store.conversations.get(conversationId);
  if (!doc) throw new Error("NOT_FOUND");
  if (!ensureParticipant(doc, proposerId)) {
    throw new Error("FORBIDDEN_NOT_PARTICIPANT");
  }
  const other =
    doc.participants.find((p) => p.id !== proposerId) || doc.participants[0];
  const now = new Date().toISOString();
  const offer: StructuredOfferDTO = {
    id: `offer-${Date.now()}`,
    conversationId,
    contextType: doc.context?.contextType || "product",
    contextId: doc.context?.contextId || conversationId,
    title: doc.context?.title || "Campus Listing",
    requesterId: proposerId,
    sellerId: other.id,
    proposerId,
    amount,
    amountFormatted: formatNaira(amount),
    explanation: explanation || "Proposed price",
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  };
  store.offersById.set(offer.id, offer);
  const message: ChatMessageDTO = {
    id: `msg-offer-${Date.now()}`,
    conversationId,
    senderId: proposerId,
    type: "offer",
    text: `Offer: ${offer.amountFormatted}`,
    offer,
    deliveryStatus: "delivered",
    createdAt: now,
  };
  const msgs = store.messagesByConv.get(conversationId) || [];
  msgs.push(message);
  store.messagesByConv.set(conversationId, msgs);
  return {
    offer,
    message,
    conversation: toConversationDTO(store, doc, proposerId),
  };
}

export function transitionStructuredOffer(params: {
  conversationId: string;
  offerId: string;
  actorId: string;
  action: "accept" | "reject" | "withdraw" | "counter";
  counterAmount?: number;
  counterExplanation?: string;
  counterMeetupDetails?: string;
}) {
  const store = getStore();
  const { conversationId, offerId, actorId, action, counterAmount } = params;
  const doc = store.conversations.get(conversationId);
  if (!doc) throw new Error("NOT_FOUND");
  if (!ensureParticipant(doc, actorId)) {
    throw new Error("FORBIDDEN_NOT_PARTICIPANT");
  }
  const offer = store.offersById.get(offerId);
  if (!offer) throw new Error("OFFER_NOT_FOUND");

  if (offer.status !== "Pending" && offer.status !== "Countered") {
    throw new Error("INVALID_OFFER_STATE");
  }

  if (action === "withdraw") {
    if (offer.proposerId !== actorId) {
      throw new Error("ONLY_PROPOSER_CAN_WITHDRAW");
    }
  } else {
    // Only the target party (non-proposer) can accept/reject/counter
    if (offer.proposerId === actorId) {
      throw new Error("CANNOT_ACCEPT_OWN_OFFER");
    }
    const targetPartyId =
      offer.proposerId === offer.requesterId ? offer.sellerId : offer.requesterId;
    if (targetPartyId && actorId !== targetPartyId) {
      throw new Error("ONLY_TARGET_PARTY_CAN_ACCEPT");
    }
  }

  const now = new Date().toISOString();
  if (action === "accept") offer.status = "Accepted";
  if (action === "reject") offer.status = "Rejected";
  if (action === "withdraw") offer.status = "Withdrawn";
  if (action === "counter" && counterAmount) {
    offer.amount = counterAmount;
    offer.amountFormatted = formatNaira(counterAmount);
    offer.status = "Countered";
  }
  offer.updatedAt = now;
  store.offersById.set(offer.id, offer);
  const message: ChatMessageDTO = {
    id: `msg-offer-act-${Date.now()}`,
    conversationId,
    senderId: actorId,
    type: "system",
    text: `Offer ${offer.status.toLowerCase()}: ${offer.amountFormatted}`,
    deliveryStatus: "delivered",
    createdAt: now,
  };
  return {
    offer,
    message,
    conversation: toConversationDTO(store, doc, actorId),
  };
}
