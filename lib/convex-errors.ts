import { ConvexError } from "convex/values";

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "You must be signed in to do that.",
  FORBIDDEN: "You don't have permission to do that.",
  NOT_FOUND: "That item no longer exists.",
  TITLE_TOO_LONG: "Title is too long.",
  BLURB_TOO_LONG: "Blurb is too long.",
  LINK_TOO_LONG: "URL is too long.",
  INVALID_URL: "Please enter a valid URL.",
};

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const code = error.data as string;
    return ERROR_MESSAGES[code] ?? DEFAULT_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}
