import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@trueprice-ai/db";
import { FavorisClient } from "./FavorisClient";

export default async function FavorisPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true },
  });
  if (!user) redirect("/dashboard");

  const favorites = await prisma.favorite.findMany({
    where:   { userId: user.id },
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

  return (
    <FavorisClient
      favorites={favorites.map((f) => ({
        id:        f.id,
        tags:      f.tags,
        createdAt: f.createdAt.toISOString(),
        product:   f.product
          ? {
              id:       f.product.id,
              name:     f.product.name,
              brand:    f.product.brand,
              imageUrl: f.product.imageUrl,
              category: f.product.category,
            }
          : null,
      }))}
    />
  );
}
