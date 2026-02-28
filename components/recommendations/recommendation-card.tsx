"use client";

import { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StaffPickBadge } from "./staff-pick-badge";

interface RecommendationCardProps {
  title: string;
  genre: string;
  blurb: string;
  link: string;
  authorName: string;
  authorImageUrl?: string;
  isStaffPick: boolean;
  actions?: ReactNode;
}

export function RecommendationCard({
  title,
  genre,
  blurb,
  link,
  authorName,
  authorImageUrl,
  isStaffPick,
  actions,
}: RecommendationCardProps) {
  return (
    <Card
      className={`flex h-full flex-col ${isStaffPick ? "border-amber-500/50 shadow-amber-500/10 shadow-md" : ""}`}
    >
      <CardHeader>
        <div className="flex items-start gap-2">
          <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
          {isStaffPick && <StaffPickBadge />}
        </div>
        <Badge variant="secondary" className="w-fit capitalize">
          {genre}
        </Badge>
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{blurb}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {authorImageUrl && (
              <AvatarImage src={authorImageUrl} alt={authorName} />
            )}
            <AvatarFallback>
              {authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{authorName}</span>
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:underline"
        >
          Visit
          <ExternalLink className="size-3" />
        </a>
      </CardFooter>
    </Card>
  );
}
