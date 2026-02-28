import { auth } from "@clerk/nextjs/server";
import type { Role } from "@/types/globals";

export async function checkRole(role: Role): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === role;
}
