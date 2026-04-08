import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiryDate,
} from "@/lib/jwt";
import * as authRepo from "../repositories";
import { AuthenticationError } from "@/modules/shared/errors";
import { createLogger } from "@/lib/logger";
import { AuthTokens, AuthUser } from "@/modules/shared/types";

const logger = createLogger("auth-service");

export async function login(
  email: string,
  password: string
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const user = await authRepo.findUserByEmail(email);
  
  if (!user) {
    logger.warn("Login attempt with invalid email", { email });
    throw new AuthenticationError("Invalid email or password");
  }
  
  if (!user.isActive) {
    logger.warn("Login attempt for inactive user", { email });
    throw new AuthenticationError("Account is inactive");
  }
  
  const isValidPassword = await authRepo.verifyPassword(user, password);
  
  if (!isValidPassword) {
    logger.warn("Login attempt with invalid password", { email });
    throw new AuthenticationError("Invalid email or password");
  }
  
  const unitIds = await authRepo.getUserUnitIds(user.id);
  
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  const accessToken = await generateAccessToken(tokenPayload);
  const refreshToken = await generateRefreshToken(tokenPayload);
  
  // Store refresh token hash in database
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = getTokenExpiryDate("refresh");
  await authRepo.createAuthSession(user.id, refreshTokenHash, expiresAt);
  
  logger.info("User logged in successfully", { userId: user.id, email: user.email });
  
  return {
    tokens: { accessToken, refreshToken },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      unitIds,
    },
  };
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const payload = await verifyRefreshToken(refreshToken);
  
  if (!payload) {
    throw new AuthenticationError("Invalid refresh token");
  }
  
  const user = await authRepo.findUserById(payload.userId);
  
  if (!user || !user.isActive) {
    throw new AuthenticationError("User not found or inactive");
  }
  
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  const newAccessToken = await generateAccessToken(tokenPayload);
  const newRefreshToken = await generateRefreshToken(tokenPayload);
  
  // Update session with new refresh token
  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
  const expiresAt = getTokenExpiryDate("refresh");
  await authRepo.createAuthSession(user.id, newRefreshTokenHash, expiresAt);
  
  logger.info("Tokens refreshed", { userId: user.id });
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string): Promise<void> {
  await authRepo.deleteAllUserSessions(userId);
  logger.info("User logged out", { userId });
}

export async function getCurrentUser(userId: string): Promise<AuthUser | null> {
  const user = await authRepo.findUserWithUnits(userId);
  
  if (!user || !user.isActive) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    unitIds: user.unitAccesses.map((ua) => ua.unitId),
  };
}
