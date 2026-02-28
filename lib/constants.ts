export const APP_NAME = "HypeShelf";

export const APP_TAGLINE =
  "Collect and share the stuff you're hyped about.";

export const GENRES = [
  "horror",
  "action",
  "comedy",
  "drama",
  "sci-fi",
  "documentary",
  "thriller",
  "romance",
  "animation",
] as const;

export type Genre = (typeof GENRES)[number];

export const FIELD_LIMITS = {
  TITLE_MAX: 100,
  BLURB_MAX: 280,
  LINK_MAX: 2048,
} as const;
