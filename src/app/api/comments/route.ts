/**
 * Comments API Route
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema, validateInput } from "@/lib/validation";
import { apiSuccess, apiError, HTTP_STATUS } from "@/lib/api-response";

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

    // Validate input
    const validation = validateInput(commentSchema, body);
    if (!validation.success) {
      return NextResponse.json(apiError("VALIDATION_ERROR", "Invalid input"), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const { content, postId } = validation.data;

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(apiError("NOT_FOUND", "Post not found"), {
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(apiSuccess(comment), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to create comment"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}

/**
 * GET comments for a post
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", "postId is required"),
        {
          status: HTTP_STATUS.BAD_REQUEST,
        }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reactions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(apiSuccess(comments));
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to fetch comments"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}
