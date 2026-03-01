"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

export function TgAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status !== "unauthenticated" || checked) return;
    const tg = typeof window !== "undefined" ? (window as unknown as { Telegram?: { WebApp?: { initData: string } } }).Telegram : undefined;
    const initData = tg?.WebApp?.initData;
    if (!initData) {
      setChecked(true);
      return;
    }
    setChecked(true);
    signIn("telegram", {
      initData,
      callbackUrl: "/tg/trips",
      redirect: true,
    });
  }, [status, checked]);

  const tg = typeof window !== "undefined" ? (window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram : undefined;
  if (typeof window !== "undefined" && !tg?.WebApp) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Open this app from Telegram to use it.</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Signing you in...</p>
      </div>
    );
  }

  return <>{children}</>;
}
