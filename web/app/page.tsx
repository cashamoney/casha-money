import Link from "next/link";

function DashPreview() {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
  const hs = 340;
  const healthColor = "#F59E0B";
  const healthLabel = "Fragile";

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", maxWidth: 1060, margin: "0 auto" }}>
      {/* Top bar mock */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#FCA5A5" }} />
        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#FDE68A" }} />
        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#86EFAC" }} />
        <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8 }}>casha.money — Dashboard</span>
      </div>

      <div style={{ padding: 20 }}>
        {/* Greeting */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: "0 0 3px" }}>Monday, January 1</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#111" }}>Good morning, User</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 99, padding: "4px 10px" }}>
            <div style={{ width: 5, height: 5, borderRadius: 5, background: "#22C55E" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#15803D" }}>AI Active</span>
          </div>
        </div>

        {/* Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12, marginBottom: 14 }}>
          {/* Health Score */}
          <div style={{ background: "linear-gradient(135deg, #111113, #1a1a1e)", borderRadius: 16, padding: "22px 22px 20px", color: "#fff", display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: `${healthColor}12`, filter: "blur(50px)", borderRadius: "50%" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.1, margin: "0 0 8px" }}>Financial Health Score</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 6 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: healthColor, lineHeight: 1, letterSpacing: "-0.04em" }}>{hs}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>/ 1000</span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "0 0 16px", lineHeight: 1.5 }}>Your finances are <span style={{ color: healthColor, fontWeight: 700 }}>{healthLabel}</span>. Focus on reducing debt and increasing savings.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Cash Buffer", value: 0, color: "#22C55E" },
                  { label: "Debt Load", value: 100, color: "#3B82F6" },
                  { label: "Savings Rate", value: 0, color: "#06B6D4" },
                  { label: "Goal Progress", value: 50, color: "#8B5CF6" },
                ].map((b, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{b.label}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{b.value}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 9, background: "rgba(255,255,255,0.08)" }}>
                      <div style={{ width: `${Math.min(b.value, 100)}%`, height: "100%", borderRadius: 9, background: b.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ width: 110, height: 110, borderRadius: "50%", background: `conic-gradient(${healthColor} 0deg ${(hs / 1000) * 360}deg, rgba(255,255,255,0.06) ${(hs / 1000) * 360}deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 82, height: 82, borderRadius: "50%", background: "#111113", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{healthLabel}</span>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>score status</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Net Worth", value: fmt(0), sub: `Assets ${fmt(0)} · Debt ${fmt(0)}`, color: "#111" },
              { label: "Monthly Income", value: fmt(0), sub: "0% savings rate", color: "#22C55E" },
              { label: "Monthly Spent", value: fmt(0), sub: `${fmt(0)} remaining`, color: "#111" },
            ].map((k, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px" }}>{k.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
                <p style={{ fontSize: 10, color: "#9CA3AF", margin: "2px 0 0 0" }}>{k.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 14 }}>
          {/* Cash Flow */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, margin: 0, color: "#111" }}>Cash Flow</h3>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#22C55E" }}>Budget →</span>
            </div>
            <div style={{ height: 120, display: "flex", alignItems: "flex-end", gap: 8, padding: "0 4px" }}>
              {["Dec", "Jan", "Feb", "Mar", "Apr"].map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 80 }}>
                    <div style={{ flex: 1, background: "#DCFCE7", borderRadius: 3, height: `${[20, 35, 15, 40, 25][i]}%` }} />
                    <div style={{ flex: 1, background: "#F3F4F6", borderRadius: 3, height: `${[15, 25, 30, 20, 35][i]}%` }} />
                  </div>
                  <span style={{ fontSize: 9, color: "#9CA3AF" }}>{m}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#9CA3AF" }}><div style={{ width: 6, height: 6, borderRadius: 2, background: "#22C55E" }} />Income</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#9CA3AF" }}><div style={{ width: 6, height: 6, borderRadius: 2, background: "#E5E7EB" }} />Expense</div>
            </div>
          </div>

          {/* Spending */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, margin: 0, color: "#111" }}>Spending Breakdown</h3>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#22C55E" }}>Details →</span>
            </div>
            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 11 }}>No expense data yet</div>
          </div>
        </div>

        {/* Row 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
          {/* Recent Transactions */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, margin: 0, color: "#111" }}>Recent Transactions</h3>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#22C55E" }}>View all →</span>
            </div>
            <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 11 }}>No transactions yet</div>
          </div>

          {/* Right rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Quick Actions */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 14 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, margin: "0 0 10px", color: "#111" }}>Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {["Add transaction", "Set a savings goal", "Ask AI advisor", "Parse bank SMS"].map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 8, background: "#F9FAFB", fontSize: 11, fontWeight: 600, color: "#111" }}>
                    <span>{a}</span>
                    <svg width="12" height="12" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, margin: 0, color: "#111" }}>Active Goals</h3>
                <svg width="12" height="12" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
              <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>No active goals yet.</p>
            </div>

            {/* Debt */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", margin: 0 }}>Total Debt</p>
                <svg width="12" height="12" fill="none" stroke="#9CA3AF" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#111", margin: 0 }}>{fmt(0)}</p>
              <p style={{ fontSize: 10, color: "#9CA3AF", margin: "3px 0 0 0" }}>You are debt free!</p>
            </div>

            {/* Savings Rate */}
            <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 12, padding: 14 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#15803D", textTransform: "uppercase", margin: "0 0 4px" }}>Savings Rate</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#15803D", margin: 0 }}>0%</p>
              <p style={{ fontSize: 10, color: "#15803D", margin: "3px 0 0 0" }}>Try to increase your savings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 0, textDecoration: "none" }}>
            <img src="/logo.png" alt="" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <span style={{ fontSize: 16, fontWeight: 800, color: "#111", letterSpacing: "-0.03em", marginLeft: -4 }}>casha<span style={{ color: "#22C55E" }}>.money</span></span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href="#features" style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", textDecoration: "none" }}>Features</a>
            <a href="#preview" style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", textDecoration: "none" }}>Preview</a>
            <Link href="/auth/login" style={{ padding: "7px 18px", borderRadius: 8, background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", border: "none", cursor: "pointer" }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 60, textAlign: "center", maxWidth: 720, margin: "0 auto", padding: "120px 24px 60px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 99, padding: "5px 14px", marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: 6, background: "#22C55E" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#15803D" }}>AI-Powered Financial Intelligence</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: "#111", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Your money,<br /><span style={{ color: "#22C55E" }}>one dashboard</span>
        </h1>
        <p style={{ fontSize: 17, color: "#6B7280", margin: "0 0 32px", lineHeight: 1.6 }}>Track spending, manage budgets, crush debts, and grow savings — all powered by AI that understands your finances.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/auth/login" style={{ padding: "12px 28px", borderRadius: 10, background: "#22C55E", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" }}>Start Free →</Link>
          <a href="#preview" style={{ padding: "12px 28px", borderRadius: 10, background: "#fff", color: "#111", fontSize: 15, fontWeight: 600, textDecoration: "none", border: "1px solid #E5E7EB" }}>See Dashboard</a>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="preview" style={{ padding: "40px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <DashPreview />
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", margin: "0 0 8px", letterSpacing: "-0.02em", color: "#111" }}>Everything you need</h2>
        <p style={{ fontSize: 15, color: "#6B7280", textAlign: "center", margin: "0 0 48px" }}>One app to rule your entire financial life.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "📊", title: "Financial Health Score", desc: "A 0-1000 score measuring your cash buffer, debt, savings rate, and goals — updated in real time." },
            { icon: "💰", title: "Smart Budgeting", desc: "Set budgets by category, track spending patterns, and get alerts before you overspend." },
            { icon: "🎯", title: "Savings Goals", desc: "Set targets, track progress, and celebrate milestones with visual progress bars." },
            { icon: "🏦", title: "Debt Manager", desc: "Track all loans, see payoff timelines, and get strategies to become debt-free faster." },
            { icon: "📱", title: "SMS Parser", desc: "Forward bank SMS and we auto-extract transactions — no manual entry needed." },
            { icon: "🤖", title: "AI Advisor", desc: "Ask anything about your money. Get personalized advice based on your actual data." },
          ].map((f, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24 }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{f.icon}</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "#111" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em", color: "#111" }}>Ready to take control?</h2>
        <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 28px" }}>Join thousands managing their money smarter with casha.money</p>
        <Link href="/auth/login" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 10, background: "#22C55E", color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" }}>Get Started Free →</Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #E5E7EB", padding: "24px", textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 8 }}>
          <Link href="/terms" style={{ color: "#9CA3AF", textDecoration: "none" }}>Terms of Use</Link>
          <Link href="/privacy" style={{ color: "#9CA3AF", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/cookies" style={{ color: "#9CA3AF", textDecoration: "none" }}>Cookies</Link>
        </div>
        © {new Date().getFullYear()} casha.money — All rights reserved.
      </footer>

      <style>{`
        @media (max-width: 768px) {
          section h1 { font-size: 32px !important; }
          section h2 { font-size: 24px !important; }
          #features > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}