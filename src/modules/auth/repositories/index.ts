import prisma from "@/lib/prisma/client";
import { User, UserRole, AuthSession } from "@prisma/client";
import bcrypt from "bcryptjs";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function findUserWithUnits(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      unitAccesses: {
        include: {
          unit: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function createUser(data: CreateUserData): Promise<User> {
  const passwordHash = await bcrypt.hash(data.password, 12);
  
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
    },
  });
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export async function createAuthSession(
  userId: string,
  refreshTokenHash: string,
  expiresAt: Date
): Promise<AuthSession> {
  return prisma.authSession.create({
    data: {
      userId,
      refreshTokenHash,
      expiresAt,
    },
  });
}

export async function findAuthSession(refreshTokenHash: string): Promise<AuthSession | null> {
  return prisma.authSession.findFirst({
    where: { refreshTokenHash },
  });
}

export async function deleteAuthSession(id: string): Promise<void> {
  await prisma.authSession.delete({
    where: { id },
  });
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.authSession.deleteMany({
    where: { userId },
  });
}

export async function getUserUnitIds(userId: string): Promise<string[]> {
  const accesses = await prisma.userUnitAccess.findMany({
    where: { userId },
    select: { unitId: true },
  });
  return accesses.map((a) => a.unitId);
}
