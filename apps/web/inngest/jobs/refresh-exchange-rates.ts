import { inngest } from "@trueprice-ai/shared";
import { getExchangeRate } from "@/lib/exchange";

const PAIRS = [
  ["USD", "CAD"],
  ["CAD", "USD"],
  ["EUR", "CAD"],
  ["EUR", "USD"],
  ["GBP", "CAD"],
  ["GBP", "USD"],
] as const;

export const refreshExchangeRates = inngest.createFunction(
  {
    id: "refresh-exchange-rates",
    triggers: [{ cron: "0 * * * *" }], // toutes les heures
  },
  async ({ step }) => {
    const results = await step.run("fetch-rates", async () => {
      const fetched: string[] = [];
      const errors: string[] = [];

      for (const [from, to] of PAIRS) {
        try {
          await getExchangeRate(from, to);
          fetched.push(`${from}/${to}`);
        } catch (err) {
          errors.push(`${from}/${to}: ${err}`);
          console.error(`[refresh-exchange-rates] ${from}/${to} failed:`, err);
        }
      }

      return { fetched, errors };
    });

    return results;
  },
);
