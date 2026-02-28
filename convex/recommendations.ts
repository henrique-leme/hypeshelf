import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { getAuthenticatedUser, findAuthenticatedUser, requireRole } from "./helpers/auth";
import {
  genreValidator,
  recommendationArgs,
  FIELD_LIMITS,
} from "./helpers/validators";
import { isSafeUrl } from "../lib/url";
import { RecommendationWithAuthor } from "../types/recommendations";

async function enrichWithAuthor(
  context: QueryCtx,
  recommendation: Doc<"recommendations">
): Promise<RecommendationWithAuthor> {
  const author = await context.db.get(recommendation.userId);
  return {
    ...recommendation,
    authorName: author?.name ?? "Unknown",
    authorImageUrl: author?.imageUrl,
  };
}

export const getPublicRecent = query({
  args: {},
  handler: async (context) => {
    const recommendations = await context.db
      .query("recommendations")
      .order("desc")
      .take(10);

    return Promise.all(
      recommendations.map((recommendation) => enrichWithAuthor(context, recommendation))
    );
  },
});

export const getAll = query({
  args: {},
  handler: async (context) => {
    const user = await findAuthenticatedUser(context);
    if (!user) return null;

    const recommendations = await context.db
      .query("recommendations")
      .order("desc")
      .collect();

    return Promise.all(
      recommendations.map((recommendation) => enrichWithAuthor(context, recommendation))
    );
  },
});

export const getByGenre = query({
  args: { genre: genreValidator },
  handler: async (context, { genre }) => {
    const user = await findAuthenticatedUser(context);
    if (!user) return null;

    const recommendations = await context.db
      .query("recommendations")
      .withIndex("by_genre", (q) => q.eq("genre", genre))
      .order("desc")
      .collect();

    return Promise.all(
      recommendations.map((recommendation) => enrichWithAuthor(context, recommendation))
    );
  },
});

export const create = mutation({
  args: recommendationArgs,
  handler: async (context, args) => {
    const user = await getAuthenticatedUser(context);

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

    return await context.db.insert("recommendations", {
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
  handler: async (context, { recommendationId }) => {
    const user = await getAuthenticatedUser(context);

    const recommendation = await context.db.get(recommendationId);
    if (!recommendation) {
      throw new ConvexError("NOT_FOUND");
    }

    const isOwner = recommendation.userId === user._id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new ConvexError("FORBIDDEN");
    }

    await context.db.delete(recommendationId);
  },
});

export const toggleStaffPick = mutation({
  args: { recommendationId: v.id("recommendations") },
  handler: async (context, { recommendationId }) => {
    const user = await getAuthenticatedUser(context);
    requireRole(user, "admin");

    const recommendation = await context.db.get(recommendationId);
    if (!recommendation) {
      throw new ConvexError("NOT_FOUND");
    }

    await context.db.patch(recommendationId, {
      isStaffPick: !recommendation.isStaffPick,
    });
  },
});
