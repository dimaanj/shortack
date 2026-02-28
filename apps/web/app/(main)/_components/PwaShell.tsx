"use client";

import { useState, useEffect } from "react";

const INSTALL_DISMISSED_KEY = "shortack-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<{ outcome: string }> };

export function PwaShell({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || swRegistered) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => setSwRegistered(true))
      .catch((err) => console.warn("[PWA] SW registration failed:", err));
  }, [swRegistered]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      try {
        const dismissed = sessionStorage.getItem(INSTALL_DISMISSED_KEY);
        if (!dismissed) setShowInstallBanner(true);
      } catch {
        setShowInstallBanner(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIos) {
      try {
        const dismissed = sessionStorage.getItem(INSTALL_DISMISSED_KEY);
        if (!dismissed) setShowInstallBanner(true);
      } catch {
        setShowInstallBanner(true);
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    const { outcome } = await installPrompt.prompt();
    if (outcome === "accepted") setShowInstallBanner(false);
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    try {
      sessionStorage.setItem(INSTALL_DISMISSED_KEY, "1");
    } catch {}
  };

  return (
    <>
      {!isOnline && (
        <div
          role="status"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "#b45309",
            color: "#fff",
            padding: "0.5rem 1rem",
            textAlign: "center",
            fontSize: "0.875rem",
          }}
        >
          You&apos;re offline. Showing cached data when available.
        </div>
      )}
      {showInstallBanner && (installPrompt || /iPad|iPhone|Mac/.test(navigator.userAgent)) && (
        <div
          role="dialog"
          aria-label="Install app"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 51,
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.875rem", color: "var(--color-text)" }}>
            {installPrompt ? "Add Shortack to your home screen for quick access." : "Install: use Share → Add to Home Screen (iOS) or menu → Install (Chrome)."}
          </span>
          <span style={{ display: "flex", gap: "0.5rem" }}>
            {installPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Add to Home Screen
              </button>
            )}
            <button
              type="button"
              onClick={dismissInstall}
              style={{
                padding: "0.5rem 0.75rem",
                background: "transparent",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Not now
            </button>
          </span>
        </div>
      )}
      {children}
    </>
  );
}
