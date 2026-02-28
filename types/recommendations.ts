import { Doc } from "../convex/_generated/dataModel";

export type RecommendationWithAuthor = Doc<"recommendations"> & {
  authorName: string;
  authorImageUrl?: string;
};
