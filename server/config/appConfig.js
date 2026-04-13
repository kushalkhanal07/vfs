export const appConfig = {
  googleClientId:
    process.env.GOOGLE_CLIENT_ID ||
    "376617258098-ble35vrhgu2n55r2sodhrv2a558kdsl1.apps.googleusercontent.com",
  googleClientSecret:
    process.env.GOOGLE_CLIENT_SECRET || "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173",
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  secretKey: process.env.COOKIE_SECRET || "ProCodrr-storageApp-123$#",
};
