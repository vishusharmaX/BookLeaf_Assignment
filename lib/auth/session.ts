import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken, SessionPayload } from "./jwt";
import prisma from "@/lib/db/prisma";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      authorProfile: {
        include: {
          books: true,
        },
      },
    },
  });

  return user;
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Please sign in to continue.");
  }
  return session;
}

export async function requireAuthor(): Promise<SessionPayload & { authorId: string }> {
  const session = await requireAuth();
  if (session.role !== "AUTHOR" || !session.authorId) {
    throw new Error("Forbidden: Author access required.");
  }
  return session as SessionPayload & { authorId: string };
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new Error("Forbidden: Administrator access required.");
  }
  return session;
}
