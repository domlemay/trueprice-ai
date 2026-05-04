import type { NextRequest } from "next/server";

export type UserMarket = {
  country: string;
  province: string;
  currency: string;
  locale: string;
  timezone: string;
};

const COUNTRY_DEFAULTS: Record<string, Omit<UserMarket, "country" | "province">> = {
  CA: { currency: "CAD", locale: "fr-CA", timezone: "America/Toronto"  },
  US: { currency: "USD", locale: "en-US", timezone: "America/New_York" },
  FR: { currency: "EUR", locale: "fr-FR", timezone: "Europe/Paris"     },
  DE: { currency: "EUR", locale: "de-DE", timezone: "Europe/Berlin"    },
  GB: { currency: "GBP", locale: "en-GB", timezone: "Europe/London"    },
};

// Vercel injects geo headers automatically; Cloudflare uses cf-ipcountry.
export function getUserMarket(req: NextRequest): UserMarket {
  const country  = req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "CA";
  const province = req.headers.get("x-vercel-ip-country-region") ?? "QC";
  const defaults = COUNTRY_DEFAULTS[country] ?? COUNTRY_DEFAULTS.CA;
  return { country, province, ...defaults };
}
