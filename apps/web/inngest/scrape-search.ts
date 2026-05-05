import { inngest } from "@trueprice-ai/shared";
import { runScrapePipeline } from "@/lib/scrape-pipeline";

type Geo = { country: string; province: string; currency: string };

export const scrapeSearch = inngest.createFunction(
  { id: "scrape/price-search", retries: 3, triggers: [{ event: "scrape/price-search" }] },
  async ({ event, step }) => {
    const { searchId, query, geo, marketplaceSlugs } = event.data as {
      searchId:          string;
      query:             string;
      geo:               Geo;
      marketplaceSlugs?: string[];
    };

    return step.run("run-pipeline", () => runScrapePipeline({ searchId, query, geo, marketplaceSlugs }));
  },
);
