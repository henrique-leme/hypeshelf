import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          {APP_NAME} &mdash; Built with Next.js, Clerk &amp; Convex
        </p>
      </div>
    </footer>
  );
}
