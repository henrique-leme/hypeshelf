"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/convex-errors";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationProps {
  recommendationId: Id<"recommendations">;
}

export function DeleteConfirmation({
  recommendationId,
}: DeleteConfirmationProps) {
  const [open, setOpen] = useState(false);
  const removeRecommendation = useMutation(api.recommendations.remove);

  async function handleDelete() {
    try {
      await removeRecommendation({ recommendationId });
      toast.success("Recommendation deleted.");
      setOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Delete recommendation">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Recommendation</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            recommendation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
