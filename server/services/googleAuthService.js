import { OAuth2Client } from "google-auth-library";
import { appConfig } from "../config/appConfig.js";

const client = new OAuth2Client({
  clientId: appConfig.googleClientId,
  clientSecret: appConfig.googleClientSecret,
  redirectUri: appConfig.googleRedirectUri,
});

export async function verifyIdToken(idToken) {
  const loginTicket = await client.verifyIdToken({
    idToken,
    audience: appConfig.googleClientId,
  });

  const userData = loginTicket.getPayload();
  return userData;
}
