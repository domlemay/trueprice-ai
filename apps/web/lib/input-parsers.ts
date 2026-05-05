import type { InputType } from "@prisma/client";

export interface ParsedInput {
  type: InputType;
  normalized: string;
  raw: string;
  /** ASIN extrait d'une URL Amazon (si type = URL pointant vers Amazon) */
  extractedAsin?: string;
}

// B suivi de 9 caractères alphanumériques (format Amazon ASIN)
const ASIN_RE = /^B[0-9A-Z]{9}$/i;
// Code-barres UPC-A (12 chiffres) ou EAN-13 (13 chiffres)
const UPC_RE = /^[0-9]{12,13}$/;
// URL directe
const URL_RE = /^https?:\/\//i;
// ASIN embarqué dans une URL Amazon (/dp/B0XXXXXXXXX ou /gp/product/...)
const AMAZON_ASIN_IN_URL_RE = /\/(?:dp|gp\/product)\/([B][0-9A-Z]{9})/i;

export function parseSearchInput(raw: string): ParsedInput {
  const trimmed = raw.trim();

  if (URL_RE.test(trimmed)) {
    const asinMatch = trimmed.match(AMAZON_ASIN_IN_URL_RE);
    return {
      type: "URL",
      normalized: trimmed,
      raw,
      extractedAsin: asinMatch?.[1]?.toUpperCase(),
    };
  }

  if (ASIN_RE.test(trimmed)) {
    return { type: "ASIN", normalized: trimmed.toUpperCase(), raw };
  }

  if (UPC_RE.test(trimmed)) {
    return { type: "UPC", normalized: trimmed, raw };
  }

  return { type: "KEYWORD", normalized: trimmed, raw };
}
