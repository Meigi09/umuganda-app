/**
 * Post Creation API Route
 * Supports both text and image posts
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PostService } from "@/application/services/PostService";
import { prisma } from "@/lib/prisma";
import {
  imagePostSchema,
  textPostSchema,
  validateInput,
} from "@/lib/validation";
import { apiSuccess, apiError, HTTP_STATUS } from "@/lib/api-response";

const postService = new PostService(prisma);

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        apiError("UNAUTHORIZED", "User not authenticated"),
        {
          status: HTTP_STATUS.UNAUTHORIZED,
        }
      );
    }

    const body = await request.json();

    // Determine post type and validate accordingly
    const hasImages = body.images && body.images.length > 0;

    if (hasImages) {
      // Validate as image post
      const validation = validateInput(imagePostSchema, body);
      if (!validation.success) {
        return NextResponse.json(
          apiError("VALIDATION_ERROR", "Invalid input"),
          {
            status: HTTP_STATUS.BAD_REQUEST,
          }
        );
      }

      const post = await postService.createImagePost({
        ...validation.data,
        authorId: session.user.id,
      });

      return NextResponse.json(apiSuccess(post), {
        status: HTTP_STATUS.CREATED,
      });
    } else {
      // Validate as text post
      const validation = validateInput(textPostSchema, body);
      if (!validation.success) {
        return NextResponse.json(
          apiError("VALIDATION_ERROR", "Invalid input"),
          {
            status: HTTP_STATUS.BAD_REQUEST,
          }
        );
      }

      const post = await postService.createTextPost({
        ...validation.data,
        authorId: session.user.id,
      });

      return NextResponse.json(apiSuccess(post), {
        status: HTTP_STATUS.CREATED,
      });
    }
  } catch (error) {
    console.error("Post creation error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(apiError("UNAUTHORIZED", error.message), {
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(apiError("VALIDATION_ERROR", error.message), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to create post"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}

/**
 * GET handler for retrieving posts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const cellId = searchParams.get("cellId") || undefined;
    const sectorId = searchParams.get("sectorId") || undefined;
    const districtId = searchParams.get("districtId") || undefined;

    const postService = new PostService(prisma);

    const posts = await postService.getFeed(limit, skip, {
      cellId: cellId || undefined,
      sectorId: sectorId || undefined,
      districtId: districtId || undefined,
    });

    return NextResponse.json(apiSuccess(posts));
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to fetch posts"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}
