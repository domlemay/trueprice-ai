import { prisma } from "../index";
import type { UserAddress } from "@prisma/client";

export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  return prisma.userAddress.findMany({
    where:   { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export async function createAddress(
  userId: string,
  data: {
    label:      string;
    street:     string;
    city:       string;
    province:   string;
    postalCode: string;
    country:    string;
    isDefault?: boolean;
  },
): Promise<UserAddress> {
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const isFirst = (await tx.userAddress.count({ where: { userId } })) === 0;
    return tx.userAddress.create({
      data: { userId, ...data, isDefault: data.isDefault ?? isFirst },
    });
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: Partial<{
    label:      string;
    street:     string;
    city:       string;
    province:   string;
    postalCode: string;
    country:    string;
    isDefault:  boolean;
  }>,
): Promise<UserAddress> {
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.userAddress.update({
      where: { id: addressId },
      data,
    });
  });
}

export async function deleteAddress(userId: string, addressId: string): Promise<void> {
  await prisma.userAddress.delete({ where: { id: addressId } });

  // Si on supprime l'adresse par défaut, promouvoir la plus ancienne
  const remaining = await prisma.userAddress.findMany({
    where:   { userId },
    orderBy: { createdAt: "asc" },
    take:    1,
  });
  if (remaining[0] && !remaining[0].isDefault) {
    await prisma.userAddress.update({
      where: { id: remaining[0].id },
      data:  { isDefault: true },
    });
  }
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    await tx.userAddress.update({ where: { id: addressId }, data: { isDefault: true } });
  });
}
