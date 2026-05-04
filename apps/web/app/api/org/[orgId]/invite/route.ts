import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, isOrgAdmin, createInvitation } from "@trueprice-ai/db";
import type { OrgRole } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { orgId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (!(await isOrgAdmin(params.orgId, user.id))) {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  let body: { email: string; role?: OrgRole; branchId?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!body.email?.includes("@")) return NextResponse.json({ error: "Email invalide" }, { status: 400 });

  const invitation = await createInvitation(params.orgId, {
    email:     body.email.toLowerCase().trim(),
    role:      body.role ?? "MEMBER",
    invitedBy: user.id,
    branchId:  body.branchId ?? null,
  });

  return NextResponse.json({ token: invitation.token, expiresAt: invitation.expiresAt });
}
