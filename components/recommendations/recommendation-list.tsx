"use client";

import { Id } from "../../convex/_generated/dataModel";
import { RecommendationWithAuthor } from "@/types/recommendations";
import { Role } from "@/types/globals";
import { canDeleteRecommendation } from "@/lib/authorization";
import { RecommendationCard } from "./recommendation-card";
import { DeleteConfirmation } from "./delete-confirmation";
import { StaffPickToggle } from "./staff-pick-toggle";
import { RecommendationGridSkeleton } from "./recommendation-skeleton";
import { Button } from "@/components/ui/button";

type PaginationStatus =
  | "LoadingFirstPage"
  | "LoadingMore"
  | "CanLoadMore"
  | "Exhausted";

interface RecommendationListProps {
  recommendations: RecommendationWithAuthor[];
  currentUserId: Id<"users"> | undefined;
  currentUserRole: Role;
  status: PaginationStatus;
  onLoadMore: () => void;
}

export function RecommendationList({
  recommendations,
  currentUserId,
  currentUserRole,
  status,
  onLoadMore,
}: RecommendationListProps) {
  if (status === "LoadingFirstPage") {
    return <RecommendationGridSkeleton />;
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16">
        <p className="text-muted-foreground">
          No recommendations found. Try a different genre or add one!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => {
          const isAdmin = currentUserRole === "admin";
          const showActions = canDeleteRecommendation(currentUserId, rec.userId, currentUserRole);

          return (
            <RecommendationCard
              key={rec._id}
              title={rec.title}
              genre={rec.genre}
              blurb={rec.blurb}
              link={rec.link}
              authorName={rec.authorName}
              authorImageUrl={rec.authorImageUrl}
              isStaffPick={rec.isStaffPick}
              actions={
                showActions ? (
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <StaffPickToggle
                        recommendationId={rec._id}
                        isStaffPick={rec.isStaffPick}
                      />
                    )}
                    <DeleteConfirmation recommendationId={rec._id} />
                  </div>
                ) : undefined
              }
            />
          );
        })}
      </div>

      {status === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )}

      {status === "LoadingMore" && (
        <div className="flex justify-center">
          <Button variant="outline" disabled>
            Loading...
          </Button>
        </div>
      )}
    </div>
  );
}
