import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

type AuthContext = QueryCtx | MutationCtx;

export async function findAuthenticatedUser(
  context: AuthContext
): Promise<Doc<"users"> | null> {
  const identity = await context.auth.getUserIdentity();
  if (!identity) return null;

  return await context.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export async function getAuthenticatedUser(
  context: AuthContext
): Promise<Doc<"users">> {
  const user = await findAuthenticatedUser(context);

  if (!user) {
    throw new ConvexError("UNAUTHENTICATED");
  }

  return user;
}

export function requireRole(user: Doc<"users">, role: string): void {
  if (user.role !== role) {
    throw new ConvexError("FORBIDDEN");
  }
}
