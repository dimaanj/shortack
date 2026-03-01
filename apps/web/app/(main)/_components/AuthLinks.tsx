"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function AuthLinks() {
  const { data: session, status } = useSession();

  if (status === "loading") return <span style={{ fontSize: "0.875rem" }}>...</span>;
  if (session?.user) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{
          fontSize: "0.875rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          padding: 0,
        }}
      >
        Sign out
      </button>
    );
  }
  return (
    <Link href="/login" style={{ fontSize: "0.875rem" }}>
      Sign in
    </Link>
  );
}
