"use client";

import { GENRES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface GenreFilterProps {
  selectedGenre: string | null;
  onGenreChange: (genre: string | null) => void;
}

export function GenreFilter({ selectedGenre, onGenreChange }: GenreFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedGenre === null ? "default" : "outline"}
        size="sm"
        onClick={() => onGenreChange(null)}
      >
        All
      </Button>
      {GENRES.map((genre) => (
        <Button
          key={genre}
          variant={selectedGenre === genre ? "default" : "outline"}
          size="sm"
          onClick={() => onGenreChange(genre)}
          className="capitalize"
        >
          {genre}
        </Button>
      ))}
    </div>
  );
}
