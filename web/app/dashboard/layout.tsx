"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";

var NAV = [
  {
    name: "Overview",
    href: "/dashboard/overview",
    icon: function (active: boolean) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--green)" : "var(--muted)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    },
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: function (active: boolean) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--green)" : "var(--muted)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    icon: function (active: boolean) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--green)" : "var(--muted)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    },
  },
  {
    name: "Accounts",
    href: "/dashboard/accounts",
    icon: function (active: boolean) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--green)" : "var(--muted)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    },
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  var pathname = usePathname();
  var [showMenu, setShowMenu] = useState(false);
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Desktop Sidebar */}
      <aside style={{ width: 200, borderRight: "1px solid var(--border)", padding: "20px 12px", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 30, background: "var(--bg)" }}
        className="sidebar">

        {/* Logo */}
        <div style={{ padding: "0 8px", marginBottom: 28 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: -0.3 }}>casha<span style={{ color: "var(--green)" }}>.</span></p>
          <p style={{ fontSize: 9, color: "var(--faint)", margin: "1px 0 0 0", fontWeight: 500, letterSpacing: 0.04 }}>YOUR MONEY, CLEAR</p>
        </div>

        {/* Nav Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {NAV.map(function (item) {
            var active = pathname === item.href || (item.href === "/dashboard/overview" && pathname === "/dashboard");
            return (
              <Link key={item.href} href={item.href}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, background: active ? "var(--green-dim)" : "transparent", color: active ? "var(--green)" : "var(--muted)", fontSize: 12, fontWeight: active ? 600 : 500, transition: "background 100ms ease, color 100ms ease", textDecoration: "none" }}
                onMouseEnter={function (e) { if (!active) { e.currentTarget.style.background = "var(--card-hover)"; e.currentTarget.style.color = "var(--text)"; } }}
                onMouseLeave={function (e) { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; } }}>
                {item.icon(active)}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Avatar + Menu */}
        <div style={{ position: "relative", marginTop: 8 }}>
          <button onClick={function () { setShowMenu(!showMenu); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", width: "100%", transition: "background 100ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card-hover)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--muted)", flexShrink: 0 }}>{initial}</div>
            <span style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>{email ? email.split("@")[0] : "User"}</span>
          </button>

          {showMenu ? (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={function () { setShowMenu(false); }} />
              <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 4, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 4, zIndex: 50, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
                <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
                </div>
                <button onClick={logout}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 5, background: "transparent", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", width: "100%", textAlign: "left", transition: "background 100ms ease" }}
                  onMouseEnter={function (e) { e.currentTarget.style.background = "var(--red-dim)"; e.currentTarget.style.color = "var(--red)"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  <span>Sign out</span>
                </button>
              </div>
            </>
          ) : null}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 200, minHeight: "100vh", paddingBottom: 64 }}
        className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--bg)", borderTop: "1px solid var(--border)", display: "none", zIndex: 30, padding: "6px 0 env(safe-area-inset-bottom, 6px)" }}
        className="bottom-tabs">
        <div style={{ display: "flex" }}>
          {NAV.map(function (item) {
            var active = pathname === item.href || (item.href === "/dashboard/overview" && pathname === "/dashboard");
            return (
              <Link key={item.href} href={item.href}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", textDecoration: "none", transition: "color 100ms ease" }}>
                {item.icon(active)}
                <span style={{ fontSize: 9, fontWeight: active ? 600 : 500, color: active ? "var(--green)" : "var(--maintained)", transition: "color 100ms ease" }}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .bottom-tabs { display: block !important; }
        }
        @media (min-width: 769px) {
          .bottom-tabs { display: none !important; }
        }
      `}</style>
    </div>
  );
}