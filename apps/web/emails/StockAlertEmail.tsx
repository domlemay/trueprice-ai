import {
  Body, Button, Container, Head, Heading,
  Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

type Props = {
  userName:    string;
  productName: string;
  marketplace: string;
  productUrl?: string;
};

export function StockAlertEmail({ userName, productName, marketplace, productUrl }: Props) {
  const preview = `${productName} est de retour en stock sur ${marketplace}`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>TruePrice<span style={{ color: "#00D4C8" }}>AI</span></Heading>
          <Heading style={h2}>Retour en stock détecté</Heading>

          <Text style={text}>Bonjour {userName},</Text>
          <Text style={text}>
            <strong>{productName}</strong> est de nouveau disponible sur{" "}
            <strong>{marketplace}</strong>.
          </Text>

          {productUrl && (
            <Section style={{ textAlign: "center", margin: "28px 0" }}>
              <Button href={productUrl} style={button}>
                Voir le produit →
              </Button>
            </Section>
          )}

          <Text style={footer}>
            Alerte désactivée automatiquement. Vous pouvez en créer une nouvelle depuis votre tableau de bord.
          </Text>
          <Text style={footer}>TruePriceAI — truepricai.ca</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body      = { backgroundColor: "#0A1628", fontFamily: "'DM Sans', sans-serif" };
const container = { maxWidth: "560px", margin: "0 auto", padding: "32px 24px" };
const h1        = { color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0 0 32px" };
const h2        = { color: "#ffffff", fontSize: "22px", fontWeight: "600", margin: "0 0 16px" };
const text      = { color: "#94a3b8", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" };
const button    = {
  backgroundColor: "#00D4C8",
  color: "#0A1628",
  borderRadius: "8px",
  padding: "12px 28px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
};
const footer    = { color: "#475569", fontSize: "12px", margin: "8px 0 0" };

export default StockAlertEmail;
