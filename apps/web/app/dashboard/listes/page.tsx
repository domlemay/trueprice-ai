import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@trueprice-ai/db";
import { ListesClient } from "./ListesClient";

export default async function ListesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) redirect("/dashboard");

  const lists = await prisma.productList.findMany({
    where:   { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <ListesClient
      lists={lists.map((l) => ({
        ...l,
        type:        l.type as "STANDARD" | "RECURRING" | "PROJECT",
        description: l.description ?? null,
        createdAt:   l.createdAt.toISOString(),
      }))}
    />
  );
}
