export const appConfig = {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173",
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:8080",
  secretKey: process.env.COOKIE_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeCurrency: process.env.STRIPE_CURRENCY || "usd",
  stripeStorageUpgradeAmount: Number(process.env.STRIPE_STORAGE_UPGRADE_AMOUNT || 499),
};
