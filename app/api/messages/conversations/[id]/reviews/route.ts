import { NextRequest, NextResponse } from "next/server";
import {
  submitOptionalDealReview,
} from "../../../../../lib/chatRepository";
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
    const reviewerId = user.id;
    const body = await req.json();

    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please select a star rating between 1 and 5." },
        { status: 400 }
      );
    }

    const tags = Array.isArray(body.tags)
      ? body.tags.map((t: unknown) => String(t).slice(0, 40)).slice(0, 5)
      : [];
    const comment =
      typeof body.comment === "string"
        ? body.comment.trim().slice(0, 400)
        : undefined;

    const result = submitOptionalDealReview({
      conversationId,
      reviewerId,
      rating,
      tags,
      comment,
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
    if (errMessage === "FORBIDDEN_NOT_DEAL_PARTY") {
      return NextResponse.json(
        { error: "Forbidden: Only a buyer or seller who participated in this exchange can submit a review." },
        { status: 403 }
      );
    }
    if (errMessage === "CANNOT_REVIEW_SELF") {
      return NextResponse.json(
        { error: "You cannot submit a review for yourself." },
        { status: 400 }
      );
    }
    if (
      errMessage === "NO_ELIGIBLE_DEAL" ||
      errMessage === "EXCHANGE_NOT_CONFIRMED"
    ) {
      return NextResponse.json(
        {
          error:
            "Reviews are only available after confirming a completed exchange.",
        },
        { status: 400 }
      );
    }
    if (errMessage === "DUPLICATE_REVIEW") {
      return NextResponse.json(
        { error: "You have already submitted a review for this exchange." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit review." },
      { status: 500 }
    );
  }
}
