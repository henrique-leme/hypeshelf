import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StaffPickBadge() {
  return (
    <Badge className="shrink-0 bg-amber-500 text-white hover:bg-amber-600">
      <Star className="size-3" />
      Staff Pick
    </Badge>
  );
}
