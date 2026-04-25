"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type ThemeMode = "light" | "dark";

const NAV = [
  { name: "Overview", path: "/dashboard/overview", group: "Core", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" /></svg> },
  { name: "Accounts", path: "/dashboard/accounts", group: "Core", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" /></svg> },
  { name: "Transactions", path: "/dashboard/transactions", group: "Core", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" /></svg> },
  { name: "Budget", path: "/dashboard/budget", group: "Planning", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16v4m4-8v8m4-12v12m4-16v16" /></svg> },
  { name: "Goals", path: "/dashboard/goals", group: "Planning", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { name: "Debts", path: "/dashboard/debts", group: "Planning", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M8.5 8.5c0-1.4 1.6-2.5 3.5-2.5s3.5 1.1 3.5 2.5-1.2 2.2-3.5 2.7c-2.2.5-3.5 1.2-3.5 2.8S10.1 18 12 18s3.5-1.1 3.5-2.5" /></svg> },
  { name: "Subscriptions", path: "/dashboard/subscriptions", group: "Planning", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> },
  { name: "SMS Parser", path: "/dashboard/sms", group: "Tools", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-5 4V6z" /></svg> },
  { name: "Tax Genius", path: "/dashboard/tax", group: "Tools", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg> },
  { name: "AI Advisor", path: "/dashboard/chat", group: "Tools", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  { name: "Settings", path: "/dashboard/settings", group: "Tools", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [topMenu, setTopMenu] = useState(false);
  const [accMenu, setAccMenu] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const topRef = useRef<HTMLDivElement>(null);
  const accRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = (localStorage.getItem("casha-theme") as ThemeMode) || "light";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUser(data.user);
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (topRef.current && !topRef.current.contains(e.target as Node)) setTopMenu(false);
      if (accRef.current && !accRef.current.contains(e.target as Node)) setAccMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, typeof NAV> = {};
    NAV.forEach(i => { (g[i.group] = g[i.group] || []).push(i); });
    return g;
  }, []);

  const toggleTheme = () => {
    const n = theme === "light" ? "dark" : "light";
    setTheme(n); localStorage.setItem("casha-theme", n);
    document.documentElement.setAttribute("data-theme", n);
    setTopMenu(false);
  };

  if (loading) return <div style={{ height: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 36, height: 36, borderRadius: 99, border: "3px solid var(--border)", borderTopColor: "#22C55E", animation: "spin 0.8s linear infinite" }} /></div>;

  const name = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0];
  const email = user?.email || "";
  const ini = (user?.user_metadata?.full_name || user?.email || "U").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />}

      <aside className="dash-sidebar" style={{ width: 244, position: "fixed", top: 0, left: 0, bottom: 0, background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)", zIndex: 50, display: "flex", flexDirection: "column", transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.2s ease" }}>
        <div style={{ padding: "16px 14px", borderBottom: "1px solid var(--sidebar-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <img src="/logo.png" alt="" style={{ width: 38, height: 38, objectFit: "contain" }} />
            <span style={{ fontSize: 17, fontWeight: 800, color: "var(--sidebar-text)", letterSpacing: "-0.03em" }}>casha<span style={{ color: "#22C55E" }}>.money</span></span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {Object.entries(grouped).map(([g, items], gi) => (
            <div key={g} style={{ marginBottom: gi < Object.keys(grouped).length - 1 ? 16 : 0 }}>
              <p style={{ margin: "0 0 6px 8px", fontSize: 10, fontWeight: 700, letterSpacing: 0.1, textTransform: "uppercase", color: "var(--sidebar-faint)" }}>{g}</p>
              {items.map(i => {
                const a = pathname === i.path;
                return (
                  <Link
                    key={i.path}
                    href={i.path}
                    onClick={() => setSidebarOpen(false)}
                    className="nav-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 10px",
                      borderRadius: 10,
                      marginBottom: 2,
                      textDecoration: "none",
                      background: a ? "var(--sidebar-active-bg)" : "transparent",
                      color: a ? "#22C55E" : "rgba(255,255,255,0.95)",
                      fontSize: 13,
                      fontWeight: a ? 600 : 500,
                      transition: "0.15s",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ display: "flex", flexShrink: 0 }}>{i.icon}</span>
                    <span style={{ flex: 1 }}>{i.name}</span>
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      style={{
                        flexShrink: 0,
                        opacity: a ? 0.9 : 0,
                        transform: a ? "translateX(0)" : "translateX(-4px)",
                        transition: "0.2s",
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div ref={accRef} style={{ padding: "10px 8px", borderTop: "1px solid var(--sidebar-border)", position: "relative" }}>
          <button onClick={() => setAccMenu(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 10, background: "var(--sidebar-user-bg)", border: "none", cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: "linear-gradient(135deg, #22C55E, #16A34A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{ini}</div>
            <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sidebar-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
              <p style={{ fontSize: 10, color: "var(--sidebar-faint)", margin: "1px 0 0 0" }}>Free Plan</p>
            </div>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, transform: accMenu ? "rotate(180deg)" : "rotate(0)", transition: "0.2s" }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
          </button>
          {accMenu && (
            <div style={{ position: "absolute", left: 8, right: 8, bottom: 62, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", overflow: "hidden" }}>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
              <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} style={{ width: "100%", textAlign: "left", padding: "10px 12px", border: "none", background: "transparent", color: "#DC2626", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign out
              </button>
              <div style={{ borderTop: "1px solid var(--border)", padding: "8px 12px", display: "flex", gap: 10, fontSize: 11, color: "var(--muted)" }}>
                <Link href="/terms" style={{ color: "var(--muted)", textDecoration: "none" }}>Terms of Use</Link>
                <Link href="/privacy" style={{ color: "var(--muted)", textDecoration: "none" }}>Privacy Policy</Link>
                <Link href="/cookies" style={{ color: "var(--muted)", textDecoration: "none" }}>Cookies</Link>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="dash-main" style={{ minHeight: "100vh", marginLeft: 244, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", background: "var(--topbar)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30, backdropFilter: "blur(10px)" }}>
          <button onClick={() => setSidebarOpen(true)} className="mob-menu" style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          <div style={{ flex: 1 }} />
          <div ref={topRef} style={{ position: "relative" }}>
            <button onClick={() => setTopMenu(v => !v)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "var(--muted)", display: "flex" }}><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg></button>
            {topMenu && <div style={{ position: "absolute", top: 36, right: 0, width: 170, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}><button onClick={toggleTheme} style={{ width: "100%", textAlign: "left", padding: "10px 12px", border: "none", background: "transparent", color: "var(--text)", fontSize: 13, cursor: "pointer" }}>{theme === "light" ? "Dark mode" : "Light mode"}</button></div>}
          </div>
        </div>
        <div className="main-content" style={{ flex: 1, padding: 24 }}>{children}</div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-item:hover svg { opacity: 0.6 !important; transform: translateX(0) !important; }
        @media (min-width: 1024px) {
          .dash-sidebar { transform: translateX(0) !important; }
          .mob-menu { display: none !important; }
          .dash-main { margin-left: 244px !important; }
        }
        @media (max-width: 1023px) {
          .dash-main { margin-left: 0 !important; }
          .main-content { padding: 16px !important; }
        }
        @media (max-width: 640px) {
          .main-content { padding: 12px !important; }
        }
      `}</style>
    </div>
  );
}