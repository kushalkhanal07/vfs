// The frontend and API live on different sites (e.g. netlify.app / onrender.com), so the
// session cookie must be SameSite=None, which browsers only accept together with Secure.
// clearCookie needs the same attributes, otherwise the browser ignores it cross-site.
export const sessionCookieOptions = {
  httpOnly: true,
  signed: true,
  sameSite: "none",
  secure: true,
};

export const SESSION_MAX_AGE = 60 * 1000 * 60 * 24 * 7;
