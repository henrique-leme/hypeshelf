"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { api } from "../../convex/_generated/api";
import {
  recommendationFormSchema,
  type RecommendationFormValues,
} from "@/lib/validators";
import { GENRES, FIELD_LIMITS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RecommendationForm() {
  const [open, setOpen] = useState(false);
  const createRecommendation = useMutation(api.recommendations.create);

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: { title: "", genre: undefined, link: "", blurb: "" },
  });

  const { isSubmitting } = form.formState;
  const titleLength = form.watch("title")?.length ?? 0;
  const blurbLength = form.watch("blurb")?.length ?? 0;

  async function onSubmit(values: RecommendationFormValues) {
    try {
      await createRecommendation(values);
      toast.success("Recommendation added!");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Failed to add recommendation. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Recommendation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share a Recommendation</DialogTitle>
          <DialogDescription>
            Share something you&apos;re hyped about with everyone.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Title</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {titleLength}/{FIELD_LIMITS.TITLE_MAX}
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="e.g. Interstellar"
                      maxLength={FIELD_LIMITS.TITLE_MAX}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full capitalize">
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENRES.map((genre) => (
                        <SelectItem
                          key={genre}
                          value={genre}
                          className="capitalize"
                        >
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      maxLength={FIELD_LIMITS.LINK_MAX}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="blurb"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Blurb</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {blurbLength}/{FIELD_LIMITS.BLURB_MAX}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="What makes this worth watching?"
                      maxLength={FIELD_LIMITS.BLURB_MAX}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Recommendation"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
