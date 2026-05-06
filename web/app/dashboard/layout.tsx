"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";

var NAV = [
  {
    name: "Overview",
    href: "/dashboard/overview",
    icon: function (a: boolean) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--green)" : "var(--muted)"} strokeWidth={a ? "2" : "1.6"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    },
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: function (a: boolean) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--green)" : "var(--muted)"} strokeWidth={a ? "2" : "1.6"} strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      );
    },
  },
  {
    name: "Budget",
    href: "/dashboard/budget",
    icon: function (a: boolean) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--green)" : "var(--muted)"} strokeWidth={a ? "2" : "1.6"} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    },
  },
  {
    name: "Accounts",
    href: "/dashboard/accounts",
    icon: function (a: boolean) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--green)" : "var(--muted)"} strokeWidth={a ? "2" : "1.6"} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    },
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  var pathname = usePathname();
  var [menu, setMenu] = useState(false);
  var [email, setEmail] = useState("");

  useEffect(function () {
    supabase.auth.getUser().then(function ({ data }) {
      if (data?.user) setEmail(data.user.email || "");
    });
  }, []);

  var logout = async function () {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  var initial = email ? email[0].toUpperCase() : "U";
  var isActive = function (href: string) {
    if (href === "/dashboard/overview") {
      return pathname === "/dashboard" || pathname === "/dashboard/overview";
    }
    return pathname === href;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* SIDEBAR */}
      <aside className="d-sidebar" style={{
        width: 240,
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        padding: "28px 16px",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 30,
      }}>

        <div style={{ padding: "0 8px", marginBottom: 36 }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: -0.5 }}>
            casha<span style={{ color: "var(--green)" }}>.</span>
          </p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map(function (item) {
            var a = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: a ? "var(--green-dim)" : "transparent",
                  color: a ? "var(--green-soft)" : "var(--muted)",
                  fontSize: 14,
                  fontWeight: a ? 600 : 500,
                  textDecoration: "none",
                  transition: "all 200ms ease",
                }}
                onMouseEnter={function (e) { if (!a) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
                onMouseLeave={function (e) { if (!a) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; } }}
              >
                {item.icon(a)}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ position: "relative", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={function () { setMenu(!menu); }}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 12, background: "transparent", border: "none", cursor: "pointer", width: "100%", transition: "background 200ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "var(--surface)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "var(--muted)", flexShrink: 0,
            }}>{initial}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left", fontFamily: "inherit" }}>
              {email ? email.split("@")[0] : "User"}
            </span>
          </button>

          {menu ? (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={function () { setMenu(false); }} />
              <div style={{
                position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 6,
                background: "var(--card)", border: "1px solid var(--border-light)", borderRadius: 14,
                padding: 6, zIndex: 50,
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                animation: "fadeIn 150ms ease",
              }}>
                <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
                </div>
                <button onClick={logout}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10,
                    background: "transparent", border: "none", color: "var(--muted)", fontSize: 13,
                    cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit",
                    transition: "all 200ms ease",
                  }}
                  onMouseEnter={function (e) { e.currentTarget.style.background = "var(--red-dim)"; e.currentTarget.style.color = "var(--red)"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Sign out
                </button>
              </div>
            </>
          ) : null}
        </div>
      </aside>

      {/* MAIN */}
      <main className="d-main" style={{
        flex: 1,
        marginLeft: 240,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}>
        <div style={{ width: "100%", maxWidth: 800, padding: "28px 48px 48px" }}>
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="d-bottom" style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        display: "none", zIndex: 30,
        paddingBottom: "env(safe-area-inset-bottom, 4px)",
      }}>
        <div style={{ display: "flex", padding: "8px 0 6px" }}>
          {NAV.map(function (item) {
            var a = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "6px 0", textDecoration: "none",
                transition: "all 200ms ease",
              }}>
                <div style={{
                  padding: "6px 20px", borderRadius: 16,
                  background: a ? "var(--green-dim)" : "transparent",
                  transition: "all 200ms ease",
                }}>
                  {item.icon(a)}
                </div>
                <span style={{ fontSize: 10, fontWeight: a ? 600 : 500, color: a ? "var(--green-soft)" : "var(--muted)" }}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .d-sidebar { display: none !important; }
          .d-main { margin-left: 0 !important; }
          .d-main > div { padding: 20px 16px 80px !important; max-width: 100% !important; }
          .d-bottom { display: block !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .d-sidebar { width: 76px !important; padding: 28px 8px !important; }
          .d-sidebar > div:first-child { padding: 0 4px !important; }
          .d-sidebar > div:first-child > p { font-size: 16px !important; }
          .d-sidebar nav a > span { display: none; }
          .d-sidebar nav a { justify-content: center; padding: 12px !important; }
          .d-sidebar > div:last-child button > span { display: none; }
          .d-main { margin-left: 76px !important; }
          .d-main > div { padding: 24px 24px 48px !important; max-width: 100% !important; }
        }
        @media (min-width: 769px) {
          .d-bottom { display: none !important; }
        }
        @media (min-width: 1400px) {
          .d-main > div { max-width: 860px !important; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}