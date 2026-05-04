import { SignUp } from "@clerk/nextjs";
import type { Appearance } from "@clerk/types";

const appearance: Appearance = {
  variables: {
    colorPrimary: "#00D4C8",
    colorBackground: "#112040",
    colorInputBackground: "#0A1628",
    colorInputText: "#F8FAFC",
    colorText: "#F8FAFC",
    colorTextSecondary: "#94A3B8",
    colorDanger: "#E53935",
    colorSuccess: "#2D9E5F",
    borderRadius: "0.75rem",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "15px",
  },
  elements: {
    card: {
      boxShadow: "none",
      border: "1px solid rgba(0, 212, 200, 0.15)",
      backgroundColor: "#112040",
    },
    headerTitle: { color: "#F8FAFC", fontFamily: "Syne, sans-serif" },
    headerSubtitle: { color: "#94A3B8" },
    formButtonPrimary: {
      backgroundColor: "#00D4C8",
      color: "#0A1628",
      fontWeight: "600",
    },
    footerActionLink: { color: "#00D4C8" },
    formFieldInput: {
      backgroundColor: "#0A1628",
      borderColor: "rgba(0, 212, 200, 0.2)",
      color: "#F8FAFC",
    },
    socialButtonsBlockButton: {
      border: "1px solid rgba(0, 212, 200, 0.2)",
      backgroundColor: "#0A1628",
      color: "#F8FAFC",
    },
    dividerLine: { backgroundColor: "rgba(0, 212, 200, 0.1)" },
    dividerText: { color: "#64748B" },
  },
};

export default function SignUpPage() {
  return <SignUp appearance={appearance} forceRedirectUrl="/dashboard" />;
}
