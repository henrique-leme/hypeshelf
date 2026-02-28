import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

type AuthCtx = QueryCtx | MutationCtx;

export async function getAuthenticatedUser(
  ctx: AuthCtx
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("UNAUTHENTICATED");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError("USER_NOT_FOUND");
  }

  return user;
}

export function requireRole(user: Doc<"users">, role: string): void {
  if (user.role !== role) {
    throw new ConvexError("FORBIDDEN");
  }
}
