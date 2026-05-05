import { auth }    from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma }   from "@trueprice-ai/db";
import { LocalisationClient } from "./LocalisationClient";

export default async function LocalisationPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { preferredCurrency: true, preferredLocale: true, timezone: true },
  });
  if (!user) redirect("/sign-in");

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Localisation</h1>
        <p className="text-slate-400 text-sm">
          Ces préférences s&apos;appliquent aux calculs de taxes, devises et formats d&apos;affichage.
        </p>
      </div>
      <LocalisationClient
        initialCurrency={user.preferredCurrency}
        initialLocale={user.preferredLocale}
        initialTimezone={user.timezone}
      />
    </div>
  );
}
