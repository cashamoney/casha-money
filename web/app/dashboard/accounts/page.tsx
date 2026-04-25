"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const TYPES = [
  { value: "Bank", label: "Bank Account", color: "#22C55E", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg> },
  { value: "Cash", label: "Cash", color: "#22C55E", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: "Credit Card", label: "Credit Card", color: "#22C55E", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { value: "UPI", label: "UPI / Digital", color: "#22C55E", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
  { value: "Investment", label: "Investment", color: "#22C55E", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  { value: "Other", label: "Other", color: "#22C55E", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
];

function getTypeMeta(type: string) {
  return TYPES.find(t => t.value === type) || TYPES[TYPES.length - 1];
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Bank");
  const [balance, setBalance] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    const { data } = await supabase.from("accounts").select("*").eq("user_id", u.user.id).eq("is_active", true).order("created_at", { ascending: false });
    setAccounts(data || []);
    setLoading(false);
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
  const assets = accounts.filter(a => Number(a.current_balance || 0) >= 0).reduce((s, a) => s + Number(a.current_balance || 0), 0);
  const debts = accounts.filter(a => Number(a.current_balance || 0) < 0).reduce((s, a) => s + Math.abs(Number(a.current_balance || 0)), 0);

  const grouped = TYPES.map(t => ({
    ...t,
    items: accounts.filter(a => a.account_type === t.value),
    total: accounts.filter(a => a.account_type === t.value).reduce((s, a) => s + Number(a.current_balance || 0), 0),
  })).filter(g => g.items.length > 0);

  const handleAdd = async () => {
    if (!name.trim() || !balance) return;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    await supabase.from("accounts").insert({ user_id: u.user.id, account_name: name.trim(), account_type: type, current_balance: Number(balance), is_active: true });
    setName(""); setType("Bank"); setBalance(""); setShowForm(false); setSaving(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("accounts").update({ is_active: false }).eq("id", id);
    load();
  };

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #E5E7EB", borderTopColor: "#22C55E", borderRadius: "50%", animation: "xspin 0.6s linear infinite" }} />
      <style>{`@keyframes xspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const assetPct = totalBalance > 0 ? (assets / (assets + debts || 1)) * 100 : 100;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA" }}>
      <div className="xw" style={{ maxWidth: 880, margin: "0 auto", padding: "40px 24px 64px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
          <a href="/dashboard/overview" style={{ fontSize: 12, color: "#A1A1AA", textDecoration: "none", fontWeight: 500 }}>Dashboard</a>
          <svg width="10" height="10" fill="none" stroke="#D4D4D8" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span style={{ fontSize: 12, color: "#0A0A0A", fontWeight: 600 }}>Accounts</span>
        </div>

        {/* Title Row */}
        <div className="xh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.04em" }}>Accounts</h1>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 22px", borderRadius: 12, border: "none",
              background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(34,197,94,0.35)",
              transition: "transform 0.12s, box-shadow 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(34,197,94,0.40)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,197,94,0.35)"; }}
          >
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Account
          </button>
        </div>

        {/* Net Worth Section */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 20, padding: "32px 36px 28px", marginBottom: 12, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #22C55E 0%, #16A34A 100%)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#71717A", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.08 }}>Total Net Worth</p>
              <p style={{ fontSize: 38, fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.04em", lineHeight: 1 }}>{fmt(totalBalance)}</p>
              <p style={{ fontSize: 12, color: "#A1A1AA", margin: "10px 0 0 0" }}>{accounts.length} account{accounts.length !== 1 ? "s" : ""} linked</p>
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 11, color: "#71717A", margin: "0 0 2px", fontWeight: 500 }}>Assets</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#22C55E", margin: 0, letterSpacing: "-0.02em" }}>{fmt(assets)}</p>
              </div>
              <div style={{ width: 1, height: 32, background: "#E5E7EB" }} />
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 11, color: "#71717A", margin: "0 0 2px", fontWeight: 500 }}>Debts</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: debts > 0 ? "#EF4444" : "#A1A1AA", margin: 0, letterSpacing: "-0.02em" }}>{debts > 0 ? fmt(debts) : "None"}</p>
              </div>
            </div>
          </div>
          {/* Allocation Bar */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#22C55E", textTransform: "uppercase", letterSpacing: 0.06 }}>Assets {totalBalance > 0 ? Math.round(assetPct) : 0}%</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#EF4444", textTransform: "uppercase", letterSpacing: 0.06 }}>Debts {totalBalance > 0 ? Math.round(100 - assetPct) : 0}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 6, background: "#F4F4F5", overflow: "hidden" }}>
              <div style={{ width: `${assetPct}%`, height: "100%", borderRadius: 6, background: "linear-gradient(90deg, #22C55E, #16A34A)", transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="xq" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 36 }}>
          {[
            { label: "Banks", count: accounts.filter(a => a.account_type === "Bank").length, icon: <svg width="16" height="16" fill="none" stroke="#22C55E" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg> },
            { label: "Cards", count: accounts.filter(a => a.account_type === "Credit Card").length, icon: <svg width="16" height="16" fill="none" stroke="#22C55E" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
            { label: "Invested", count: accounts.filter(a => a.account_type === "Investment").length, icon: <svg width="16" height="16" fill="none" stroke="#22C55E" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
            { label: "Other", count: accounts.filter(a => !["Bank", "Credit Card", "Investment"].includes(a.account_type)).length, icon: <svg width="16" height="16" fill="none" stroke="#22C55E" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #F4F4F5", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#0A0A0A", margin: 0, lineHeight: 1 }}>{s.count}</p>
                <p style={{ fontSize: 10, color: "#A1A1AA", margin: "2px 0 0 0", fontWeight: 500 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grouped Accounts */}
        {grouped.length > 0 && grouped.map(g => (
          <div key={g.value} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "0 2px" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", color: "#22C55E", flexShrink: 0 }}>{g.icon}</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0A" }}>{g.label}</span>
              <span style={{ fontSize: 12, color: "#A1A1AA", fontWeight: 400 }}>{g.items.length}</span>
              <div style={{ flex: 1, height: 1, background: "#F4F4F5" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.01em" }}>{fmt(g.total)}</span>
            </div>
            <div className="xcg" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {g.items.map(a => {
                const meta = getTypeMeta(a.account_type);
                const bal = Number(a.current_balance || 0);
                return (
                  <div key={a.id} style={{ background: "#fff", border: "1px solid #F4F4F5", borderRadius: 14, overflow: "hidden", transition: "border-color 0.15s, box-shadow 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#DCFCE7"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,197,94,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#F4F4F5"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ height: 3, background: `linear-gradient(90deg, #22C55E, #16A34A)` }} />
                    <div style={{ padding: "16px 20px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", color: "#22C55E", flexShrink: 0 }}>{meta.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.account_name}</p>
                          <p style={{ fontSize: 11, color: "#A1A1AA", margin: "2px 0 0 0" }}>{meta.label}</p>
                        </div>
                        <button onClick={() => handleDelete(a.id)}
                          style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#E5E7EB", transition: "color 0.12s, background 0.12s" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "#FEF2F2"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#E5E7EB"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: 0.07, margin: "0 0 4px" }}>Balance</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: bal >= 0 ? "#0A0A0A" : "#DC2626", margin: 0, letterSpacing: "-0.03em" }}>{fmt(bal)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {accounts.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px 40px" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "#F0FDF4", border: "1px solid #DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="32" height="32" fill="none" stroke="#22C55E" strokeWidth="1.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0A0A0A", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Start by adding an account</h2>
            <p style={{ fontSize: 14, color: "#71717A", margin: "0 0 28px", maxWidth: 340, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              Link your bank, credit card, or investment account to see your full financial picture.
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "12px 28px", borderRadius: 12, border: "none",
                background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(34,197,94,0.35)",
              }}
            >
              Add your first account
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="xm"
            style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, boxShadow: "0 32px 64px rgba(0,0,0,0.20)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div style={{ height: 3, background: "linear-gradient(90deg, #22C55E, #16A34A)", borderRadius: "20px 20px 0 0" }} />
            <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.02em" }}>New Account</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #F4F4F5", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#A1A1AA" }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{ padding: "20px 28px 28px" }}>
              <label style={{ display: "block", marginBottom: 10, fontSize: 11, fontWeight: 600, color: "#71717A", textTransform: "uppercase", letterSpacing: 0.06 }}>Type</label>
              <div className="xmt" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
                {TYPES.map(t => {
                  const sel = type === t.value;
                  return (
                    <button key={t.value} onClick={() => setType(t.value)}
                      style={{
                        background: sel ? "#F0FDF4" : "#FAFAFA",
                        border: sel ? "1.5px solid #22C55E" : "1.5px solid #F4F4F5",
                        borderRadius: 12, padding: "14px 8px", cursor: "pointer",
                        textAlign: "center", transition: "0.12s", fontFamily: "inherit",
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: sel ? "#DCFCE7" : "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", color: sel ? "#22C55E" : "#A1A1AA", margin: "0 auto 6px" }}>{t.icon}</div>
                      <span style={{ fontSize: 10, fontWeight: sel ? 700 : 500, color: sel ? "#22C55E" : "#71717A" }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#71717A", textTransform: "uppercase", letterSpacing: 0.06 }}>Account Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. HDFC Savings"
                  style={{ width: "100%", height: 44, borderRadius: 12, padding: "0 16px", fontSize: 14, outline: "none", fontFamily: "inherit", background: "#FAFAFA", border: "1.5px solid #F4F4F5", color: "#0A0A0A", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "#F4F4F5"}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#71717A", textTransform: "uppercase", letterSpacing: 0.06 }}>Opening Balance</label>
                <input type="number" required value={balance} onChange={e => setBalance(e.target.value)} placeholder="0"
                  style={{ width: "100%", height: 44, borderRadius: 12, padding: "0 16px", fontSize: 14, outline: "none", fontFamily: "inherit", background: "#FAFAFA", border: "1.5px solid #F4F4F5", color: "#0A0A0A", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "#F4F4F5"}
                />
              </div>

              <button onClick={handleAdd} disabled={saving}
                style={{
                  width: "100%", height: 46, borderRadius: 12, border: "none",
                  background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1,
                  boxShadow: "0 4px 16px rgba(34,197,94,0.35)",
                }}
              >
                {saving ? "Saving..." : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        @keyframes xspin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .xq { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .xw { padding: 24px 16px 0 !important; }
          .xq { grid-template-columns: repeat(2, 1fr) !important; }
          .xcg { grid-template-columns: 1fr !important; }
          .xh { flex-direction: column !important; align-items: flex-start !important; }
          .xh h1 { font-size: 22px !important; }
          .xm { max-width: 100% !important; border-radius: 14px !important; }
          .xmt { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .xw { padding: 16px 12px 0 !important; }
          .xq { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}