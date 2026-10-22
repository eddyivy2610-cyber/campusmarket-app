import { NextRequest, NextResponse } from "next/server";
import {
  appendMessageToConversation,
} from "../../../../../lib/chatRepository";
import { requireParticipant } from "../../../../../lib/authServer";

const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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
    const senderId = user.id;
    const body = await req.json();

    const rawText = typeof body.text === "string" ? body.text.trim() : "";
    const clientMessageId =
      typeof body.clientMessageId === "string"
        ? body.clientMessageId.trim().slice(0, 80)
        : undefined;

    let validatedAttachment:
      | {
          url: string;
          fileName: string;
          mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
          sizeBytes: number;
        }
      | undefined;

    if (body.attachment) {
      const { url, fileName, mimeType, sizeBytes } = body.attachment;

      if (
        !mimeType ||
        !ALLOWED_IMAGE_MIMES.includes(
          mimeType as (typeof ALLOWED_IMAGE_MIMES)[number]
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Unsupported attachment type. Only JPEG, PNG, WEBP, and GIF images are allowed.",
          },
          { status: 400 }
        );
      }

      const numericSize = Number(sizeBytes || 0);
      if (numericSize <= 0 || numericSize > MAX_ATTACHMENT_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: "Attachment exceeds the 5 MB maximum file size limit.",
          },
          { status: 400 }
        );
      }

      if (!url || typeof url !== "string") {
        return NextResponse.json(
          { error: "Invalid attachment image payload." },
          { status: 400 }
        );
      }

      validatedAttachment = {
        url,
        fileName: String(fileName || "campus-photo.jpg").slice(0, 120),
        mimeType: mimeType as (typeof ALLOWED_IMAGE_MIMES)[number],
        sizeBytes: numericSize,
      };
    }

    if (!rawText && !validatedAttachment) {
      return NextResponse.json(
        { error: "Message text or a valid image attachment is required." },
        { status: 400 }
      );
    }

    if (rawText.length > 2000) {
      return NextResponse.json(
        { error: "Message text cannot exceed 2,000 characters." },
        { status: 400 }
      );
    }

    const result = appendMessageToConversation({
      conversationId,
      senderId,
      text: rawText,
      clientMessageId,
      attachment: validatedAttachment,
      attachedContext: body.attachedContext || undefined,
    });

    return NextResponse.json(result, {
      status: result.duplicate ? 200 : 201,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
