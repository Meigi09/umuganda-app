/**
 * Reactions API Route
 * Handles likes and other reactions to posts and comments
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReactionType } from "@prisma/client";
import { apiSuccess, apiError, HTTP_STATUS } from "@/lib/api-response";
import { z } from "zod";

const reactionSchema = z.object({
  type: z.nativeEnum(ReactionType),
  postId: z.string().optional(),
  commentId: z.string().optional(),
});

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
    const result = reactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(apiError("VALIDATION_ERROR", "Invalid input"), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const { type, postId, commentId } = result.data;

    if (!postId && !commentId) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", "Either postId or commentId is required"),
        {
          status: HTTP_STATUS.BAD_REQUEST,
        }
      );
    }

    // Check if post or comment exists
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return NextResponse.json(apiError("NOT_FOUND", "Post not found"), {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }
    }

    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return NextResponse.json(apiError("NOT_FOUND", "Comment not found"), {
          status: HTTP_STATUS.NOT_FOUND,
        });
      }
    }

    // Check if user already reacted with this type
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_postId_type: postId
          ? {
              userId: session.user.id,
              postId,
              type,
            }
          : undefined,
        ...(commentId && {
          userId_commentId_type: {
            userId: session.user.id,
            commentId,
            type,
          },
        }),
      },
    });

    if (existingReaction) {
      // Remove reaction if it already exists (toggle)
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });

      return NextResponse.json(
        apiSuccess({
          message: "Reaction removed",
          reaction: existingReaction,
        })
      );
    }

    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        type,
        userId: session.user.id,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
    });

    return NextResponse.json(apiSuccess(reaction), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    console.error("Reaction error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to create reaction"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}

/**
 * GET reactions for a post or comment
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");
    const commentId = searchParams.get("commentId");

    if (!postId && !commentId) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", "Either postId or commentId is required"),
        {
          status: HTTP_STATUS.BAD_REQUEST,
        }
      );
    }

    const reactions = await prisma.reaction.findMany({
      where: {
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by type for easier consumption
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.type]) {
        acc[reaction.type] = [];
      }
      acc[reaction.type].push(reaction);
      return acc;
    }, {} as Record<string, typeof reactions>);

    return NextResponse.json(
      apiSuccess({
        total: reactions.length,
        grouped,
        reactions,
      })
    );
  } catch (error) {
    console.error("Fetch reactions error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to fetch reactions"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}
