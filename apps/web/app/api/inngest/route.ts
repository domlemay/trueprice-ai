import { serve } from "inngest/next";
import { inngest } from "@trueprice-ai/shared";
import { scrapeSearch }          from "@/inngest/scrape-search";
import { refreshExchangeRates }  from "@/inngest/jobs/refresh-exchange-rates";
import { checkPriceAlerts }      from "@/inngest/jobs/check-price-alerts";
import { checkStockAlerts }      from "@/inngest/jobs/check-stock-alerts";
import { resetSearchCounts }     from "@/inngest/jobs/reset-search-counts";
import { expireTrialPlans }      from "@/inngest/jobs/expire-trial-plans";
import { cleanExpiredSearches }  from "@/inngest/jobs/clean-expired-searches";
import { gdprDeleteUsers }       from "@/inngest/jobs/gdpr-delete-users";
import { sendTrialEndingEmails } from "@/inngest/jobs/send-trial-ending-emails";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    scrapeSearch,
    refreshExchangeRates,
    checkPriceAlerts,
    checkStockAlerts,
    resetSearchCounts,
    expireTrialPlans,
    cleanExpiredSearches,
    gdprDeleteUsers,
    sendTrialEndingEmails,
  ],
});
