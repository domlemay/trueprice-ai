import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  Show,
} from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
    <html lang="fr-CA" className={inter.variable}>
      <body className={inter.className}>
        <ClerkProvider afterSignOutUrl="/" signInUrl="/sign-in" signUpUrl="/sign-up">
          <Show when="signed-out">
            <span className="sr-only">
              <SignInButton />
              <SignUpButton />
            </span>
          </Show>
          <Show when="signed-in">
            <span className="sr-only">
              <UserButton />
            </span>
          </Show>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
