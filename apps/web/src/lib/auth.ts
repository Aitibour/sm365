import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "sm365_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  email: string;
  name: string;
  role: string;
};

type SessionPayload = {
  user: SessionUser;
  expiresAt: number;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET || "sm365-dev-secret";
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload;
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  const payload: SessionPayload = {
    user,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const encoded = encodePayload(payload);
  const signature = sign(encoded);

  cookieStore.set(SESSION_COOKIE, `${encoded}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  const [encoded, signature] = raw.split(".");

  if (!encoded || !signature || !safeEqual(sign(encoded), signature)) {
    return null;
  }

  try {
    const payload = decodePayload(encoded);

    if (payload.expiresAt < Date.now()) {
      return null;
    }

    return payload.user;
  } catch {
    return null;
  }
}
