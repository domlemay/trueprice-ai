import { prisma } from "../index";

export async function addFavorite(userId: string, productId: string) {
  return prisma.favorite.upsert({
    where:  { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
    include: { product: { select: { id: true, name: true, imageUrl: true, category: true } } },
  });
}

export async function removeFavorite(userId: string, favoriteId: string) {
  const fav = await prisma.favorite.findFirst({ where: { id: favoriteId, userId } });
  if (!fav) return null;
  return prisma.favorite.delete({ where: { id: favoriteId } });
}

export async function isFavorited(userId: string, productId: string): Promise<boolean> {
  const count = await prisma.favorite.count({ where: { userId, productId } });
  return count > 0;
}

export async function getUserFavorites(userId: string, limit = 50, cursor?: string) {
  return prisma.favorite.findMany({
    where:   { userId },
    take:    limit,
    skip:    cursor ? 1 : 0,
    cursor:  cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id:       true,
          name:     true,
          brand:    true,
          imageUrl: true,
          category: true,
        },
      },
    },
  });
}

export async function updateFavoriteTags(userId: string, favoriteId: string, tags: string[]) {
  const fav = await prisma.favorite.findFirst({ where: { id: favoriteId, userId } });
  if (!fav) return null;
  return prisma.favorite.update({ where: { id: favoriteId }, data: { tags } });
}
