import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type Plan = "FREE" | "PREMIUM" | "ENTERPRISE";

const PLAN_HIERARCHY: Plan[] = ["FREE", "PREMIUM", "ENTERPRISE"];

/**
 * Retourne le plan de l'utilisateur connecté depuis les session claims Clerk.
 * Clerk public metadata est synchronisé après chaque paiement Stripe (webhook).
 */
export async function getSessionPlan(): Promise<Plan> {
  const { sessionClaims } = await auth();
  const meta = sessionClaims?.metadata as { plan?: Plan } | undefined;
  return meta?.plan ?? "FREE";
}

/**
 * Retourne le userId ou redirige vers /sign-in.
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

/**
 * Vérifie que l'utilisateur a au moins le plan requis.
 * Redirige vers /dashboard?upgrade=true si insuffisant.
 */
export async function requirePlan(minimum: Plan): Promise<Plan> {
  const plan = await getSessionPlan();
  if (PLAN_HIERARCHY.indexOf(plan) < PLAN_HIERARCHY.indexOf(minimum)) {
    redirect(`/dashboard?upgrade=${minimum.toLowerCase()}`);
  }
  return plan;
}

/**
 * Retourne vrai si l'utilisateur a accès à la fonctionnalité donnée.
 * Utiliser côté serveur pour afficher/masquer des éléments UI.
 */
export async function canAccess(minimum: Plan): Promise<boolean> {
  const plan = await getSessionPlan();
  return PLAN_HIERARCHY.indexOf(plan) >= PLAN_HIERARCHY.indexOf(minimum);
}

// ─── Limites par plan ─────────────────────────────────────────────────────────
// Source de vérité à synchroniser avec Stripe + BD

export const PLAN_LIMITS: Record<Plan, {
  searchesPerMonth: number;
  export: boolean;
  apiAccess: boolean;
  teamMembers: number;
}> = {
  FREE:       { searchesPerMonth: 5,         export: false, apiAccess: false, teamMembers: 1 },
  PREMIUM:    { searchesPerMonth: Infinity,   export: true,  apiAccess: false, teamMembers: 1 },
  ENTERPRISE: { searchesPerMonth: Infinity,   export: true,  apiAccess: true,  teamMembers: 25 },
};
