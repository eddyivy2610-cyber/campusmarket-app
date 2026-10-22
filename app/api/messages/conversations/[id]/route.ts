import { NextRequest, NextResponse } from "next/server";
import {
  getConversationWithMessages,
  setBannerCollapsedState,
} from "../../../../lib/chatRepository";
import { ContextWorkflowStatus } from "../../../../models/ChatModels";
import { requireParticipant } from "../../../../lib/authServer";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user, errorResponse } = await requireParticipant(req, id, {
      allowInactiveCounterpart: true,
    });
    if (!user || errorResponse) {
      return errorResponse;
    }
    const userId = user.id;
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
    );

    const result = getConversationWithMessages({
      conversationId: id,
      userId,
      page,
      limit,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to load conversation messages" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user, errorResponse } = await requireParticipant(req, id, {
      allowInactiveCounterpart: true,
    });
    if (!user || errorResponse) {
      return errorResponse;
    }
    const userId = user.id;
    const body = await req.json();

    const collapsed =
      typeof body.collapsed === "boolean" ? body.collapsed : false;
    const contextStatus = body.contextStatus as
      | ContextWorkflowStatus
      | undefined;

    const updatedConversation = setBannerCollapsedState({
      conversationId: id,
      userId,
      collapsed,
      contextStatus,
    });

    return NextResponse.json({ conversation: updatedConversation });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update conversation state" },
      { status: 500 }
    );
  }
}
