"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { name: "Overview", path: "/dashboard/overview", icon: "📊" },
  { name: "Accounts", path: "/dashboard/accounts", icon: "🏦" },
  { name: "Transactions", path: "/dashboard/transactions", icon: "💳" },
  { name: "Budget", path: "/dashboard/budget", icon: "📋" },
  { name: "Goals", path: "/dashboard/goals", icon: "🎯" },
  { name: "Debts", path: "/dashboard/debts", icon: "💸" },
  { name: "Subscriptions", path: "/dashboard/subscriptions", icon: "🔄" },
  { name: "Tax Genius", path: "/dashboard/tax", icon: "🧾" },
  { name: "AI Advisor", path: "/dashboard/chat", icon: "🧠" },
  { name: "Settings", path: "/dashboard/settings", icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#FAFAFA",
        fontFamily: "system-ui, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "linear-gradient(135deg, #22C55E, #3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: "bold", fontSize: "16px",
            margin: "0 auto 12px auto"
          }}>C</div>
          <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0 }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "#FAFAFA", fontFamily: "system-ui, sans-serif"
    }}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
            zIndex: 40
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: "240px", flexShrink: 0,
        background: "#FFFFFF", borderRight: "1px solid #E5E7EB",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.2s ease",
      }}
        className="lg-sidebar"
      >
        {/* Logo */}
        <div style={{
          height: "64px", display: "flex", alignItems: "center",
          gap: "10px", padding: "0 20px",
          borderBottom: "1px solid #E5E7EB", flexShrink: 0
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #22C55E, #3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: "bold", fontSize: "14px", flexShrink: 0
          }}>C</div>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#0C0D10" }}>
            Casha<span style={{ color: "#3B82F6" }}>.money</span>
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
          {NAV.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "10px",
                  fontSize: "13px", fontWeight: "500",
                  marginBottom: "2px", textDecoration: "none",
                  background: active ? "#F3F4F6" : "transparent",
                  color: active ? "#0C0D10" : "#6B7280",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: "16px", borderTop: "1px solid #E5E7EB", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "#EEF2FF", color: "#3730A3",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "700", flexShrink: 0
            }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "12px", fontWeight: "600", color: "#0C0D10",
                margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </p>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>Free Plan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "8px", borderRadius: "8px",
              border: "1px solid #E5E7EB", background: "#F9FAFB",
              color: "#6B7280", fontSize: "12px", fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minHeight: "100vh", marginLeft: "240px" }}>
        {/* Mobile top bar */}
        <div style={{
          height: "56px", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 16px",
          background: "#FFFFFF", borderBottom: "1px solid #E5E7EB",
          position: "sticky", top: 0, zIndex: 30
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#6B7280" }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10" }}>
            Casha<span style={{ color: "#3B82F6" }}>.money</span>
          </span>
          <div style={{ width: "28px" }} />
        </div>

        {/* Page content */}
        <div style={{ padding: "32px" }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { transform: translateX(0) !important; }
        }
        @media (max-width: 1023px) {
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}