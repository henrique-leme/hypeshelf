import { ConvexError } from "convex/values";

export const ERROR_CODE = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  TITLE_TOO_LONG: "TITLE_TOO_LONG",
  BLURB_TOO_LONG: "BLURB_TOO_LONG",
  LINK_TOO_LONG: "LINK_TOO_LONG",
  INVALID_URL: "INVALID_URL",
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export function throwError(code: ErrorCode): never {
  throw new ConvexError(code);
}
