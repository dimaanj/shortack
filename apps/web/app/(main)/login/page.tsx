"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const TELEGRAM_BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? "ShortackBot";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const telegramContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !telegramContainerRef.current || telegramContainerRef.current.hasChildNodes()) return;
    const origin = APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", TELEGRAM_BOT_NAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-auth-url", `${origin}/api/auth/telegram/callback`);
    script.setAttribute("data-request-access", "write");
    telegramContainerRef.current.appendChild(script);
  }, [mounted]);

  useEffect(() => {
    const telegramToken = searchParams.get("telegram_token");
    const emailToken = searchParams.get("email_token");
    const callbackUrl = searchParams.get("callbackUrl") ?? "/trips";

    if (telegramToken) {
      setLoading("telegram");
      signIn("telegram", {
        telegramWidgetToken: telegramToken,
        callbackUrl,
        redirect: true,
      }).then((res) => {
        if (res?.error) {
          setError("Telegram sign-in failed");
          setLoading(null);
        }
      });
      return;
    }

    if (emailToken) {
      setLoading("email");
      signIn("email", {
        emailToken,
        callbackUrl,
        redirect: true,
      }).then((res) => {
        if (res?.error) {
          setError("Email sign-in failed");
          setLoading(null);
        }
      });
      return;
    }

    const err = searchParams.get("error");
    if (err === "invalid_telegram_auth") setError("Invalid Telegram login. Try again.");
    if (err === "invalid_token") setError("Invalid or expired link. Request a new one.");
  }, [searchParams]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading("email");
    setError(null);
    try {
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to send");
      }
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setLoading(null);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Signing you in...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "24rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Sign in</h1>
      {error && (
        <p style={{ color: "var(--color-error, #dc2626)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {mounted && <div id="telegram-login-button" ref={telegramContainerRef} />}

        {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/trips" })}
            style={{
              padding: "0.75rem 1rem",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              background: "var(--color-bg)",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Continue with Google
          </button>
        )}

        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

        {emailSent ? (
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Check your email and click the link to sign in.
          </p>
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              disabled={loading === "email"}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--color-accent)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
