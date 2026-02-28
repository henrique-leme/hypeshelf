"use client";

import { useState } from "react";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Genre } from "@/lib/constants";
import { GenreFilter } from "@/components/recommendations/genre-filter";
import { RecommendationForm } from "@/components/recommendations/recommendation-form";
import { RecommendationList } from "@/components/recommendations/recommendation-list";

const PAGE_SIZE = 9;

export default function DashboardPage() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const currentUser = useQuery(api.users.getCurrentUser);

  const {
    results: allResults,
    status: allStatus,
    loadMore: loadMoreAll,
  } = usePaginatedQuery(
    api.recommendations.getAll,
    selectedGenre ? "skip" : {},
    { initialNumItems: PAGE_SIZE }
  );

  const {
    results: filteredResults,
    status: filteredStatus,
    loadMore: loadMoreFiltered,
  } = usePaginatedQuery(
    api.recommendations.getByGenre,
    selectedGenre ? { genre: selectedGenre } : "skip",
    { initialNumItems: PAGE_SIZE }
  );

  const recommendations = selectedGenre ? filteredResults : allResults;
  const status = selectedGenre ? filteredStatus : allStatus;
  const loadMore = selectedGenre ? loadMoreFiltered : loadMoreAll;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          All Recommendations
        </h1>
        <div className="w-full sm:w-auto">
          <RecommendationForm />
        </div>
      </div>

      <GenreFilter
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
      />

      <RecommendationList
        recommendations={recommendations}
        currentUserId={currentUser?._id}
        currentUserRole={currentUser?.role ?? "user"}
        status={status}
        onLoadMore={() => loadMore(PAGE_SIZE)}
      />
    </div>
  );
}
