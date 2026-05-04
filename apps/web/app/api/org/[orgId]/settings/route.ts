import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, isOrgAdmin, updateOrg } from "@trueprice-ai/db";

type Ctx = { params: { orgId: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (!(await isOrgAdmin(params.orgId, user.id))) {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  const body = await req.json() as Parameters<typeof updateOrg>[1];
  await updateOrg(params.orgId, body);
  return NextResponse.json({ ok: true });
}
