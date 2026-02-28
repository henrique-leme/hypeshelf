import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";
import { getAuthenticatedUser, requireRole } from "./helpers/auth";
import {
  genreValidator,
  recommendationArgs,
  FIELD_LIMITS,
} from "./helpers/validators";
import { isSafeUrl } from "../lib/url";

async function enrichWithAuthor(
  ctx: { db: { get: (id: any) => Promise<any> } },
  recommendation: any
) {
  const author = await ctx.db.get(recommendation.userId);
  return {
    ...recommendation,
    authorName: author?.name ?? "Unknown",
    authorImageUrl: author?.imageUrl,
  };
}

export const getPublicRecent = query({
  args: {},
  handler: async (ctx) => {
    const recommendations = await ctx.db
      .query("recommendations")
      .order("desc")
      .take(10);

    return Promise.all(
      recommendations.map((rec) => enrichWithAuthor(ctx, rec))
    );
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    await getAuthenticatedUser(ctx);

    const recommendations = await ctx.db
      .query("recommendations")
      .order("desc")
      .collect();

    return Promise.all(
      recommendations.map((rec) => enrichWithAuthor(ctx, rec))
    );
  },
});

export const getByGenre = query({
  args: { genre: genreValidator },
  handler: async (ctx, { genre }) => {
    await getAuthenticatedUser(ctx);

    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_genre", (q) => q.eq("genre", genre))
      .order("desc")
      .collect();

    return Promise.all(
      recommendations.map((rec) => enrichWithAuthor(ctx, rec))
    );
  },
});

export const create = mutation({
  args: recommendationArgs,
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (args.title.length > FIELD_LIMITS.TITLE_MAX) {
      throw new ConvexError("TITLE_TOO_LONG");
    }
    if (args.blurb.length > FIELD_LIMITS.BLURB_MAX) {
      throw new ConvexError("BLURB_TOO_LONG");
    }
    if (args.link.length > FIELD_LIMITS.LINK_MAX) {
      throw new ConvexError("LINK_TOO_LONG");
    }
    if (!isSafeUrl(args.link)) {
      throw new ConvexError("INVALID_URL");
    }

    return await ctx.db.insert("recommendations", {
      title: args.title,
      genre: args.genre,
      link: args.link,
      blurb: args.blurb,
      userId: user._id,
      isStaffPick: false,
    });
  },
});

export const remove = mutation({
  args: { recommendationId: v.id("recommendations") },
  handler: async (ctx, { recommendationId }) => {
    const user = await getAuthenticatedUser(ctx);

    const recommendation = await ctx.db.get(recommendationId);
    if (!recommendation) {
      throw new ConvexError("NOT_FOUND");
    }

    const isOwner = recommendation.userId === user._id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new ConvexError("FORBIDDEN");
    }

    await ctx.db.delete(recommendationId);
  },
});

export const toggleStaffPick = mutation({
  args: { recommendationId: v.id("recommendations") },
  handler: async (ctx, { recommendationId }) => {
    const user = await getAuthenticatedUser(ctx);
    requireRole(user, "admin");

    const recommendation = await ctx.db.get(recommendationId);
    if (!recommendation) {
      throw new ConvexError("NOT_FOUND");
    }

    await ctx.db.patch(recommendationId, {
      isStaffPick: !recommendation.isStaffPick,
    });
  },
});
