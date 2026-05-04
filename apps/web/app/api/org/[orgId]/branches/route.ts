import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, isOrgAdmin, createBranch } from "@trueprice-ai/db";

type Ctx = { params: { orgId: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const branches = await prisma.branch.findMany({
    where:   { organizationId: params.orgId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ branches });
}

export async function POST(req: Request, { params }: Ctx) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (!(await isOrgAdmin(params.orgId, user.id))) {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  const body = await req.json() as {
    name: string; country?: string; province?: string;
    city?: string; timezone?: string; currency?: string; isHeadquarters?: boolean;
  };

  if (!body.name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  await createBranch(params.orgId, {
    name:           body.name.trim(),
    country:        body.country,
    province:       body.province,
    city:           body.city,
    timezone:       body.timezone,
    currency:       body.currency,
    isHeadquarters: body.isHeadquarters,
  });

  return NextResponse.json({ ok: true });
}
