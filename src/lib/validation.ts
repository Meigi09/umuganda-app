/**
 * Validation utilities
 */

import { z } from "zod";
import { ActivityCategory } from "@prisma/client";

/**
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  cellId: z.string().optional(),
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;

/**
 * Post creation schema (text)
 */
export const textPostSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content too long"),
  category: z.nativeEnum(ActivityCategory),
  cellId: z.string(),
  sectorId: z.string(),
  districtId: z.string(),
  hashtags: z.array(z.string()).optional().default([]),
});

export type TextPost = z.infer<typeof textPostSchema>;

/**
 * Post creation schema (with images)
 */
export const imagePostSchema = textPostSchema.extend({
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        publicId: z.string().optional(),
        caption: z.string().optional(),
      })
    )
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed"),
});

export type ImagePost = z.infer<typeof imagePostSchema>;

/**
 * Comment schema
 */
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment is required")
    .max(500, "Comment too long"),
  postId: z.string(),
});

export type CommentInput = z.infer<typeof commentSchema>;

/**
 * Location schema
 */
export const locationSchema = z.object({
  cellId: z.string(),
  sectorId: z.string(),
  districtId: z.string(),
});

export type Location = z.infer<typeof locationSchema>;

/**
 * Generic validation error response
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Parse and validate input data
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed data or validation errors
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return { success: false, errors };
    }
    return {
      success: false,
      errors: [{ field: "unknown", message: "Validation failed" }],
    };
  }
}
