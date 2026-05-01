"use client";

import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", textDecoration: "none", letterSpacing: -0.5 }}>
          casha<span style={{ color: "var(--green)" }}>.</span>
        </Link>
        <Link href="/auth" style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", textDecoration: "none" }}>Sign in →</Link>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 640, padding: "40px 24px 60px" }}>
          {children}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        <Link href="/legal/privacy" style={{ fontSize: 11, color: "var(--muted)" }}>Privacy Policy</Link>
        <Link href="/legal/terms" style={{ fontSize: 11, color: "var(--muted)" }}>Terms of Service</Link>
        <Link href="/legal/cookies" style={{ fontSize: 11, color: "var(--muted)" }}>Cookie Policy</Link>
        <span style={{ fontSize: 11, color: "var(--faint)" }}>© 2025 casha.</span>
      </div>
    </div>
  );
}