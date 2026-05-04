import { redis } from "./redis";
import { prisma } from "@trueprice-ai/db";

const FRANKFURTER = "https://api.frankfurter.app";

export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  const cacheKey = `exchange:${from}:${to}`;

  try {
    const cached = await redis.get<number>(cacheKey);
    if (cached !== null) return cached;
  } catch {
    // Redis non configuré — continuer sans cache
  }

  const res = await fetch(`${FRANKFURTER}/latest?from=${from}&to=${to}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Frankfurter error ${res.status}`);

  const data = await res.json() as { rates: Record<string, number> };
  const rate = data.rates[to];
  if (!rate) throw new Error(`Taux introuvable : ${from}/${to}`);

  // TTL 24h — les données ECB sont mises à jour une fois par jour ouvrable
  try {
    await redis.setex(cacheKey, 86_400, rate);
  } catch {
    // Redis non configuré — on continue sans mise en cache
  }

  const validUntil = new Date(Date.now() + 86_400 * 1_000);
  await prisma.exchangeRate.upsert({
    where: {
      fromCurrency_toCurrency_source: { fromCurrency: from, toCurrency: to, source: "frankfurter" },
    },
    create:  { fromCurrency: from, toCurrency: to, rate, source: "frankfurter", validUntil },
    update:  { rate, cachedAt: new Date(), validUntil },
  });

  return rate;
}
