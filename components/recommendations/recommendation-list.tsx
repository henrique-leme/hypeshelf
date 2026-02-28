"use client";

import { Id } from "../../convex/_generated/dataModel";
import { RecommendationCard } from "./recommendation-card";
import { DeleteConfirmation } from "./delete-confirmation";
import { StaffPickToggle } from "./staff-pick-toggle";
import { RecommendationGridSkeleton } from "./recommendation-skeleton";

interface RecommendationWithAuthor {
  _id: Id<"recommendations">;
  title: string;
  genre: string;
  blurb: string;
  link: string;
  isStaffPick: boolean;
  userId: Id<"users">;
  authorName: string;
  authorImageUrl?: string;
}

interface RecommendationListProps {
  recommendations: RecommendationWithAuthor[] | null | undefined;
  currentUserId: Id<"users"> | undefined;
  currentUserRole: string;
}

export function RecommendationList({
  recommendations,
  currentUserId,
  currentUserRole,
}: RecommendationListProps) {
  if (recommendations === undefined || recommendations === null) {
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recommendations.map((rec) => {
        const isOwner = currentUserId === rec.userId;
        const isAdmin = currentUserRole === "admin";
        const canDelete = isOwner || isAdmin;

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
              canDelete ? (
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
  );
}
