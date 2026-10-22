import { NextRequest, NextResponse } from "next/server";
import {
  recordDealCheckInResponse,
  startTrackingDeal,
  triggerIdempotentDealReminder,
} from "../../../../../lib/chatRepository";
import { CheckInResponseChoice } from "../../../../../models/ChatModels";
import { requireParticipant } from "../../../../../lib/authServer";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await context.params;
    const { user, errorResponse } = await requireParticipant(req, conversationId);
    if (!user || errorResponse) {
      return errorResponse;
    }
    const actorId = user.id;
    const body = await req.json();

    const result = startTrackingDeal({
      conversationId,
      actorId,
      agreedPriceFormatted:
        typeof body.agreedPriceFormatted === "string"
          ? body.agreedPriceFormatted.slice(0, 60)
          : undefined,
      agreedTerms:
        typeof body.agreedTerms === "string"
          ? body.agreedTerms.slice(0, 200)
          : undefined,
      expectedMeetupDate:
        typeof body.expectedMeetupDate === "string"
          ? body.expectedMeetupDate.slice(0, 80)
          : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to start tracking deal." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await context.params;
    const { user, errorResponse } = await requireParticipant(req, conversationId);
    if (!user || errorResponse) {
      return errorResponse;
    }
    const actorId = user.id;
    const body = await req.json();

    if (body.action === "remind") {
      const reminderResult = triggerIdempotentDealReminder({
        conversationId,
        actorId,
      });
      return NextResponse.json(reminderResult);
    }

    const validChoices: CheckInResponseChoice[] = [
      "Completed",
      "Still arranging",
      "Didn't happen",
    ];
    const choice = body.choice as CheckInResponseChoice;

    if (!validChoices.includes(choice)) {
      return NextResponse.json(
        { error: "Valid check-in response is required." },
        { status: 400 }
      );
    }

    const result = recordDealCheckInResponse({
      conversationId,
      actorId,
      choice,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_DEAL_PARTY") {
      return NextResponse.json(
        { error: "Forbidden: Only the buyer or seller can confirm this deal." },
        { status: 403 }
      );
    }
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "NOT_FOUND" || errMessage === "DEAL_NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to record check-in response." },
      { status: 500 }
    );
  }
}
