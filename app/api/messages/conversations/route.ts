import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  findOrCreateConversation,
  listConversationsForUser,
  registerConversationDoc,
  getConversationDoc,
} from "../../../lib/chatRepository";
import {
  ChatParticipantProfile,
  ContextEntityType,
  ContextWorkflowStatus,
  ConversationModel,
} from "../../../models/ChatModels";
import { requireAuth, requireCompletedOnboarding, ServerAuthUser } from "../../../lib/authServer";
import UserModel, { formatFirstNameInitial } from "../../../models/User";
import StoreModel from "../../../models/Store";
import dbConnect from "../../../lib/dbConnect";

function buildChatParticipantProfile(user: ServerAuthUser): ChatParticipantProfile {
  return {
    id: user.id,
    name: formatFirstNameInitial(user.name),
    subtitle: user.campus || (user.isStudent ? "Verified Student" : "Campus Member"),
    isVerified: user.studentVerified ?? false,
    accountType: "student",
  };
}

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) {
      return errorResponse;
    }
    const currentUser = buildChatParticipantProfile(user);
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q") || "";
    const filterParam = searchParams.get("filter") || "all";
    const storeIdFilter = searchParams.get("storeId")?.trim() || "";
    const cursor = searchParams.get("cursor");
    const filter =
      filterParam === "unread" || filterParam === "offers"
        ? filterParam
        : "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "30", 10))
    );

    await dbConnect();

    // Hydrate sender's profile avatar from MongoDB so recipients see the sender's real avatar
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(currentUser.id)) {
      try {
        const senderDoc: any = await UserModel.findById(currentUser.id)
          .select("avatar profile.avatar")
          .lean();
        const senderAvatar = senderDoc?.profile?.avatar || senderDoc?.avatar;
        if (senderAvatar) {
          currentUser.avatar = String(senderAvatar);
        }
      } catch {}
    }

    // 1. Cursor Pagination on MongoDB if cursor is passed or DB has conversations
    if (mongoose.connection.readyState === 1 && (cursor || !page || page === 1)) {
      try {
        let pivotConv: any = null;
        if (cursor) {
          pivotConv = await ConversationModel.findOne({
            $or: [
              { conversationId: cursor },
              ...(mongoose.isValidObjectId(cursor) ? [{ _id: new mongoose.Types.ObjectId(cursor) }] : []),
            ],
          }).select("updatedAt _id").lean();
        }

        const queryFilter: any = {
          $or: [
            { participantIds: currentUser.id },
            ...(mongoose.isValidObjectId(currentUser.id) ? [{ participants: new mongoose.Types.ObjectId(currentUser.id) }] : []),
          ],
          lastMessage: { $ne: null },
          "lastMessage.text": { $exists: true, $ne: "" },
        };

        if (pivotConv) {
          queryFilter.$and = [
            {
              $or: [
                { updatedAt: { $lt: pivotConv.updatedAt } },
                { updatedAt: pivotConv.updatedAt, _id: { $lt: pivotConv._id } },
              ],
            },
          ];
        }

        const dbConversations = await ConversationModel.find(queryFilter)
          .sort({ updatedAt: -1, _id: -1 })
          .limit(limit + 1)
          .lean();

        if (dbConversations.length > 0 || cursor) {
          const hasMore = dbConversations.length > limit;
          const paginated = hasMore ? dbConversations.slice(0, limit) : dbConversations;
          const nextCursor =
            hasMore && paginated.length > 0
              ? paginated[paginated.length - 1].conversationId || paginated[paginated.length - 1]._id.toString()
              : null;

          const missingUserIds = new Set<string>();
          if (mongoose.isValidObjectId(currentUser.id)) {
            missingUserIds.add(currentUser.id);
          }
          for (const c of paginated) {
            const pIds: string[] = Array.isArray(c.participantIds) ? c.participantIds.map(String) : [];
            const oid = pIds.find((id) => id !== currentUser.id) || "";
            if (oid && mongoose.isValidObjectId(oid)) {
              missingUserIds.add(oid);
            }
          }

          const avatarByUserId = new Map<string, string>();
          if (missingUserIds.size > 0) {
            try {
              const userDocs: any[] = await UserModel.find({
                _id: { $in: Array.from(missingUserIds).map((id) => new mongoose.Types.ObjectId(id)) },
              })
                .select("avatar profile.avatar")
                .lean();
              for (const u of userDocs) {
                const av = u?.profile?.avatar || u?.avatar;
                if (av) avatarByUserId.set(String(u._id), String(av));
              }
            } catch {}
          }

          if (!currentUser.avatar && avatarByUserId.has(currentUser.id)) {
            currentUser.avatar = avatarByUserId.get(currentUser.id);
          }

          const mappedConversations = paginated.map((c: any) => {
            const convId = c.conversationId || c._id.toString();
            const participantIds: string[] = Array.isArray(c.participantIds) && c.participantIds.length > 0
              ? c.participantIds.map(String)
              : Array.isArray(c.participants)
                ? c.participants.map((p: any) => String(p?.id || p?._id || p))
                : [];
            const otherId =
              participantIds.find((id) => id !== currentUser.id) ||
              participantIds[0] ||
              "";
            const rawOther = Array.isArray(c.participants)
              ? c.participants.find((p: any) => {
                  const pid = p?.id ? String(p.id) : p?._id ? String(p._id) : String(p);
                  return pid && pid !== currentUser.id;
                })
              : null;
            const resolvedOtherAvatar =
              (rawOther as any)?.avatar || avatarByUserId.get(otherId) || undefined;
            const otherParticipant: ChatParticipantProfile =
              rawOther && typeof rawOther === "object" && "name" in rawOther
                ? {
                    ...rawOther,
                    id: rawOther.id ? String(rawOther.id) : otherId,
                    ...(resolvedOtherAvatar ? { avatar: resolvedOtherAvatar } : {}),
                  }
                : {
                    id: otherId,
                    name: (rawOther as any)?.name || "Campus Member",
                    subtitle: (rawOther as any)?.subtitle || "Campus Member",
                    avatar: resolvedOtherAvatar,
                    isVerified: Boolean((rawOther as any)?.isVerified),
                    accountType: (rawOther as any)?.accountType || "student",
                  };

            const updatedAtIso =
              (c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt) ||
              new Date().toISOString();
            const createdAtIso =
              (c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt) ||
              new Date().toISOString();

            registerConversationDoc(convId, {
              conversationId: convId,
              participantIds,
              participants:
                Array.isArray(c.participants) &&
                c.participants.every((p: any) => p && typeof p === "object" && "name" in p)
                  ? c.participants
                  : [currentUser, otherParticipant],
              context: c.context || null,
              additionalContexts: c.additionalContexts || [],
              collapsedBy: c.collapsedBy || [],
              unreadCounts: c.unreadCounts || { [currentUser.id]: 0 },
              lastMessage: c.lastMessage || undefined,
              createdAt: createdAtIso,
              updatedAt: updatedAtIso,
            });

            return {
              id: convId,
              conversationId: convId,
              participantIds,
              participants: c.participants || [currentUser, otherParticipant],
              otherParticipant,
              context: c.context || null,
              additionalContexts: c.additionalContexts || [],
              isBannerCollapsed: Array.isArray(c.collapsedBy) && c.collapsedBy.includes(currentUser.id),
              lastMessage: c.lastMessage || null,
              unreadCount: (c.unreadCounts && c.unreadCounts[currentUser.id]) || 0,
              activeOffer: null,
              trackedDeal: null,
              reviews: [],
              updatedAt: updatedAtIso,
              createdAt: createdAtIso,
            };
          });

          let filteredConversations = mappedConversations;
          if (query) {
            const q = query.toLowerCase();
            filteredConversations = filteredConversations.filter(
              (c: any) =>
                c.otherParticipant?.name?.toLowerCase().includes(q) ||
                c.lastMessage?.text?.toLowerCase().includes(q) ||
                c.context?.title?.toLowerCase().includes(q)
            );
          }
          if (storeIdFilter) {
            filteredConversations = filteredConversations.filter(
              (c: any) =>
                String(c.storeId || c.context?.storeId || "") === storeIdFilter
            );
          }

          return NextResponse.json({
            currentUser,
            conversations: filteredConversations,
            nextCursor,
            hasMore,
            total: filteredConversations.length,
          });
        }
      } catch (dbErr) {
        console.warn("[ConversationsGET] MongoDB cursor lookup fallback:", dbErr);
      }
    }

    const result = listConversationsForUser({
      userId: currentUser.id,
      query,
      filter,
      page,
      limit,
    });

    if (storeIdFilter) {
      result.conversations = result.conversations.filter(
        (c: any) =>
          String(c.storeId || c.context?.storeId || "") === storeIdFilter
      );
      result.total = result.conversations.length;
    }

    return NextResponse.json({
      currentUser,
      ...result,
    });
  } catch (error) {
    console.error("Failed to list conversations:", error);
    return NextResponse.json(
      { error: "Unable to load conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) {
      return errorResponse;
    }
    const currentUser = buildChatParticipantProfile(user);
    const body = await req.json();

    let participantId = String(body.participantId || "").trim();
    let participantName = String(body.participantName || "").trim();
    let resolvedStoreAvatar: string | undefined = body.participantAvatar
      ? String(body.participantAvatar)
      : undefined;

    const topLevelStoreId = body.storeId ? String(body.storeId).trim() : undefined;

    if (topLevelStoreId) {
      try {
        await dbConnect();

    // Hydrate sender's profile avatar from MongoDB so recipients see the sender's real avatar
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(currentUser.id)) {
      try {
        const senderDoc: any = await UserModel.findById(currentUser.id)
          .select("avatar profile.avatar")
          .lean();
        const senderAvatar = senderDoc?.profile?.avatar || senderDoc?.avatar;
        if (senderAvatar) {
          currentUser.avatar = String(senderAvatar);
        }
      } catch {}
    }
        const storeDoc: any = mongoose.isValidObjectId(topLevelStoreId)
          ? await StoreModel.findById(topLevelStoreId).select("ownerId name logo").lean()
          : await StoreModel.findOne({ slug: topLevelStoreId.toLowerCase() })
              .select("ownerId name logo")
              .lean();
        if (storeDoc?.ownerId) {
          participantId = String(storeDoc.ownerId);
        }
        if (!participantName && storeDoc?.name) {
          participantName = String(storeDoc.name);
        }
        if (!resolvedStoreAvatar && storeDoc?.logo) {
          resolvedStoreAvatar = String(storeDoc.logo);
        }
      } catch {
        // Fallback to provided participantId if store lookup fails
      }
    }

    if (!participantId || !participantName) {
      return NextResponse.json(
        { error: "Target participant identity is required" },
        { status: 400 }
      );
    }

    if (participantId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    const targetParticipant: ChatParticipantProfile = {
      id: participantId,
      name: participantName.slice(0, 80),
      subtitle: String(body.participantSubtitle || "Student · Main Campus").slice(
        0,
        100
      ),
      avatar: resolvedStoreAvatar,
      // Never trust client-supplied verification claims
      isVerified: false,
      accountType:
        body.accountType === "student_store" ||
        body.accountType === "approved_business"
          ? body.accountType
          : "student",
    };

    const validContextTypes: ContextEntityType[] = [
      "product",
      "service",
      "wanted",
      "store",
      "offer",
    ];
    let contextPayload:
      | {
          contextType: ContextEntityType;
          contextId: string;
          storeId?: string;
          title: string;
          priceFormatted: string;
          numericPrice?: number;
          image?: string;
          status?: ContextWorkflowStatus;
          href: string;
        }
      | undefined;

    if (body.context && body.context.title) {
      const cType: ContextEntityType = validContextTypes.includes(
        body.context.contextType
      )
        ? body.context.contextType
        : "product";

      const ctxStoreId = body.context.storeId
        ? String(body.context.storeId).trim()
        : topLevelStoreId;

      contextPayload = {
        contextType: cType,
        contextId: String(body.context.contextId || `ctx-${Date.now()}`),
        storeId: ctxStoreId,
        title: String(body.context.title).slice(0, 140),
        priceFormatted: String(body.context.priceFormatted || "Negotiable").slice(
          0,
          40
        ),
        numericPrice: body.context.numericPrice
          ? Number(body.context.numericPrice)
          : undefined,
        image: body.context.image ? String(body.context.image) : undefined,
        status: (body.context.status as ContextWorkflowStatus) || "Available",
        href: String(body.context.href || "/explore"),
      };
    }

    await dbConnect();

    // Hydrate sender's profile avatar from MongoDB so recipients see the sender's real avatar
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(currentUser.id)) {
      try {
        const senderDoc: any = await UserModel.findById(currentUser.id)
          .select("avatar profile.avatar")
          .lean();
        const senderAvatar = senderDoc?.profile?.avatar || senderDoc?.avatar;
        if (senderAvatar) {
          currentUser.avatar = String(senderAvatar);
        }
      } catch {}
    }

    // Check MongoDB for an existing conversation between these two participants across serverless instances
    if (mongoose.connection.readyState === 1) {
      try {
        const existingDbConv: any = await ConversationModel.findOne({
          participantIds: { $all: [currentUser.id, participantId] },
          $expr: { $eq: [{ $size: "$participantIds" }, 2] },
        }).lean();

        if (existingDbConv) {
          const convId = existingDbConv.conversationId || String(existingDbConv._id);
          registerConversationDoc(convId, {
            conversationId: convId,
            participantIds: existingDbConv.participantIds || [currentUser.id, participantId],
            participants: existingDbConv.participants || [currentUser, targetParticipant],
            context: existingDbConv.context || null,
            additionalContexts: existingDbConv.additionalContexts || [],
            collapsedBy: existingDbConv.collapsedBy || [],
            unreadCounts: existingDbConv.unreadCounts || { [currentUser.id]: 0, [participantId]: 0 },
            lastMessage: existingDbConv.lastMessage || undefined,
            createdAt: existingDbConv.createdAt || new Date().toISOString(),
            updatedAt: existingDbConv.updatedAt || new Date().toISOString(),
          });
        }
      } catch (lookupErr) {
        console.warn("[ConversationsPOST] Existing DB lookup failed:", lookupErr);
      }
    }

    const result = findOrCreateConversation({
      currentUser,
      targetParticipant,
      storeId: topLevelStoreId || contextPayload?.storeId,
      context: contextPayload,
    });

    // Persist conversation to MongoDB so subsequent /messages requests on any serverless instance find it
    if (mongoose.connection.readyState === 1 && result?.conversation?.id) {
      try {
        const conv = result.conversation;
        await ConversationModel.findOneAndUpdate(
          { conversationId: conv.id },
          {
            $setOnInsert: {
              conversationId: conv.id,
              participantIds: [currentUser.id, targetParticipant.id],
              participants: conv.participants || [currentUser, targetParticipant],
              unreadCounts: { [currentUser.id]: 0, [targetParticipant.id]: 0 },
              status: "active",
              schemaVersion: 1,
              createdAt: new Date(),
            },
            $set: {
              ...(conv.context ? { context: conv.context } : {}),
              additionalContexts: conv.additionalContexts || [],
              updatedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      } catch (persistErr) {
        console.error("[ConversationsPOST] MongoDB persistence failed:", persistErr);
      }
    }

    return NextResponse.json(result, { status: result.reused ? 200 : 201 });
  } catch (error) {
    console.error("Failed to create or open conversation:", error);
    return NextResponse.json(
      { error: "Unable to open conversation" },
      { status: 500 }
    );
  }
}
