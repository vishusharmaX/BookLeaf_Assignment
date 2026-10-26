import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "AUTHOR" | "ADMIN";
  authorId?: string;
  externalAuthorId?: string;
  [key: string]: unknown;
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "bookleaf-secure-production-auth-secret-key-32chars"
);

export const COOKIE_NAME = "bookleaf_session";

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
