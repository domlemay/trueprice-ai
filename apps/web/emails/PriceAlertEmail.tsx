import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

type Props = {
  userName:       string;
  productName:    string;
  targetPrice:    number;
  triggeredPrice: number;
  currency:       string;
  marketplace:    string;
  productUrl?:    string;
};

export function PriceAlertEmail({
  userName,
  productName,
  targetPrice,
  triggeredPrice,
  currency,
  marketplace,
  productUrl,
}: Props) {
  const preview = `Alerte prix — ${productName} à ${triggeredPrice} ${currency}`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>TruePrice<span style={{ color: "#00D4C8" }}>AI</span></Heading>
          <Heading style={h2}>Votre alerte prix a été déclenchée</Heading>

          <Text style={text}>Bonjour {userName},</Text>
          <Text style={text}>
            Le prix de <strong>{productName}</strong> sur <strong>{marketplace}</strong> a atteint
            votre seuil cible.
          </Text>

          <Section style={priceBox}>
            <Text style={priceLabel}>Prix cible</Text>
            <Text style={priceValue}>{targetPrice.toLocaleString("fr-CA")} {currency}</Text>
            <Hr style={divider} />
            <Text style={priceLabel}>Prix actuel (vrai coût total)</Text>
            <Text style={{ ...priceValue, color: "#00D4C8" }}>
              {triggeredPrice.toLocaleString("fr-CA")} {currency}
            </Text>
          </Section>

          {productUrl && (
            <Section style={{ textAlign: "center", margin: "24px 0" }}>
              <Button href={productUrl} style={button}>
                Voir l'offre →
              </Button>
            </Section>
          )}

          <Text style={footer}>
            Alerte désactivée automatiquement. Vous pouvez en créer une nouvelle depuis votre tableau de bord.
          </Text>
          <Text style={footer}>
            TruePriceAI — truepricai.ca
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#0A1628", fontFamily: "'DM Sans', sans-serif" };
const container = { maxWidth: "560px", margin: "0 auto", padding: "32px 24px" };
const h1 = { color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0 0 32px" };
const h2 = { color: "#ffffff", fontSize: "22px", fontWeight: "600", margin: "0 0 16px" };
const text = { color: "#94a3b8", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" };
const priceBox = {
  backgroundColor: "#132035",
  border: "1px solid rgba(0,212,200,0.15)",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "20px 0",
};
const priceLabel = { color: "#64748b", fontSize: "12px", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "0 0 4px" };
const priceValue = { color: "#ffffff", fontSize: "24px", fontWeight: "700", margin: "0 0 16px" };
const divider  = { borderColor: "rgba(0,212,200,0.1)", margin: "16px 0" };
const button   = {
  backgroundColor: "#00D4C8",
  color: "#0A1628",
  borderRadius: "8px",
  padding: "12px 28px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
};
const footer = { color: "#475569", fontSize: "12px", margin: "8px 0 0" };

export default PriceAlertEmail;
