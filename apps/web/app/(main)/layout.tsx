import Link from "next/link";
import { PwaShell } from "./_components/PwaShell";
import { AuthLinks } from "./_components/AuthLinks";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PwaShell>
    <div>
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <Link href="/" style={{ fontWeight: 600 }}>
          Shortack
        </Link>
        <Link href="/trips" style={{ fontSize: "0.875rem" }}>
          Trips
        </Link>
        <Link href="/monitors" style={{ fontSize: "0.875rem" }}>
          Monitors
        </Link>
        {process.env.NODE_ENV !== "production" && (
          <Link href="/dev/monitors-queue" style={{ fontSize: "0.875rem" }}>
            Dev: Monitors &amp; Queue
          </Link>
        )}
        <span style={{ marginLeft: "auto" }}>
          <AuthLinks />
        </span>
      </header>
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
    </PwaShell>
  );
}
