"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", lineHeight: 1 }}>
      <img
        src="/logo.png"
        alt="Casha"
        style={{
          width: "38px",
          height: "38px",
          objectFit: "contain",
          display: "block",
          flexShrink: 0,
          marginRight: "-6px",
        }}
      />
      <span
        style={{
          fontSize: "16px",
          fontWeight: 800,
          color: light ? "#FFFFFF" : "var(--text)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        casha<span style={{ color: "#22C55E" }}>.money</span>
      </span>
    </div>
  );
}

const NAV = [
  {
    name: "Overview",
    path: "/dashboard/overview",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
      </svg>
    ),
  },
  {
    name: "Accounts",
    path: "/dashboard/accounts",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
      </svg>
    ),
  },
  {
    name: "Transactions",
    path: "/dashboard/transactions",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" />
      </svg>
    ),
  },
  {
    name: "Budget",
    path: "/dashboard/budget",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    name: "Goals",
    path: "/dashboard/goals",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Debts",
    path: "/dashboard/debts",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M8.5 8.5c0-1.4 1.6-2.5 3.5-2.5s3.5 1.1 3.5 2.5-1.2 2.2-3.5 2.7c-2.2.5-3.5 1.2-3.5 2.8S10.1 18 12 18s3.5-1.1 3.5-2.5" />
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
  {
    name: "SMS Parser",
    path: "/dashboard/sms",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-5 4V6z" />
      </svg>
    ),
  },
  {
    name: "Tax Genius",
    path: "/dashboard/tax",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    name: "AI Advisor",
    path: "/dashboard/chat",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3h4.5a2.25 2.25 0 012.25 2.25V6A2.25 2.25 0 0114.25 8.25h-4.5A2.25 2.25 0 017.5 6v-.75A2.25 2.25 0 019.75 3zM6 13.5c0-1.657 2.686-3 6-3s6 1.343 6 3v1.5A3 3 0 0115 18H9a3 3 0 01-3-3v-1.5z" />
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
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme =
      typeof window !== "undefined"
        ? (localStorage.getItem("casha-theme") as "light" | "dark" | null)
        : null;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }

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
              width: "38px",
              height: "38px",
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
      {/* Mobile overlay */}
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
          width: "228px",
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
        {/* Logo */}
        <div
          style={{
            padding: "18px 14px",
            borderBottom: "1px solid var(--sidebar-border)",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              lineHeight: 1,
            }}
          >
            <img
              src="/logo.png"
              alt="Casha"
              style={{
                width: "34px",
                height: "34px",
                objectFit: "contain",
                display: "block",
                marginRight: "-6px",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "var(--sidebar-text)",
                letterSpacing: "-0.03em",
              }}
            >
              casha<span style={{ color: "#22C55E" }}>.money</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {NAV.map((item) => {
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
                  borderRadius: "10px",
                  marginBottom: "3px",
                  textDecoration: "none",
                  background: active ? "var(--sidebar-active-bg)" : "transparent",
                  color: active ? "#22C55E" : "var(--sidebar-muted)",
                  fontSize: "13px",
                  fontWeight: active ? "600" : "500",
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
        </nav>

        {/* Bottom user area */}
        <div
          style={{
            padding: "12px 8px",
            borderTop: "1px solid var(--sidebar-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 10px",
              borderRadius: "10px",
              marginBottom: "8px",
              background: "var(--sidebar-user-bg)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
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
            onClick={toggleTheme}
            style={{
              width: "100%",
              padding: "9px 10px",
              borderRadius: "9px",
              border: "1px solid var(--sidebar-border)",
              background: "transparent",
              color: "var(--sidebar-muted)",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
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
            {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "9px 10px",
              borderRadius: "9px",
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
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main
        style={{
          minHeight: "100vh",
          marginLeft: "228px",
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

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <img
              src="/logo.png"
              alt="Casha"
              style={{
                width: "28px",
                height: "28px",
                objectFit: "contain",
                display: "block",
                marginRight: "-5px",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.03em",
              }}
            >
              casha<span style={{ color: "#22C55E" }}>.money</span>
            </span>
          </div>

          <div style={{ width: "24px" }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "28px" }}>{children}</div>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        :root[data-theme="light"] {
          --bg: #F6F7F9;
          --text: #0A0A0A;
          --muted: #71717A;
          --faint: #A1A1AA;
          --border: #E5E7EB;
          --card: #FFFFFF;
          --topbar: rgba(255,255,255,0.82);

          --sidebar: #0A0A0A;
          --sidebar-text: #FFFFFF;
          --sidebar-muted: rgba(255,255,255,0.46);
          --sidebar-faint: rgba(255,255,255,0.28);
          --sidebar-border: rgba(255,255,255,0.08);
          --sidebar-active-bg: rgba(34,197,94,0.12);
          --sidebar-user-bg: rgba(255,255,255,0.03);
        }

        :root[data-theme="dark"] {
          --bg: #0A0A0A;
          --text: #F8FAFC;
          --muted: #94A3B8;
          --faint: #64748B;
          --border: rgba(255,255,255,0.08);
          --card: #111111;
          --topbar: rgba(10,10,10,0.88);

          --sidebar: #050505;
          --sidebar-text: #FFFFFF;
          --sidebar-muted: rgba(255,255,255,0.56);
          --sidebar-faint: rgba(255,255,255,0.28);
          --sidebar-border: rgba(255,255,255,0.08);
          --sidebar-active-bg: rgba(34,197,94,0.14);
          --sidebar-user-bg: rgba(255,255,255,0.03);
        }

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