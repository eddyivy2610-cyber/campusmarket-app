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
import dbConnect from "../../../lib/dbConnect";

function buildChatParticipantProfile(user: ServerAuthUser): ChatParticipantProfile {
  return {
    id: user.id,
    name: user.name || "Campus Member",
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
            const otherParticipant: ChatParticipantProfile =
              rawOther && typeof rawOther === "object" && "name" in rawOther
                ? {
                    ...rawOther,
                    id: rawOther.id ? String(rawOther.id) : otherId,
                  }
                : {
                    id: otherId,
                    name: (rawOther as any)?.name || "Campus Member",
                    subtitle: (rawOther as any)?.subtitle || "Campus Member",
                    avatar: (rawOther as any)?.avatar,
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

          if (cursor) {
            return NextResponse.json({
              currentUser,
              conversations: mappedConversations,
              nextCursor,
              hasMore,
              total: mappedConversations.length,
            });
          }
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

    const participantId = String(body.participantId || "").trim();
    const participantName = String(body.participantName || "").trim();

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
      avatar: body.participantAvatar ? String(body.participantAvatar) : undefined,
      isVerified: Boolean(body.participantVerified ?? true),
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

      contextPayload = {
        contextType: cType,
        contextId: String(body.context.contextId || `ctx-${Date.now()}`),
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

    const result = findOrCreateConversation({
      currentUser,
      targetParticipant,
      context: contextPayload,
    });

    return NextResponse.json(result, { status: result.reused ? 200 : 201 });
  } catch (error) {
    console.error("Failed to create or open conversation:", error);
    return NextResponse.json(
      { error: "Unable to open conversation" },
      { status: 500 }
    );
  }
}
