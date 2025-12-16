/**
 * User Registration API Route
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password";
import { userRegistrationSchema, validateInput } from "@/lib/validation";
import { apiSuccess, apiError, HTTP_STATUS } from "@/lib/api-response";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(userRegistrationSchema, body);
    if (!validation.success) {
      return NextResponse.json(apiError("VALIDATION_ERROR", "Invalid input"), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const { email, password, name, cellId } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        apiError("USER_EXISTS", "Email already registered"),
        {
          status: HTTP_STATUS.CONFLICT,
        }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        cellId: cellId || undefined,
        role: "COMMUNITY_MEMBER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(apiSuccess(user), {
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      apiError("INTERNAL_ERROR", "Failed to register user"),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
}
