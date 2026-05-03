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
  title: "TruePriceAI — Payez le vrai prix. Pas le prix canadien.",
  description:
    "Comparez les prix Canada vs USA en tenant compte du taux de change, des taxes et des frais de douane. En temps réel.",
  keywords: [
    "comparaison prix Canada USA",
    "vrai prix",
    "taux de change",
    "douanes Canada",
    "shopping Canada",
    "TruePriceAI",
  ],
  openGraph: {
    title: "TruePriceAI — Payez le vrai prix. Pas le prix canadien.",
    description:
      "Comparez les prix Canada vs USA en tenant compte du taux de change, des taxes et des frais de douane. En temps réel.",
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
