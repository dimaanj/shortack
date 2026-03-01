import Script from "next/script";
import Link from "next/link";
import { TgAuthProvider } from "./_components/TgAuthProvider";

export default function TgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TgAuthProvider>
        <div>
          <header
            style={{
              borderBottom: "1px solid var(--color-border)",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Link href="/tg/trips" style={{ fontSize: "0.875rem" }}>
              Trips
            </Link>
            <Link href="/tg/monitors" style={{ fontSize: "0.875rem" }}>
              Monitors
            </Link>
          </header>
          <main style={{ padding: "1rem" }}>{children}</main>
        </div>
      </TgAuthProvider>
    </>
  );
}
