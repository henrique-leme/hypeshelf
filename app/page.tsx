"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { RecommendationGridSkeleton } from "@/components/recommendations/recommendation-skeleton";

export default function Home() {
  const recommendations = useQuery(api.recommendations.getPublicRecent);

  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="flex flex-col items-center gap-3 pt-8 text-center sm:gap-4 sm:pt-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {APP_NAME}
        </h1>
        <p className="max-w-md text-base text-muted-foreground sm:text-lg">
          {APP_TAGLINE}
        </p>
        <Link href="/sign-in">
          <Button size="lg" className="mt-2 sm:mt-4">
            Sign in to add yours
          </Button>
        </Link>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Latest Recommendations
        </h2>

        {recommendations === undefined && (
          <RecommendationGridSkeleton count={3} />
        )}

        {recommendations && recommendations.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16">
            <p className="text-muted-foreground">
              No recommendations yet. Be the first!
            </p>
            <Link href="/sign-in">
              <Button variant="outline">Sign in to get started</Button>
            </Link>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec._id}
                title={rec.title}
                genre={rec.genre}
                blurb={rec.blurb}
                link={rec.link}
                authorName={rec.authorName}
                authorImageUrl={rec.authorImageUrl}
                isStaffPick={rec.isStaffPick}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
