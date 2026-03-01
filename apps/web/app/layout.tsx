import type { Metadata } from "next";
import "./globals.css";
import { QueryClientProviderWrapper } from "./query-client";
import { SessionProvider } from "./_components/SessionProvider";

export const metadata: Metadata = {
  title: "Shortack",
  description: "Bus seat availability monitor",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  viewport: { width: "device-width", initialScale: 1 },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
