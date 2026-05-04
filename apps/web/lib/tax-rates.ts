// Taux officiels mai 2026 — mettre à jour manuellement si modification législative

export type TaxInfo = {
  label: string;
  gst?: number;
  pst?: number;
  hst?: number;
  total: number;
};

export const CA_PROVINCE_RATES: Record<string, TaxInfo> = {
  QC: { label: "GST+TVQ",  gst: 0.05,  pst: 0.09975, total: 0.14975 },
  ON: { label: "HST",       hst: 0.13,                 total: 0.13    },
  BC: { label: "GST+PST",   gst: 0.05,  pst: 0.07,    total: 0.12    },
  AB: { label: "GST",       gst: 0.05,                 total: 0.05    },
  SK: { label: "GST+PST",   gst: 0.05,  pst: 0.06,    total: 0.11    },
  MB: { label: "GST+PST",   gst: 0.05,  pst: 0.07,    total: 0.12    },
  NB: { label: "HST",       hst: 0.15,                 total: 0.15    },
  NS: { label: "HST",       hst: 0.15,                 total: 0.15    },
  NL: { label: "HST",       hst: 0.15,                 total: 0.15    },
  PE: { label: "HST",       hst: 0.15,                 total: 0.15    },
  NT: { label: "GST",       gst: 0.05,                 total: 0.05    },
  NU: { label: "GST",       gst: 0.05,                 total: 0.05    },
  YT: { label: "GST",       gst: 0.05,                 total: 0.05    },
};

const US_STATE_RATES: Record<string, number> = {
  AL: 0.04,    AK: 0,       AZ: 0.056,  AR: 0.065,  CA: 0.0725,
  CO: 0.029,   CT: 0.0635,  DE: 0,      FL: 0.06,   GA: 0.04,
  HI: 0.04,    ID: 0.06,    IL: 0.0625, IN: 0.07,   IA: 0.06,
  KS: 0.065,   KY: 0.06,    LA: 0.0445, ME: 0.055,  MD: 0.06,
  MA: 0.0625,  MI: 0.06,    MN: 0.06875,MS: 0.07,   MO: 0.04225,
  MT: 0,       NE: 0.055,   NV: 0.0685, NH: 0,      NJ: 0.06625,
  NM: 0.05125, NY: 0.04,    NC: 0.0475, ND: 0.05,   OH: 0.0575,
  OK: 0.045,   OR: 0,       PA: 0.06,   RI: 0.07,   SC: 0.06,
  SD: 0.045,   TN: 0.07,    TX: 0.0625, UT: 0.0485, VT: 0.06,
  VA: 0.053,   WA: 0.065,   WV: 0.06,   WI: 0.05,   WY: 0.04,
  DC: 0.06,
};

const EU_VAT: Record<string, number> = {
  FR: 0.20, DE: 0.19, IT: 0.22, ES: 0.21, NL: 0.21,
  BE: 0.21, AT: 0.20, PT: 0.23, PL: 0.23, SE: 0.25,
  DK: 0.25, FI: 0.255, GB: 0.20,
};

export function getTaxRate(country: string, province: string): { rate: number; label: string } {
  if (country === "CA") {
    const info = CA_PROVINCE_RATES[province.toUpperCase()];
    if (info) return { rate: info.total, label: info.label };
    return { rate: 0.05, label: "GST" };
  }
  if (country === "US") {
    const rate = US_STATE_RATES[province.toUpperCase()] ?? 0;
    return { rate, label: "Sales Tax" };
  }
  const rate = EU_VAT[country.toUpperCase()] ?? 0;
  return { rate, label: "TVA/VAT" };
}
