"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  {
    name: "Overview",
    path: "/dashboard/overview",
    group: "Core",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
      </svg>
    ),
  },
  {
    name: "Accounts",
    path: "/dashboard/accounts",
    group: "Core",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
      </svg>
    ),
  },
  {
    name: "Transactions",
    path: "/dashboard/transactions",
    group: "Core",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" />
      </svg>
    ),
  },
  {
    name: "Budget",
    path: "/dashboard/budget",
    group: "Planning",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16v4m4-8v8m4-12v12m4-16v16" />
      </svg>
    ),
  },
  {
    name: "Goals",
    path: "/dashboard/goals",
    group: "Planning",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Debts",
    path: "/dashboard/debts",
    group: "Planning",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M8.5 8.5c0-1.4 1.6-2.5 3.5-2.5s3.5 1.1 3.5 2.5-1.2 2.2-3.5 2.7c-2.2.5-3.5 1.2-3.5 2.8S10.1 18 12 18s3.5-1.1 3.5-2.5" />
      </svg>
    ),
  },
  {
    name: "Subscriptions",
    path: "/dashboard/subscriptions",
    group: "Planning",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    name: "SMS Parser",
    path: "/dashboard/sms",
    group: "Tools",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-5 4V6z" />
      </svg>
    ),
  },
  {
    name: "Tax Genius",
    path: "/dashboard/tax",
    group: "Tools",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    name: "AI Advisor",
    path: "/dashboard/chat",
    group: "Tools",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    group: "Tools",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

function AppLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", lineHeight: 1 }}>
      <img
        src="/logo.png"
        alt="Casha"
        style={{
          width: "42px",
          height: "42px",
          objectFit: "contain",
          display: "block",
          marginRight: "-5px",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "var(--sidebar-text)",
          letterSpacing: "-0.03em",
        }}
      >
        casha<span style={{ color: "#22C55E" }}>.money</span>
      </span>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("casha-theme") as ThemeMode | null;
    const nextTheme = savedTheme || "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    };

    getUser();
  }, [router]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("casha-theme", next);
    document.documentElement.setAttribute("data-theme", next);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const grouped = useMemo(() => {
    const byGroup: Record<string, typeof NAV> = {};
    NAV.forEach((item) => {
      if (!byGroup[item.group]) byGroup[item.group] = [];
      byGroup[item.group].push(item);
    });
    return byGroup;
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "999px",
              border: "3px solid var(--border)",
              borderTopColor: "#22C55E",
              margin: "0 auto 12px",
              animation: "dashspin 0.8s linear infinite",
            }}
          />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "user";

  const initials =
    (user?.user_metadata?.full_name || user?.email || "U")
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 40,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="dashboard-sidebar"
        style={{
          width: "248px",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.22s ease",
        }}
      >
        <div
          style={{
            padding: "18px 16px 16px",
            borderBottom: "1px solid var(--sidebar-border)",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", display: "block" }}>
            <AppLogo />
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
          {Object.entries(grouped).map(([groupName, items], idx) => (
            <div key={groupName} style={{ marginBottom: idx < Object.keys(grouped).length - 1 ? "18px" : "0" }}>
              <p
                style={{
                  margin: "0 0 8px 10px",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--sidebar-faint)",
                }}
              >
                {groupName}
              </p>

              {items.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      marginBottom: "4px",
                      textDecoration: "none",
                      background: active ? "var(--sidebar-active-bg)" : "transparent",
                      color: active ? "#22C55E" : "#FFFFFF",
                      opacity: active ? 1 : 0.92,
                      fontSize: "13px",
                      fontWeight: active ? 600 : 500,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ display: "flex", flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div
          style={{
            padding: "12px 10px",
            borderTop: "1px solid var(--sidebar-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "12px",
              marginBottom: "8px",
              background: "var(--sidebar-user-bg)",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--sidebar-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "10px",
                  color: "var(--sidebar-faint)",
                }}
              >
                Free Plan
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid var(--sidebar-border)",
              background: "transparent",
              color: "var(--sidebar-muted)",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          minHeight: "100vh",
          marginLeft: "248px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: "58px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 22px",
            background: "var(--topbar)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 30,
            backdropFilter: "blur(10px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Center stays empty/simple */}
          <div />

          {/* Top-right 3 dots menu */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen((s) => !s)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                color: "var(--muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
              }}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "38px",
                  right: 0,
                  width: "180px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={toggleTheme}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "11px 12px",
                    border: "none",
                    background: "transparent",
                    color: "var(--text)",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, padding: "28px" }}>{children}</div>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        @keyframes dashspin {
          to { transform: rotate(360deg); }
        }

        @media (min-width: 1024px) {
          .dashboard-sidebar {
            transform: translateX(0) !important;
          }
        }

        @media (max-width: 1023px) {
          main {
            margin-left: 0 !important;
          }
          .dashboard-sidebar {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}