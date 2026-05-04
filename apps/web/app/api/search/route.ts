import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma, createSearch, deduplicateSearch, checkSearchQuota, incrementSearchCount } from "@trueprice-ai/db";
import { getUserMarket } from "@/lib/geo";
import { inngest } from "@trueprice-ai/shared";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true, plan: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const body = await req.json() as {
    query?: string;
    inputType?: string;
    productUrl?: string;
    quantity?: number;
  };
  const query = body.query?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ error: "Requête trop courte (min. 2 caractères)" }, { status: 400 });
  }

  // Vérifier quota mensuel
  const quota = await checkSearchQuota(user.id, user.plan);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Quota mensuel atteint", used: quota.used, limit: quota.limit },
      { status: 429 },
    );
  }

  // Déduplication — même requête < 6h avec résultats existants
  const existingId = await deduplicateSearch(user.id, query);
  if (existingId) {
    return NextResponse.json({ searchId: existingId, deduplicated: true });
  }

  const geo = getUserMarket(req);

  const search = await createSearch({
    userId:      user.id,
    query,
    inputType:   (body.inputType as never) ?? "KEYWORD",
    productUrl:  body.productUrl,
    quantity:    body.quantity ?? 1,
    userCountry: geo.country,
    userCurrency:geo.currency,
    userRegion:  geo.province,
  });

  await incrementSearchCount(user.id);

  // Déclencher le job de scraping de manière asynchrone
  await inngest.send({
    name: "scrape/price-search",
    data: { searchId: search.id, query, geo },
  });

  return NextResponse.json({ searchId: search.id, deduplicated: false }, { status: 201 });
}
