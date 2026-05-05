import { Resend } from "resend";
import type { ReactElement } from "react";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "TruePriceAI <notifications@truepricai.ca>";

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to:      string;
  subject: string;
  react:   ReactElement;
}): Promise<{ id?: string; error?: string }> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY absent — email non envoyé:", subject, "→", to);
    return { error: "Resend non configuré" };
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, react });
    if (error) {
      console.error("[email] Resend error:", error);
      return { error: error.message };
    }
    return { id: data?.id };
  } catch (err) {
    console.error("[email] exception:", err);
    return { error: String(err) };
  }
}
