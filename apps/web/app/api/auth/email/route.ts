import { NextRequest, NextResponse } from "next/server";
import { createEmailToken } from "@/lib/firestore/authTokens";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email =
    body && typeof body === "object" && "email" in body && typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email
      : null;
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const { token } = await createEmailToken(email);
    const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;
    const verifyUrl = `${baseUrl}/api/auth/email/verify?token=${encodeURIComponent(token)}`;
    await sendMagicLinkEmail(email.trim(), verifyUrl);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

async function sendMagicLinkEmail(to: string, link: string): Promise<void> {
  const from = process.env.EMAIL_FROM;
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Sign in to Shortack",
        html: `Click to sign in: <a href="${link}">${link}</a>. Link expires in 1 hour.`,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API error: ${res.status} ${err}`);
    }
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[dev] Magic link for", to, ":", link);
    return;
  }
  throw new Error("Email not configured: set EMAIL_FROM and RESEND_API_KEY");
}
