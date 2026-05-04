import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@trueprice-ai/db";
import { OnboardingClient } from "./OnboardingClient";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { onboardingCompletedAt: true, onboardingStep: true },
  });

  // Déjà terminé → dashboard
  if (user?.onboardingCompletedAt) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-tp-navy-700 flex items-center justify-center p-6">
      <OnboardingClient resumeStep={user?.onboardingStep ?? 0} />
    </div>
  );
}
