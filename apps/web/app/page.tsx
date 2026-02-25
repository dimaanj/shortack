import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Shortack</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Check bus seat availability for your trip
      </p>
      <Link
        href="/trips"
        style={{
          display: "inline-block",
          padding: "0.75rem 1.5rem",
          background: "var(--color-accent)",
          color: "white",
          borderRadius: "8px",
          fontWeight: 500,
        }}
      >
        Check availability
      </Link>
    </main>
  );
}
