import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

type Props = {
  userName:    string;
  trialEndsAt: string; // ex: "7 mai 2026"
  upgradeUrl:  string;
};

export function TrialEndingEmail({ userName, trialEndsAt, upgradeUrl }: Props) {
  const preview = `Votre essai PREMIUM se termine le ${trialEndsAt}`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>TruePrice<span style={{ color: "#00D4C8" }}>AI</span></Heading>
          <Heading style={h2}>Votre essai se termine bientôt</Heading>

          <Text style={text}>Bonjour {userName},</Text>
          <Text style={text}>
            Votre période d'essai PREMIUM se termine le <strong>{trialEndsAt}</strong>.
            Après cette date, votre compte passera automatiquement au plan GRATUIT.
          </Text>

          <Section style={featureBox}>
            <Text style={featureTitle}>Ce que vous perdrez avec le plan GRATUIT :</Text>
            <Text style={featureItem}>✗ Historique résultats limité à 7 jours (vs 90)</Text>
            <Text style={featureItem}>✗ Seulement 10 recherches par mois (vs 200)</Text>
            <Text style={featureItem}>✗ Accès limité aux marketplaces</Text>
            <Text style={featureItem}>✗ Alertes prix limitées à 3</Text>
          </Section>

          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button href={upgradeUrl} style={button}>
              Conserver PREMIUM →
            </Button>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>
            Si vous avez des questions, répondez à cet email ou visitez notre{" "}
            <a href="https://truepricai.ca/dashboard/support" style={{ color: "#00D4C8" }}>
              centre d'aide
            </a>.
          </Text>
          <Text style={footer}>TruePriceAI — truepricai.ca</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body        = { backgroundColor: "#0A1628", fontFamily: "'DM Sans', sans-serif" };
const container   = { maxWidth: "560px", margin: "0 auto", padding: "32px 24px" };
const h1          = { color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0 0 32px" };
const h2          = { color: "#ffffff", fontSize: "22px", fontWeight: "600", margin: "0 0 16px" };
const text        = { color: "#94a3b8", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" };
const featureBox  = {
  backgroundColor: "#132035",
  border: "1px solid rgba(0,212,200,0.15)",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "20px 0",
};
const featureTitle = { color: "#ffffff", fontSize: "13px", fontWeight: "600", margin: "0 0 12px" };
const featureItem  = { color: "#94a3b8", fontSize: "14px", margin: "0 0 6px" };
const button       = {
  backgroundColor: "#00D4C8",
  color: "#0A1628",
  borderRadius: "8px",
  padding: "12px 28px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
};
const divider = { borderColor: "rgba(0,212,200,0.1)", margin: "24px 0 16px" };
const footer  = { color: "#475569", fontSize: "12px", margin: "8px 0 0" };

export default TrialEndingEmail;
