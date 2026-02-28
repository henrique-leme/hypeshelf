import { v } from "convex/values";
import { GENRES, FIELD_LIMITS } from "../../lib/constants";

export const genreValidator = v.union(
  ...GENRES.map((genre) => v.literal(genre))
);

export const roleValidator = v.union(v.literal("user"), v.literal("admin"));

export const recommendationArgs = {
  title: v.string(),
  genre: genreValidator,
  link: v.string(),
  blurb: v.string(),
};

export { FIELD_LIMITS };
