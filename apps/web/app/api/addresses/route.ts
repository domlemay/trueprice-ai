import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, getUserAddresses, createAddress } from "@trueprice-ai/db";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const addresses = await getUserAddresses(user.id);
  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json() as {
    label:      string;
    street:     string;
    city:       string;
    province:   string;
    postalCode: string;
    country:    string;
    isDefault?: boolean;
  };

  if (!body.label || !body.street || !body.city || !body.province || !body.postalCode || !body.country) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const address = await createAddress(user.id, body);
  return NextResponse.json({ address }, { status: 201 });
}
