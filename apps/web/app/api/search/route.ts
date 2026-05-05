import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma, createSearch, deduplicateSearch, checkSearchQuota, incrementSearchCount } from "@trueprice-ai/db";
import { getUserMarket } from "@/lib/geo";
import { inngest } from "@trueprice-ai/shared";
import { runScrapePipeline } from "@/lib/scrape-pipeline";
import { parseSearchInput } from "@/lib/input-parsers";

const inngestConfigured =
  !!process.env.INNGEST_SIGNING_KEY &&
  !process.env.INNGEST_SIGNING_KEY.startsWith("VOTRE_") &&
  process.env.INNGEST_SIGNING_KEY !== "placeholder";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true, plan: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const body = await req.json() as {
    query?:            string;
    inputType?:        string;
    productUrl?:       string;
    quantity?:         number;
    addressId?:        string;
    marketplaceSlugs?: string[];
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

  // Détection automatique du type d'entrée
  const parsed    = parseSearchInput(query);
  const inputType = (body.inputType as never) ?? parsed.type;

  // Résoudre la géolocalisation (adresse sélectionnée > cookie IP)
  let geo = getUserMarket(req);
  if (body.addressId) {
    const addr = await prisma.userAddress.findFirst({
      where:  { id: body.addressId, userId: user.id },
      select: { province: true, country: true },
    });
    if (addr) {
      geo = {
        ...geo,
        country:  addr.country,
        province: addr.province,
      };
    }
  }

  const search = await createSearch({
    userId:       user.id,
    query,
    inputType,
    productUrl:   body.productUrl ?? (parsed.type === "URL" ? parsed.normalized : undefined),
    quantity:     body.quantity ?? 1,
    userCountry:  geo.country,
    userCurrency: geo.currency,
    userRegion:   geo.province,
  });

  await incrementSearchCount(user.id);

  const pipelineParams = {
    searchId:          search.id,
    query,
    geo,
    marketplaceSlugs:  body.marketplaceSlugs,
  };

  if (inngestConfigured) {
    try {
      await inngest.send({ name: "scrape/price-search", data: pipelineParams });
    } catch (err) {
      console.warn("[search] inngest.send failed, falling back to sync scrape:", err);
      void runScrapePipeline(pipelineParams).catch(
        (e) => console.error("[search] sync scrape error:", e),
      );
    }
  } else {
    void runScrapePipeline(pipelineParams).catch(
      (e) => console.error("[search] sync scrape error:", e),
    );
  }

  return NextResponse.json({ searchId: search.id, deduplicated: false }, { status: 201 });
}
