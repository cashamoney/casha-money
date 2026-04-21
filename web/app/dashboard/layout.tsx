"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/* ── Grouped Navigation ── */
const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      {
        name: "Overview",
        path: "/dashboard/overview",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        name: "Accounts",
        path: "/dashboard/accounts",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
      },
      {
        name: "Transactions",
        path: "/dashboard/transactions",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Planning",
    items: [
      {
        name: "Budget",
        path: "/dashboard/budget",
        /* Bar chart icon — DIFFERENT from Tax Genius */
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16v4m4-8v8m4-12v12m4-16v16" />
          </svg>
        ),
      },
      {
        name: "Goals",
        path: "/dashboard/goals",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        name: "Debts",
        path: "/dashboard/debts",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        name: "Subscriptions",
        path: "/dashboard/subscriptions",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 9a8 8 0 00-13.66-5.66L4 5M4 15a8 8 0 0013.66 5.66L20 19" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        name: "SMS Parser",
        path: "/dashboard/sms",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ),
      },
      {
        name: "Tax Genius",
        path: "/dashboard/tax",
        /* Receipt with % icon — DIFFERENT from Budget */
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        ),
      },
      {
        name: "AI Advisor",
        path: "/dashboard/chat",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
      },
      {
        name: "Settings",
        path: "/dashboard/settings",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
      },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("casha-theme") as "light" | "dark" | null;
    const initial = saved || "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/auth/login"); return; }
      setUser(data.user);
      setLoading(false);
    };
    getUser();
  }, [router]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("casha-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "999px", border: "3px solid var(--border)", borderTopColor: "#22C55E", margin: "0 auto 12px", animation: "dashspin 0.8s linear infinite" }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "user";
  const initials = (user?.user_metadata?.full_name || user?.email || "U").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="dashboard-sidebar" style={{ width: "240px", position: "fixed", top: 0, left: 0, bottom: 0, background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)", zIndex: 50, display: "flex", flexDirection: "column", transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.22s ease" }}>

        {/* Logo — bigger, white */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--sidebar-border)" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "2px", lineHeight: 1 }}>
            <img src="/logo.png" alt="Casha" style={{ width: "42px", height: "42px", objectFit: "contain", display: "block", marginRight: "-4px", flexShrink: 0 }} />
            <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--sidebar-text)", letterSpacing: "-0.03em" }}>
              casha<span style={{ color: "#22C55E" }}>.money</span>
            </span>
          </Link>
        </div>

        {/* Grouped Navigation */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} style={{ marginBottom: gi < NAV_GROUPS.length - 1 ? "20px" : 0 }}>
              <p style={{ margin: "0 0 8px 12px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--sidebar-faint)" }}>
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", marginBottom: "3px", textDecoration: "none", background: active ? "var(--sidebar-active-bg)" : "transparent", color: active ? "#22C55E" : "var(--sidebar-muted)", fontSize: "13px", fontWeight: active ? 600 : 500, transition: "all 0.15s ease" }}>
                    <span style={{ display: "flex", flexShrink: 0 }}>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom — User + Theme + Logout */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--sidebar-border)" }}>
          {/* User card */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "10px", marginBottom: "10px", background: "var(--sidebar-user-bg)" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "linear-gradient(135deg, #22C55E, #16A34A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--sidebar-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
              <p style={{ margin: 0, fontSize: "10px", color: "var(--sidebar-faint)" }}>Free Plan</p>
            </div>
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{ width: "100%", padding: "9px 10px", borderRadius: "9px", border: "1px solid var(--sidebar-border)", background: "transparent", color: "var(--sidebar-muted)", fontSize: "12px", fontWeight: 500, fontFamily: "inherit", cursor: "pointer", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            {theme === "light" ? (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9 9 0 1111 2.248a7 7 0 0010.752 12.754z" />
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            )}
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>

          {/* Sign out */}
          <button onClick={handleLogout} style={{ width: "100%", padding: "9px 10px", borderRadius: "9px", border: "1px solid var(--sidebar-border)", background: "transparent", color: "var(--sidebar-muted)", fontSize: "12px", fontWeight: 500, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content" style={{ minHeight: "100vh", marginLeft: "240px", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{ height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "var(--topbar)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30, backdropFilter: "blur(10px)" }}>

          {/* Hamburger — hidden on desktop via CSS */}
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", color: "var(--muted)", display: "flex", alignItems: "center", borderRadius: "8px" }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Center logo in mobile topbar */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", lineHeight: 1 }}>
            <img src="/logo.png" alt="Casha" style={{ width: "30px", height: "30px", objectFit: "contain", display: "block", marginRight: "-4px" }} />
            <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
              casha<span style={{ color: "#22C55E" }}>.money</span>
            </span>
          </div>

          <div style={{ width: "34px" }} />
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "28px" }}>{children}</div>
      </main>
    </div>
  );
}