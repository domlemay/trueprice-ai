import { serve } from "inngest/next";
import { inngest } from "@trueprice-ai/shared";
import { scrapeSearch } from "@/inngest/scrape-search";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scrapeSearch],
});
