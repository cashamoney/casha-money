"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";

var NAV = [
  { name: "Overview", href: "/dashboard/overview" },
  { name: "Transactions", href: "/dashboard/transactions" },
  { name: "Budget", href: "/dashboard/budget" },
  { name: "Accounts", href: "/dashboard/accounts" },
];

var TAB_ICONS = [
  { name: "Overview", href: "/dashboard/overview", icon: function (a: boolean) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--green)" : "var(--text-3)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>; } },
  { name: "Transactions", href: "/dashboard/transactions", icon: function (a: boolean) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--green)" : "var(--text-3)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>; } },
  { name: "Budget", href: "/dashboard/budget", icon: function (a: boolean) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--green)" : "var(--text-3)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; } },
  { name: "Accounts", href: "/dashboard/accounts", icon: function (a: boolean) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--green)" : "var(--text-3)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>; } },
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
  var isActive = function (href: string) { return pathname === href || (href === "/dashboard/overview" && (pathname === "/dashboard" || pathname === "/dashboard/overview")); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Top Bar */}
      <header className="dt-topbar" style={{ position: "fixed", top: 0, left: 0, right: 0, height: 56, background: "rgba(11,11,15,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 28px", zIndex: 30 }}>

        <Link href="/dashboard/overview" style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", textDecoration: "none", letterSpacing: -0.4 }}>
          casha<span style={{ color: "var(--green)" }}>.</span>
        </Link>

        <nav className="dt-nav" style={{ display: "flex", gap: 4, marginLeft: 32 }}>
          {NAV.map(function (item) {
            var a = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                style={{ fontSize: 12, fontWeight: a ? 600 : 500, color: a ? "var(--green)" : "var(--text-2)", textDecoration: "none", padding: "6px 14px", borderRadius: 8, background: a ? "var(--green-bg)" : "transparent", border: "1px solid " + (a ? "var(--green-border)" : "transparent"), transition: "all 100ms ease" }}
                onMouseEnter={function (e) { if (!a) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text)"; } }}
                onMouseLeave={function (e) { if (!a) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; } }}>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ position: "relative" }}>
          <button onClick={function () { setMenu(!menu); }}
            style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--text-2)", cursor: "pointer", transition: "border-color 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}>
            {initial}
          </button>

          {menu ? (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={function () { setMenu(false); }} />
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, zIndex: 50, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
                <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
                </div>
                <button onClick={logout}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "transparent", border: "none", color: "var(--text-2)", fontSize: 12, cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit", transition: "all 100ms ease" }}
                  onMouseEnter={function (e) { e.currentTarget.style.background = "var(--red-bg)"; e.currentTarget.style.color = "var(--red)"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Sign out
                </button>
              </div>
            </>
          ) : null}
        </div>
      </header>

      <main style={{ paddingTop: 56, minHeight: "100vh" }}>
        {children}
      </main>

      {/* Mobile Bottom Tabs */}
      <nav className="dt-bottom" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(11,11,15,0.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid var(--border)", display: "none", zIndex: 30, padding: "6px 0 env(safe-area-inset-bottom, 6px)" }}>
        <div style={{ display: "flex" }}>
          {TAB_ICONS.map(function (item) {
            var a = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", textDecoration: "none" }}>
                {item.icon(a)}
                <span style={{ fontSize: 9, fontWeight: a ? 600 : 500, color: a ? "var(--green)" : "var(--text-3)" }}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .dt-nav { display: none !important; }
          .dt-bottom { display: block !important; }
          .dt-topbar { padding: 0 16px !important; }
        }
        @media (min-width: 769px) {
          .dt-bottom { display: none !important; }
        }
      `}</style>
    </div>
  );
}