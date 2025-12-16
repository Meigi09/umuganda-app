/**
 * Reposts API Route
 * Allows users to share posts within their network
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, HTTP_STATUS } from "@/lib/api-response";
import { z } from "zod";

const repostSchema = z.object({
  postId: z.string(),
  caption: z.string().max(500).optional(),
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
    const result = repostSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(apiError("VALIDATION_ERROR", "Invalid input"), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const { postId, caption } = result.data;

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
      },
    });

    if (!post) {
      return NextResponse.json(apiError("NOT_FOUND", "Post not found"), {
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    // Check if already reposted
    const existingRepost = await prisma.repost.findUnique({
      where: {
        postId_authorId: {
          postId,
          authorId: session.user.id,
        },
      },
    });

    if (existingRepost) {
      return NextResponse.json(
        apiError("CONFLICT", "You have already reposted this"),
        {
          status: HTTP_STATUS.CONFLICT,
        }
      );
    }

    // Create repost
    const repost = await prisma.repost.create({
      data: {
        postId,
        authorId: session.user.id,
        caption: caption || undefined,
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(apiSuccess(repost), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    console.error("Repost error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to create repost"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}

/**
 * DELETE a repost
 */
export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const repostId = searchParams.get("id");

    if (!repostId) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", "Repost ID is required"),
        {
          status: HTTP_STATUS.BAD_REQUEST,
        }
      );
    }

    // Get repost to verify ownership
    const repost = await prisma.repost.findUnique({
      where: { id: repostId },
    });

    if (!repost) {
      return NextResponse.json(apiError("NOT_FOUND", "Repost not found"), {
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    if (repost.authorId !== session.user.id) {
      return NextResponse.json(
        apiError("FORBIDDEN", "Not authorized to delete this repost"),
        {
          status: HTTP_STATUS.FORBIDDEN,
        }
      );
    }

    // Delete repost
    await prisma.repost.delete({
      where: { id: repostId },
    });

    return NextResponse.json(apiSuccess({ message: "Repost deleted" }));
  } catch (error) {
    console.error("Delete repost error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to delete repost"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}

/**
 * GET reposts for a post
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

    const reposts = await prisma.repost.findMany({
      where: { postId },
      include: {
        author: {
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

    return NextResponse.json(
      apiSuccess({
        total: reposts.length,
        reposts,
      })
    );
  } catch (error) {
    console.error("Fetch reposts error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to fetch reposts"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}
