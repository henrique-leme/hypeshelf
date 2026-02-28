import { z } from "zod";
import { GENRES, FIELD_LIMITS } from "@/lib/constants";
import { isSafeUrl } from "@/lib/url";

export const recommendationFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(FIELD_LIMITS.TITLE_MAX, `Title must be ${FIELD_LIMITS.TITLE_MAX} characters or less`),
  genre: z.enum(GENRES, { message: "Please select a genre" }),
  link: z
    .string()
    .url("Please enter a valid URL")
    .max(FIELD_LIMITS.LINK_MAX, `URL must be ${FIELD_LIMITS.LINK_MAX} characters or less`)
    .refine(isSafeUrl, "Only http and https URLs are allowed"),
  blurb: z
    .string()
    .min(1, "Blurb is required")
    .max(FIELD_LIMITS.BLURB_MAX, `Blurb must be ${FIELD_LIMITS.BLURB_MAX} characters or less`),
});

export type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;
