"use client";

import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { getErrorMessage } from "@/lib/convex-errors";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface StaffPickToggleProps {
  recommendationId: Id<"recommendations">;
  isStaffPick: boolean;
}

export function StaffPickToggle({
  recommendationId,
  isStaffPick,
}: StaffPickToggleProps) {
  const toggleStaffPick = useMutation(api.recommendations.toggleStaffPick);

  async function handleToggle() {
    try {
      await toggleStaffPick({ recommendationId });
      toast.success(
        isStaffPick ? "Staff Pick removed." : "Marked as Staff Pick!"
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={handleToggle}
      aria-label={isStaffPick ? "Remove Staff Pick" : "Mark as Staff Pick"}
    >
      <Star
        className={`size-4 ${isStaffPick ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
      />
    </Button>
  );
}
