"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { useStoreUser } from "@/hooks/use-store-user";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

function UserSync({ children }: { children: ReactNode }) {
  useStoreUser();
  return children;
}

export function ConvexClerkProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <UserSync>{children}</UserSync>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
