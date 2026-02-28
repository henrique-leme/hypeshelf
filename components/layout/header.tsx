"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { APP_NAME } from "@/lib/constants";
import { AuthButtons } from "./auth-buttons";

export function Header() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight sm:text-xl">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
