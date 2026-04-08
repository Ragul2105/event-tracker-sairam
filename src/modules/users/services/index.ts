import * as userRepo from "../repositories";
import { NotFoundError, ConflictError } from "@/modules/shared/errors";
import { createLogger } from "@/lib/logger";
import prisma from "@/lib/prisma/client";
import { UserRole } from "@prisma/client";

const logger = createLogger("users-service");

export async function listUsers(includeInactive = false) {
  return userRepo.findUsers(includeInactive);
}

export async function getUser(id: string) {
  const user = await userRepo.findUserById(id);
  if (!user) {
    throw new NotFoundError("User");
  }
  return user;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  unitIds?: string[];
}) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  
  if (existing) {
    throw new ConflictError("Email already in use");
  }
  
  const user = await userRepo.createUser(data);
  logger.info("User created", { userId: user.id, email: user.email });
  
  return user;
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    isActive?: boolean;
    unitIds?: string[];
  }
) {
  const existing = await userRepo.findUserById(id);
  if (!existing) {
    throw new NotFoundError("User");
  }
  
  // Check email uniqueness if changing
  if (data.email && data.email.toLowerCase() !== existing.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (emailExists) {
      throw new ConflictError("Email already in use");
    }
  }
  
  const user = await userRepo.updateUser(id, data);
  logger.info("User updated", { userId: id });
  
  return user;
}

export async function deleteUser(id: string) {
  const existing = await userRepo.findUserById(id);
  if (!existing) {
    throw new NotFoundError("User");
  }
  
  await userRepo.deleteUser(id);
  logger.info("User deleted", { userId: id });
}
