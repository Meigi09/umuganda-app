/**
 * Utility functions for password hashing and verification
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}

/**
 * Verify a password against its hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Error verifying password:", error);
    throw new Error("Failed to verify password");
  }
}
