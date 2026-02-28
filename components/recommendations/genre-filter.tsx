"use client";

import { GENRES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface GenreFilterProps {
  selectedGenre: string | null;
  onGenreChange: (genre: string | null) => void;
}

export function GenreFilter({ selectedGenre, onGenreChange }: GenreFilterProps) {
  return (
    <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Button
          variant={selectedGenre === null ? "default" : "outline"}
          size="sm"
          className="shrink-0"
          onClick={() => onGenreChange(null)}
        >
          All
        </Button>
        {GENRES.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? "default" : "outline"}
            size="sm"
            className="shrink-0 capitalize"
            onClick={() => onGenreChange(genre)}
          >
            {genre}
          </Button>
        ))}
      </div>
    </div>
  );
}
