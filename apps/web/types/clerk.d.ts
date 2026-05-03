export {};

// Augmente les session claims Clerk pour que TypeScript connaisse nos metadata.
// Ces valeurs sont écrites via l'API Clerk côté serveur (webhook Stripe).
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      plan?: "FREE" | "PREMIUM" | "ENTERPRISE";
      role?: "admin";
    };
  }
}
