import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { roleValidator, genreValidator } from "./helpers/validators";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: roleValidator,
  }).index("by_clerk_id", ["clerkId"]),

  recommendations: defineTable({
    title: v.string(),
    genre: genreValidator,
    link: v.string(),
    blurb: v.string(),
    userId: v.id("users"),
    isStaffPick: v.boolean(),
  })
    .index("by_genre", ["genre"])
    .index("by_user_id", ["userId"]),
});
