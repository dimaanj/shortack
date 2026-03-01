import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/firestore/authTokens";

const REDIRECT_LOGIN = "/login";
const REDIRECT_SUCCESS = "/trips";

/**
 * GET /api/auth/email/verify?token=...
 * Verifies token, then redirects to /login?email_token=JWT for client to complete signIn.
 * We don't set Auth.js session from server here; we pass a one-time token to the login page.
 * But Auth.js Credentials "email" expects the Firestore token, not a JWT. So we have two options:
 * A) Redirect to /login?email_verify_token=TOKEN (the Firestore token); login page calls signIn("email", { emailToken: TOKEN }). But then the token is in the URL and is consumed by verifyEmailToken - we already consumed it in verify flow. So we need to NOT consume in verify, and instead redirect with the same token so the client can send it to signIn. Then signIn authorize() will call verifyEmailToken which consumes. So: verify route should NOT verify/consume - just redirect to /login?email_token=TOKEN. Then login page calls signIn("email", { emailToken: TOKEN }). authorize() calls verifyEmailToken(token), gets userId, returns user. Token is consumed there.
 * So verify route: get token from query, redirect to /login?email_token=TOKEN (same token). Don't call verifyEmailToken in the verify route - let the client pass it to signIn and authorize() will verify and consume.
 * Wait, that's insecure - anyone with the link can use it. The link is already a secret. So when user clicks the link we land on verify route. We could verify here, create a short-lived JWT with userId, redirect to /login?email_token=JWT. Then signIn("email", { emailToken: JWT }) and in authorize we verify the JWT and return user. That way the Firestore token is consumed once in verify route and we pass a JWT to the client. So we need an email JWT similar to telegram widget token. Let me add createEmailSignInToken(userId) that creates a JWT with sub: userId, exp: 5 min. Verify route: verifyEmailToken(token) -> userId, createEmailSignInToken(userId), redirect to /login?email_token=JWT. Credentials provider "email" in authorize: decode email_token JWT, get userId, return user. So we need to store email tokens in a way that verify consumes them, then we issue our own JWT for the signIn call.
 * Actually re-reading the flow: createEmailToken creates a token in Firestore. User gets email with link to /api/auth/email/verify?token=XXX. When they click, we need to verify XXX (check Firestore, check expiry), consume it, then create session. We can't create Auth.js session from server without the client. So we redirect to /login?email_token=XXX. If we pass the same Firestore token XXX, then the client will call signIn("email", { emailToken: XXX }). In authorize we call verifyEmailToken(XXX) which will find the doc, check expiry, return userId, delete doc. So the token is only valid once. So verify route should just redirect to /login?email_token=TOKEN (the same token from the link). We don't need to verify in the verify route - we redirect with the token and the login page sends it to signIn. authorize() will verify and consume. So verify route is just: read token from query, redirect to /login?email_token=token. If token is missing, redirect to /login?error=invalid_token.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const origin = request.nextUrl.origin;
  const loginUrl = new URL(REDIRECT_LOGIN, origin);
  if (!token) {
    loginUrl.searchParams.set("error", "invalid_token");
    return NextResponse.redirect(loginUrl);
  }
  loginUrl.searchParams.set("email_token", token);
  const successUrl = new URL(REDIRECT_SUCCESS, origin);
  loginUrl.searchParams.set("callbackUrl", successUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
