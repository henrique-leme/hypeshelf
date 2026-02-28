import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query, mutation } from "./_generated/server";
import { QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getAuthenticatedUser, findAuthenticatedUser, requireRole } from "./helpers/auth";
import { throwError } from "./errors";
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
  args: { paginationOpts: paginationOptsValidator },
  handler: async (context, { paginationOpts }) => {
    const user = await findAuthenticatedUser(context);
    if (!user) return { page: [], isDone: true, continueCursor: "" };

    const result = await context.db
      .query("recommendations")
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      result.page.map((recommendation) => enrichWithAuthor(context, recommendation))
    );

    return { ...result, page };
  },
});

export const getByGenre = query({
  args: { genre: genreValidator, paginationOpts: paginationOptsValidator },
  handler: async (context, { genre, paginationOpts }) => {
    const user = await findAuthenticatedUser(context);
    if (!user) return { page: [], isDone: true, continueCursor: "" };

    const result = await context.db
      .query("recommendations")
      .withIndex("by_genre", (q) => q.eq("genre", genre))
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      result.page.map((recommendation) => enrichWithAuthor(context, recommendation))
    );

    return { ...result, page };
  },
});

export const create = mutation({
  args: recommendationArgs,
  handler: async (context, args) => {
    const user = await getAuthenticatedUser(context);

    if (args.title.trim().length === 0) throwError("TITLE_REQUIRED");
    if (args.title.length > FIELD_LIMITS.TITLE_MAX) throwError("TITLE_TOO_LONG");
    if (args.blurb.trim().length === 0) throwError("BLURB_REQUIRED");
    if (args.blurb.length > FIELD_LIMITS.BLURB_MAX) throwError("BLURB_TOO_LONG");
    if (args.link.length > FIELD_LIMITS.LINK_MAX) throwError("LINK_TOO_LONG");
    if (!isSafeUrl(args.link)) throwError("INVALID_URL");

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
    if (!recommendation) throwError("NOT_FOUND");

    const isOwner = recommendation.userId === user._id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) throwError("FORBIDDEN");

    await context.db.delete(recommendationId);
  },
});

export const toggleStaffPick = mutation({
  args: { recommendationId: v.id("recommendations") },
  handler: async (context, { recommendationId }) => {
    const user = await getAuthenticatedUser(context);
    requireRole(user, "admin");

    const recommendation = await context.db.get(recommendationId);
    if (!recommendation) throwError("NOT_FOUND");

    await context.db.patch(recommendationId, {
      isStaffPick: !recommendation.isStaffPick,
    });
  },
});
