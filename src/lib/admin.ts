
import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

export const ADMIN_COOKIE_NAME = "10jital_admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24;

function getSecret(): string | null {
  const secret = process.env.ADMIN_SECRET_KEY?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
}

export function isAdminConfigured(): boolean {
  return getSecret() !== null;
}

export function verifyAdminKey(providedKey: string): boolean {
  const secret = getSecret();
  if (!secret || typeof providedKey !== "string") return false;

  const expected = Buffer.from(secret);
  const provided = Buffer.from(providedKey);

  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

export function createAdminSessionCookie(): string {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_SECRET_KEY non configurée.");

  const payload = Buffer.from(
    JSON.stringify({
      issuedAt: Date.now(),
      nonce: randomBytes(16).toString("hex"),
    })
  ).toString("base64url");

  const value = `${payload}.${sign(payload, secret)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${ADMIN_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_COOKIE_MAX_AGE}${secure}`;
}

export function isAuthenticatedRequest(
  cookieHeader: string | null
): boolean {
  const secret = getSecret();
  if (!secret || !cookieHeader) return false;

  try {
    const cookie = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));

    if (!cookie) return false;

    const value = cookie.slice(ADMIN_COOKIE_NAME.length + 1);
    const separator = value.lastIndexOf(".");
    if (separator <= 0) return false;

    const payload = value.slice(0, separator);
    const signature = value.slice(separator + 1);
    const expectedSignature = sign(payload, secret);

    const received = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      return false;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      typeof session.issuedAt !== "number" ||
      !Number.isFinite(session.issuedAt)
    ) {
      return false;
    }

    const age = Date.now() - session.issuedAt;
    return age >= 0 && age <= ADMIN_COOKIE_MAX_AGE * 1000;
  } catch {
    return false;
  }
}

export function createAdminLogoutCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
