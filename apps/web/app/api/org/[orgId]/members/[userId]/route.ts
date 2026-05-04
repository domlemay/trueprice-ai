import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, isOrgAdmin, updateMemberRole, removeMember } from "@trueprice-ai/db";
import type { OrgRole } from "@prisma/client";

type Ctx = { params: { orgId: string; userId: string } };

// PATCH — changer le rôle
export async function PATCH(req: Request, { params }: Ctx) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const caller = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!caller) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (!(await isOrgAdmin(params.orgId, caller.id))) {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  const { role } = await req.json() as { role: OrgRole };
  if (!["ADMIN", "MANAGER", "MEMBER"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  await updateMemberRole(params.orgId, params.userId, role, caller.id);
  return NextResponse.json({ ok: true });
}

// DELETE — retirer le membre
export async function DELETE(_req: Request, { params }: Ctx) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const caller = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!caller) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (!(await isOrgAdmin(params.orgId, caller.id))) {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  // Un admin ne peut pas se retirer lui-même
  if (caller.id === params.userId) {
    return NextResponse.json({ error: "Impossible de se retirer soi-même" }, { status: 400 });
  }

  await removeMember(params.orgId, params.userId, caller.id);
  return NextResponse.json({ ok: true });
}
