import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@trueprice-ai/db";

export async function PATCH(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json() as {
    preferredCurrency?: string;
    preferredLocale?:   string;
    timezone?:          string;
  };

  const VALID_CURRENCIES = ["CAD", "USD", "EUR", "GBP"];
  const VALID_LOCALES    = ["fr-CA", "en-CA", "en-US", "fr-FR", "de-DE", "en-GB"];

  if (body.preferredCurrency && !VALID_CURRENCIES.includes(body.preferredCurrency)) {
    return NextResponse.json({ error: "Devise invalide" }, { status: 400 });
  }
  if (body.preferredLocale && !VALID_LOCALES.includes(body.preferredLocale)) {
    return NextResponse.json({ error: "Locale invalide" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data:  {
      ...(body.preferredCurrency && { preferredCurrency: body.preferredCurrency }),
      ...(body.preferredLocale   && { preferredLocale:   body.preferredLocale   }),
      ...(body.timezone          && { timezone:          body.timezone          }),
    },
  });

  return NextResponse.json({ ok: true });
}
