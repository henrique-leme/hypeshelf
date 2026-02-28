import { Role } from "@/types/globals";

export function canDeleteRecommendation(
  currentUserId: string | undefined,
  recommendationUserId: string,
  currentUserRole: Role
): boolean {
  if (!currentUserId) return false;

  const isOwner = currentUserId === recommendationUserId;
  const isAdmin = currentUserRole === "admin";

  return isOwner || isAdmin;
}
