import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { env } from "@/lib/env";

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: "access" | "refresh";
}

const getSecretKey = (type: "access" | "refresh") => {
  const secret = type === "access" ? env.JWT_SECRET : env.REFRESH_TOKEN_SECRET;
  return new TextEncoder().encode(secret);
};

const parseExpiry = (expiry: string): number => {
  const match = expiry.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60; // Default 7 days
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case "d": return value * 24 * 60 * 60;
    case "h": return value * 60 * 60;
    case "m": return value * 60;
    case "s": return value;
    default: return 7 * 24 * 60 * 60;
  }
};

export async function generateAccessToken(payload: Omit<TokenPayload, "type">): Promise<string> {
  const expiresIn = parseExpiry(env.JWT_EXPIRES_IN);
  
  return new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(getSecretKey("access"));
}

export async function generateRefreshToken(payload: Omit<TokenPayload, "type">): Promise<string> {
  const expiresIn = parseExpiry(env.REFRESH_TOKEN_EXPIRES_IN);
  
  return new SignJWT({ ...payload, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(getSecretKey("refresh"));
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey("access"));
    if (payload.type !== "access") return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey("refresh"));
    if (payload.type !== "refresh") return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiryDate(type: "access" | "refresh"): Date {
  const expiry = type === "access" ? env.JWT_EXPIRES_IN : env.REFRESH_TOKEN_EXPIRES_IN;
  const seconds = parseExpiry(expiry);
  return new Date(Date.now() + seconds * 1000);
}
