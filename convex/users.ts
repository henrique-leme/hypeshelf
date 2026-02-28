import { v } from "convex/values";
import {
  mutation,
  query,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { throwError } from "./errors";
import { roleValidator } from "./helpers/validators";

export const store = mutation({
  args: {},
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) throwError("UNAUTHENTICATED");

    const existing = await context.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      const updates: Partial<Pick<Doc<"users">, "name" | "imageUrl">> = {};
      if (identity.name && identity.name !== existing.name) {
        updates.name = identity.name;
      }
      if (identity.pictureUrl && identity.pictureUrl !== existing.imageUrl) {
        updates.imageUrl = identity.pictureUrl;
      }
      if (Object.keys(updates).length > 0) {
        await context.db.patch(existing._id, updates);
      }
      return existing._id;
    }

    return await context.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? "Anonymous",
      imageUrl: identity.pictureUrl,
      role: "user",
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await context.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const getByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (context, { clerkId }) => {
    return await context.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

export const createFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: roleValidator,
  },
  handler: async (context, args) => {
    return await context.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      imageUrl: args.imageUrl,
      role: args.role,
    });
  },
});

export const updateFromWebhook = internalMutation({
  args: {
    id: v.id("users"),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: roleValidator,
  },
  handler: async (context, { id, ...updates }) => {
    await context.db.patch(id, updates);
  },
});

export const deleteFromWebhook = internalMutation({
  args: { id: v.id("users") },
  handler: async (context, { id }) => {
    const recommendations = await context.db
      .query("recommendations")
      .withIndex("by_user_id", (q) => q.eq("userId", id))
      .collect();

    await Promise.all(
      recommendations.map((rec) => context.db.delete(rec._id))
    );

    await context.db.delete(id);
  },
});
