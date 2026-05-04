import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, acceptInvitation } from "@trueprice-ai/db";

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  try {
    await acceptInvitation(params.token, user.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "INVITATION_INVALID") {
      return NextResponse.json({ error: "Invitation expirée ou déjà utilisée" }, { status: 410 });
    }
    if (msg.startsWith("SEATS_LIMIT_REACHED")) {
      return NextResponse.json({ error: "Limite de sièges atteinte. Contactez l'admin." }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
