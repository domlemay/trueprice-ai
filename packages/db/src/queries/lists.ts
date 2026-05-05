import { prisma } from "../index";
import type { ListType } from "@prisma/client";

export async function getUserLists(userId: string) {
  return prisma.productList.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });
}

export async function getListById(id: string, userId: string) {
  return prisma.productList.findFirst({
    where:   { id, userId },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createList(data: {
  userId:       string;
  name:         string;
  type?:        ListType;
  description?: string;
  tags?:        string[];
}) {
  return prisma.productList.create({
    data: {
      userId:      data.userId,
      name:        data.name,
      type:        data.type        ?? "STANDARD",
      description: data.description,
      tags:        data.tags        ?? [],
    },
  });
}

export async function updateList(
  id:     string,
  userId: string,
  data: {
    name?:        string;
    description?: string;
    tags?:        string[];
  },
) {
  return prisma.productList.updateMany({ where: { id, userId }, data });
}

export async function deleteList(id: string, userId: string) {
  return prisma.productList.deleteMany({ where: { id, userId } });
}

export async function addItemToList(
  listId: string,
  userId: string,
  data: {
    query?:     string;
    productId?: string;
    quantity?:  number;
    notes?:     string;
  },
) {
  const list = await prisma.productList.findFirst({ where: { id: listId, userId } });
  if (!list) throw new Error("Liste introuvable ou accès refusé");

  const agg = await prisma.productListItem.aggregate({
    where: { listId },
    _max:  { sortOrder: true },
  });
  const sortOrder = (agg._max.sortOrder ?? -1) + 1;

  return prisma.productListItem.create({
    data: {
      listId,
      query:     data.query,
      productId: data.productId,
      quantity:  data.quantity ?? 1,
      notes:     data.notes,
      sortOrder,
    },
  });
}

export async function removeItemFromList(itemId: string, userId: string) {
  const item = await prisma.productListItem.findFirst({
    where:   { id: itemId },
    include: { list: { select: { userId: true } } },
  });
  if (!item || item.list.userId !== userId) throw new Error("Item introuvable ou accès refusé");
  return prisma.productListItem.delete({ where: { id: itemId } });
}
