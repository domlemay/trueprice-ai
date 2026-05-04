import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { removeFavorite, updateFavoriteTags } from "@trueprice-ai/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const deleted = await removeFavorite(userId, id);
  if (!deleted) return NextResponse.json({ error: "Favori introuvable" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { tags?: string[] };
  if (!Array.isArray(body.tags)) {
    return NextResponse.json({ error: "tags doit être un tableau" }, { status: 400 });
  }

  const updated = await updateFavoriteTags(userId, id, body.tags);
  if (!updated) return NextResponse.json({ error: "Favori introuvable" }, { status: 404 });

  return NextResponse.json({ favorite: updated });
}
