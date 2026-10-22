import { NextRequest, NextResponse } from "next/server";
import {
  createStructuredOffer,
  transitionStructuredOffer,
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
    const proposerId = user.id;
    const body = await req.json();

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 50_000_000) {
      return NextResponse.json(
        { error: "Please enter a valid offer amount in Naira (₦)." },
        { status: 400 }
      );
    }

    const explanation =
      typeof body.explanation === "string"
        ? body.explanation.trim().slice(0, 280)
        : undefined;
    const conditionOrAvailability =
      typeof body.conditionOrAvailability === "string"
        ? body.conditionOrAvailability.trim().slice(0, 140)
        : undefined;
    const meetupDetails =
      typeof body.meetupDetails === "string"
        ? body.meetupDetails.trim().slice(0, 160)
        : undefined;

    const result = createStructuredOffer({
      conversationId,
      proposerId,
      amount,
      explanation,
      conditionOrAvailability,
      meetupDetails,
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
    if (errMessage === "OFFER_ALREADY_ACCEPTED_OR_CLOSED") {
      return NextResponse.json(
        {
          error:
            "An offer has already been accepted or this listing is closed.",
        },
        { status: 409 }
      );
    }
    if (errMessage === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit structured offer." },
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

    const offerId = String(body.offerId || "").trim();
    const action = body.action as
      | "accept"
      | "reject"
      | "withdraw"
      | "counter";

    if (
      !offerId ||
      !["accept", "reject", "withdraw", "counter"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Valid offerId and action are required." },
        { status: 400 }
      );
    }

    const counterAmount =
      action === "counter" ? Number(body.counterAmount) : undefined;
    if (
      action === "counter" &&
      (!counterAmount || !Number.isFinite(counterAmount) || counterAmount <= 0)
    ) {
      return NextResponse.json(
        { error: "A valid counter-offer price is required." },
        { status: 400 }
      );
    }

    const result = transitionStructuredOffer({
      conversationId,
      offerId,
      actorId,
      action,
      counterAmount,
      counterExplanation:
        typeof body.counterExplanation === "string"
          ? body.counterExplanation.slice(0, 280)
          : undefined,
      counterMeetupDetails:
        typeof body.counterMeetupDetails === "string"
          ? body.counterMeetupDetails.slice(0, 160)
          : undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "OFFER_NOT_FOUND" || errMessage === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }
    if (errMessage === "CANNOT_ACCEPT_OWN_OFFER" || errMessage === "ONLY_TARGET_PARTY_CAN_ACCEPT") {
      return NextResponse.json(
        { error: "Forbidden: Only the intended receiving party can accept, counter, or reject this offer." },
        { status: 403 }
      );
    }
    if (errMessage === "ONLY_PROPOSER_CAN_WITHDRAW") {
      return NextResponse.json(
        { error: "Only the user who proposed this offer can withdraw it." },
        { status: 403 }
      );
    }
    if (errMessage === "INVALID_OFFER_STATE") {
      return NextResponse.json(
        {
          error:
            "This offer has already been finalized and can no longer be modified.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update offer status." },
      { status: 500 }
    );
  }
}
