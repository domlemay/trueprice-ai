import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { addFavorite, getUserFavorites } from "@trueprice-ai/db";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
  const favorites = await getUserFavorites(userId, 50, cursor);

  const nextCursor = favorites.length === 50 ? favorites.at(-1)?.id : undefined;
  return NextResponse.json({ favorites, nextCursor });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json() as { productId?: string };
  if (!body.productId) {
    return NextResponse.json({ error: "productId requis" }, { status: 400 });
  }

  const favorite = await addFavorite(userId, body.productId);
  return NextResponse.json({ favorite }, { status: 201 });
}
