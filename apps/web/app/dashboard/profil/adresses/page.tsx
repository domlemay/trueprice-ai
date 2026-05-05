import { auth }    from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, getUserAddresses } from "@trueprice-ai/db";
import { AdressesClient } from "./AdressesClient";

export default async function AdressesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true },
  });
  if (!user) redirect("/sign-in");

  const addresses = await getUserAddresses(user.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Adresses de livraison</h1>
        <p className="text-slate-400 text-sm">
          Vos adresses sont utilisées pour calculer les taxes provinciales et les frais de livraison exacts.
        </p>
      </div>
      <AdressesClient initialAddresses={addresses} />
    </div>
  );
}
