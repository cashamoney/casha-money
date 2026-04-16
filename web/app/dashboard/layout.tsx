"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { name: "Overview", path: "/dashboard/overview", icon: "📊" },
  { name: "Transactions", path: "/dashboard/transactions", icon: "💳" },
  { name: "Goals", path: "/dashboard/goals", icon: "🎯" },
  { name: "Debts", path: "/dashboard/debts", icon: "💸" },
  { name: "AI Advisor", path: "/dashboard/chat", icon: "🧠" },
  { name: "Settings", path: "/dashboard/settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FAFAFA" }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #22C55E, #3B82F6)" }}
          >
            C
          </div>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFA" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E5E7EB",
        }}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center gap-2.5 px-5"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #22C55E, #3B82F6)" }}
          >
            C
          </div>
          <span className="text-[16px] font-bold text-[#0C0D10]">
            Casha<span className="text-[#3B82F6]">.money</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                style={{
                  background: active ? "#F3F4F6" : "transparent",
                  color: active ? "#0C0D10" : "#6B7280",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                }}
              >
                <span className="text-[16px]">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div
          className="p-4"
          style={{ borderTop: "1px solid #E5E7EB" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#EEF2FF", color: "#3730A3" }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: "#0C0D10" }}
              >
                {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </p>
              <p
                className="text-[11px] truncate"
                style={{ color: "#9CA3AF" }}
              >
                Free Plan
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-[12px] font-medium py-2 rounded-lg transition-all"
            style={{
              color: "#6B7280",
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Top bar (mobile) */}
        <div
          className="h-14 flex items-center justify-between px-4 lg:hidden"
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg"
            style={{ color: "#6B7280" }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold text-[#0C0D10]">
            Casha<span className="text-[#3B82F6]">.money</span>
          </span>
          <div className="w-8" />
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}