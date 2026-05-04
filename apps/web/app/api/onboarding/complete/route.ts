import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, completeOnboarding } from "@trueprice-ai/db";
import { headers } from "next/headers";

const POLICY_VERSION = "1.0.0";

type Body = {
  preferredCurrency: string;
  preferredLocale: string;
  timezone: string;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  notifications: {
    price_alert_email: boolean;
    price_alert_inapp: boolean;
    stock_alert_email: boolean;
    report_weekly_email: boolean;
    changelog_inapp: boolean;
  };
  consentAnalytics: boolean;
  consentMarketing: boolean;
};

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await completeOnboarding(user.id, {
    preferredCurrency: body.preferredCurrency,
    preferredLocale:   body.preferredLocale,
    timezone:          body.timezone,
    address:           body.address,
    notificationUpdates: [
      { type: "price_alert",   channel: "EMAIL",  enabled: body.notifications.price_alert_email },
      { type: "price_alert",   channel: "IN_APP", enabled: body.notifications.price_alert_inapp },
      { type: "stock_alert",   channel: "EMAIL",  enabled: body.notifications.stock_alert_email },
      { type: "report_weekly", channel: "EMAIL",  enabled: body.notifications.report_weekly_email },
      { type: "changelog",     channel: "IN_APP", enabled: body.notifications.changelog_inapp },
    ],
    consents: [
      { type: "ANALYTICS", granted: body.consentAnalytics, version: POLICY_VERSION, ipAddress: ip },
      { type: "MARKETING", granted: body.consentMarketing, version: POLICY_VERSION, ipAddress: ip },
    ],
  });

  return NextResponse.json({ ok: true });
}
