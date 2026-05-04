import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TruePriceAI — Comparez les vrais coûts. Trouvez le meilleur prix.",
  description:
    "Calculez le vrai coût total de n'importe quel produit sur tous les marchés — taux de change, taxes locales, droits de douane et livraison inclus. En temps réel.",
  keywords: [
    "comparaison prix internationale",
    "vrai coût total",
    "taux de change",
    "droits de douane",
    "meilleur prix",
    "taxes locales",
    "shopping international",
    "TruePriceAI",
  ],
  openGraph: {
    title: "TruePriceAI — Comparez les vrais coûts. Trouvez le meilleur prix.",
    description:
      "Calculez le vrai coût total de n'importe quel produit sur tous les marchés — taux de change, taxes locales, droits de douane et livraison inclus. En temps réel.",
    type: "website",
    locale: "fr_CA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr-CA" suppressHydrationWarning>
      <body>
        <ClerkProvider afterSignOutUrl="/" signInUrl="/sign-in" signUpUrl="/sign-up">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
