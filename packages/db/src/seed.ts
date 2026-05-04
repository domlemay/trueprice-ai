import { prisma } from "./index";

async function seedMarketplaces() {
  const marketplaces = [
    // ── Amazon ──────────────────────────────────────────────────────────────
    { name: "Amazon Canada",      slug: "amazon.ca",     url: "https://www.amazon.ca",      country: "CA", currency: "CAD" },
    { name: "Amazon États-Unis",  slug: "amazon.com",    url: "https://www.amazon.com",     country: "US", currency: "USD" },
    { name: "Amazon France",      slug: "amazon.fr",     url: "https://www.amazon.fr",      country: "FR", currency: "EUR" },
    { name: "Amazon Allemagne",   slug: "amazon.de",     url: "https://www.amazon.de",      country: "DE", currency: "EUR" },
    { name: "Amazon Royaume-Uni", slug: "amazon.co.uk",  url: "https://www.amazon.co.uk",   country: "GB", currency: "GBP" },
    // ── Best Buy ─────────────────────────────────────────────────────────────
    { name: "Best Buy Canada",    slug: "bestbuy.ca",    url: "https://www.bestbuy.ca",     country: "CA", currency: "CAD" },
    { name: "Best Buy États-Unis",slug: "bestbuy.com",   url: "https://www.bestbuy.com",    country: "US", currency: "USD" },
    // ── Apple ────────────────────────────────────────────────────────────────
    { name: "Apple Store Canada", slug: "apple.ca",      url: "https://www.apple.com/ca",   country: "CA", currency: "CAD" },
    { name: "Apple Store US",     slug: "apple.com",     url: "https://www.apple.com",      country: "US", currency: "USD" },
    // ── Walmart ──────────────────────────────────────────────────────────────
    { name: "Walmart Canada",     slug: "walmart.ca",    url: "https://www.walmart.ca",     country: "CA", currency: "CAD" },
    { name: "Walmart États-Unis", slug: "walmart.com",   url: "https://www.walmart.com",    country: "US", currency: "USD" },
    // ── Costco ───────────────────────────────────────────────────────────────
    { name: "Costco Canada",      slug: "costco.ca",     url: "https://www.costco.ca",      country: "CA", currency: "CAD" },
    // ── Bureau en Gros ───────────────────────────────────────────────────────
    { name: "Bureau en Gros",     slug: "bureauengros.com", url: "https://www.bureauengros.com", country: "CA", currency: "CAD" },
    // ── Épiceries Québec ─────────────────────────────────────────────────────
    { name: "Super C",            slug: "superc.ca",     url: "https://www.superc.ca",      country: "CA", currency: "CAD" },
    { name: "Metro",              slug: "metro.ca",      url: "https://www.metro.ca",       country: "CA", currency: "CAD" },
    { name: "IGA",                slug: "iga.net",       url: "https://www.iga.net",        country: "CA", currency: "CAD" },
    { name: "Maxi",               slug: "maxi.ca",       url: "https://www.maxi.ca",        country: "CA", currency: "CAD" },
  ];

  for (const m of marketplaces) {
    await prisma.marketplace.upsert({
      where:  { slug: m.slug },
      update: { name: m.name, url: m.url, country: m.country, currency: m.currency },
      create: { ...m, status: "OPERATIONAL", isActive: true },
    });
  }

  console.log(`✅ ${marketplaces.length} marketplaces seedées`);
}

async function seedTaxRates() {
  const now = new Date("2025-01-01");
  const source = "https://www.canada.ca/fr/agence-revenu/services/impot/entreprises/sujets/tps-tvh-entreprises.html";

  const taxRates = [
    // ── Canada — Provinces ───────────────────────────────────────────────────
    // Alberta — GST uniquement
    { country: "CA", province: "AB", taxType: "GST",  rate: 0.05,    validFrom: now, source },
    // Colombie-Britannique
    { country: "CA", province: "BC", taxType: "GST",  rate: 0.05,    validFrom: now, source },
    { country: "CA", province: "BC", taxType: "PST",  rate: 0.07,    validFrom: now, source },
    // Manitoba
    { country: "CA", province: "MB", taxType: "GST",  rate: 0.05,    validFrom: now, source },
    { country: "CA", province: "MB", taxType: "PST",  rate: 0.07,    validFrom: now, source },
    // Nouveau-Brunswick — TVH
    { country: "CA", province: "NB", taxType: "HST",  rate: 0.15,    validFrom: now, source },
    // Terre-Neuve-et-Labrador — TVH
    { country: "CA", province: "NL", taxType: "HST",  rate: 0.15,    validFrom: now, source },
    // Nouvelle-Écosse — TVH
    { country: "CA", province: "NS", taxType: "HST",  rate: 0.15,    validFrom: now, source },
    // Ontario — TVH
    { country: "CA", province: "ON", taxType: "HST",  rate: 0.13,    validFrom: now, source },
    // Île-du-Prince-Édouard — TVH
    { country: "CA", province: "PE", taxType: "HST",  rate: 0.15,    validFrom: now, source },
    // Québec
    { country: "CA", province: "QC", taxType: "GST",  rate: 0.05,    validFrom: now, source },
    { country: "CA", province: "QC", taxType: "TVQ",  rate: 0.09975, validFrom: now, source },
    // Saskatchewan
    { country: "CA", province: "SK", taxType: "GST",  rate: 0.05,    validFrom: now, source },
    { country: "CA", province: "SK", taxType: "PST",  rate: 0.06,    validFrom: now, source },
    // Territoires (GST uniquement)
    { country: "CA", province: "NT", taxType: "GST",  rate: 0.05,    validFrom: now, source },
    { country: "CA", province: "NU", taxType: "GST",  rate: 0.05,    validFrom: now, source },
    { country: "CA", province: "YT", taxType: "GST",  rate: 0.05,    validFrom: now, source },
    // ── États-Unis — taux moyen par état (approximatifs) ─────────────────────
    { country: "US", province: "CA", taxType: "SALES_TAX", rate: 0.0725, validFrom: now, source: "https://www.taxrates.com" },
    { country: "US", province: "NY", taxType: "SALES_TAX", rate: 0.08,   validFrom: now, source: "https://www.taxrates.com" },
    { country: "US", province: "TX", taxType: "SALES_TAX", rate: 0.0625, validFrom: now, source: "https://www.taxrates.com" },
    { country: "US", province: "FL", taxType: "SALES_TAX", rate: 0.06,   validFrom: now, source: "https://www.taxrates.com" },
    { country: "US", province: "WA", taxType: "SALES_TAX", rate: 0.065,  validFrom: now, source: "https://www.taxrates.com" },
    // ── Europe ───────────────────────────────────────────────────────────────
    { country: "FR", province: null, taxType: "TVA", rate: 0.20, validFrom: now, source: "https://www.impots.gouv.fr" },
    { country: "DE", province: null, taxType: "TVA", rate: 0.19, validFrom: now, source: "https://www.bundesfinanzministerium.de" },
    { country: "GB", province: null, taxType: "VAT", rate: 0.20, validFrom: now, source: "https://www.gov.uk/vat-rates" },
  ];

  for (const t of taxRates) {
    await prisma.taxRate.upsert({
      where: {
        id: `${t.country}-${t.province ?? "national"}-${t.taxType}`,
      },
      update: { rate: t.rate, source: t.source },
      create: { ...t, verifiedAt: now },
    }).catch(async () => {
      // Si conflit sur ID généré, créer directement
      const existing = await prisma.taxRate.findFirst({
        where: { country: t.country, province: t.province, taxType: t.taxType },
      });
      if (!existing) {
        await prisma.taxRate.create({ data: { ...t, verifiedAt: now } });
      }
    });
  }

  console.log(`✅ ${taxRates.length} taux de taxes seedés`);
}

async function seedDutyRates() {
  const now = new Date("2025-01-01");

  const dutyRates = [
    // CUSMA — Canada ↔ États-Unis
    { fromCountry: "US", toCountry: "CA", productCategory: "general",     rate: 0,    exemptionLimit: 20,  agreement: "CUSMA", validFrom: now },
    { fromCountry: "US", toCountry: "CA", productCategory: "electronics", rate: 0,    exemptionLimit: 20,  agreement: "CUSMA", validFrom: now },
    { fromCountry: "US", toCountry: "CA", productCategory: "clothing",    rate: 0,    exemptionLimit: 20,  agreement: "CUSMA", validFrom: now },
    { fromCountry: "CA", toCountry: "US", productCategory: "general",     rate: 0,    exemptionLimit: 800, agreement: "CUSMA", validFrom: now },
    // UE → Canada
    { fromCountry: "FR", toCountry: "CA", productCategory: "general",     rate: 0.05, exemptionLimit: 20,  agreement: "standard", validFrom: now },
    { fromCountry: "DE", toCountry: "CA", productCategory: "general",     rate: 0.05, exemptionLimit: 20,  agreement: "standard", validFrom: now },
    // UK → Canada (post-Brexit)
    { fromCountry: "GB", toCountry: "CA", productCategory: "general",     rate: 0.05, exemptionLimit: 20,  agreement: "standard", validFrom: now },
  ];

  for (const d of dutyRates) {
    const existing = await prisma.dutyRate.findFirst({
      where: { fromCountry: d.fromCountry, toCountry: d.toCountry, productCategory: d.productCategory },
    });
    if (!existing) {
      await prisma.dutyRate.create({ data: { ...d, verifiedAt: now } });
    }
  }

  console.log(`✅ ${dutyRates.length} taux douaniers seedés`);
}

async function main() {
  console.log("🌱 Démarrage du seed TruePriceAI...\n");
  await seedMarketplaces();
  await seedTaxRates();
  await seedDutyRates();
  console.log("\n✅ Seed terminé avec succès.");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
