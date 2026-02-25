import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          padding: "1rem 2rem",
        }}
      >
        <Link href="/" style={{ fontWeight: 600 }}>
          Shortack
        </Link>
      </header>
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}
