/**
 * NextAuth Configuration
 *
 * Implements role-based access control (RBAC) with three user roles:
 * - COMMUNITY_MEMBER: Can create posts, comment, react
 * - CELL_MODERATOR: Can moderate posts in their cell, view cell analytics
 * - DISTRICT_VIEWER: Read-only access to district analytics
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Input validation schema
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const { email, password } = signInSchema.parse(credentials);

          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error("User not found");
          }

          // Compare passwords
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          // Return user object with role information
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            cellId: user.cellId,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    /**
     * JWT Callback
     * Add user information to JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.cellId = (user as any).cellId;
      }
      return token;
    },

    /**
     * Session Callback
     * Add user information to session
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.cellId = token.cellId as string;
      }
      return session;
    },

    /**
     * Redirect Callback
     * Redirect users based on their role after sign in
     */
    async redirect({ url, baseUrl }) {
      // Allow redirects to same origin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow redirects to same domain
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn() {
      // Log sign in events if needed
    },
    async signOut() {
      // Log sign out events if needed
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
