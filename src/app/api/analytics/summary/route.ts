/**
 * Analytics API Route
 * Provides aggregated impact data and statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AnalyticsEngine } from "@/domain/services/AnalyticsEngine";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, HTTP_STATUS } from "@/lib/api-response";

export async function GET(request: NextRequest) {
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
    const days = parseInt(searchParams.get("days") || "180", 10); // Default to 6 months

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get analytics using Singleton Analytics Engine
    const analyticsEngine = AnalyticsEngine.getInstance(prisma);
    const summary = await analyticsEngine.generateSummary(startDate, endDate);

    return NextResponse.json(apiSuccess(summary));
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to generate analytics"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}
