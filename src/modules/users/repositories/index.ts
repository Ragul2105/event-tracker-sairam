import prisma from "@/lib/prisma/client";
import { Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const userWithUnits = {
  unitAccesses: {
    include: {
      unit: {
        select: { id: true, code: true, name: true },
      },
    },
  },
};

export async function findUsers(includeInactive = false) {
  return prisma.user.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: userWithUnits,
    orderBy: { createdAt: "desc" },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: userWithUnits,
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  unitIds?: string[];
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      unitAccesses: data.unitIds?.length
        ? {
            create: data.unitIds.map((unitId) => ({ unitId })),
          }
        : undefined,
    },
    include: userWithUnits,
  });
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
  const updateData: Prisma.UserUpdateInput = {};
  
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email.toLowerCase();
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12);
  if (data.role) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  
  // Handle unit access updates
  if (data.unitIds !== undefined) {
    // Delete existing accesses and create new ones
    await prisma.userUnitAccess.deleteMany({
      where: { userId: id },
    });
    
    if (data.unitIds.length > 0) {
      await prisma.userUnitAccess.createMany({
        data: data.unitIds.map((unitId) => ({ userId: id, unitId })),
      });
    }
  }
  
  return prisma.user.update({
    where: { id },
    data: updateData,
    include: userWithUnits,
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}
