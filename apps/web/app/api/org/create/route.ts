import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, createOrganization } from "@trueprice-ai/db";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true, plan: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (user.plan !== "ENTERPRISE" && user.plan !== "ENTERPRISE_PRO") {
    return NextResponse.json({ error: "Plan Entreprise requis" }, { status: 403 });
  }

  let body: { name: string; currency?: string; locale?: string; timezone?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!body.name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const org = await createOrganization({
    name:            body.name.trim(),
    creatorUserId:   user.id,
    defaultCurrency: body.currency ?? "CAD",
    defaultLocale:   body.locale   ?? "fr-CA",
    defaultTimezone: body.timezone ?? "America/Toronto",
  });

  return NextResponse.json({ org });
}
