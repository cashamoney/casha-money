"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const CATEGORIES: Record<string, { color: string; icon: React.ReactNode }> = {
  "Salary": { color: "#16A34A", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> },
  "Freelance": { color: "#22C55E", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  "Investment Return": { color: "#15803D", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  "Gift": { color: "#4ADE80", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg> },
  "Refund": { color: "#86EFAC", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357 2m15.357 2H15" /></svg> },
  "Food Delivery": { color: "#F97316", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l.5 2M7 13h10l4-8H5.5M7 13l-1.5 3h13M7 13l1.5-5m0 0h7" /></svg> },
  "Food & Dining": { color: "#EA580C", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  "Groceries": { color: "#D97706", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
  "Shopping": { color: "#EC4899", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
  "Clothing": { color: "#DB2777", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
  "EMI Payment": { color: "#DC2626", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  "Loan Payment": { color: "#B91C1C", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
  "Transport": { color: "#3B82F6", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.4L21 11M3 11h18M3 11v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6" /></svg> },
  "Fuel": { color: "#2563EB", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg> },
  "Travel": { color: "#1D4ED8", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> },
  "Streaming/OTT": { color: "#8B5CF6", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  "Subscription": { color: "#7C3AED", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357 2m15.357 2H15" /></svg> },
  "Health": { color: "#F43F5E", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
  "Medical": { color: "#E11D48", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
  "Education": { color: "#6366F1", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg> },
  "Bills/Utilities": { color: "#64748B", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  "Entertainment": { color: "#F59E0B", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
  "Transfer": { color: "#9CA3AF", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
};

const INCOME_CATS = ["Salary", "Freelance", "Investment Return", "Gift", "Refund", "Other Income"];
const EXPENSE_CATS = ["Food Delivery", "Food & Dining", "Groceries", "Shopping", "Clothing", "EMI Payment", "Loan Payment", "Transport", "Fuel", "Travel", "Streaming/OTT", "Subscription", "Health", "Medical", "Education", "Bills/Utilities", "Entertainment", "Transfer", "Other"];

function getCatMeta(cat: string) {
  return CATEGORIES[cat] || { color: "#6B7280", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg> };
}

function CatIcon({ category }: { category: string }) {
  const m = getCatMeta(category);
  return <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: m.color, flexShrink: 0 }}>{m.icon}</div>;
}

function isToday(d: Date) { const t = new Date(); return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear(); }
function isYesterday(d: Date) { const t = new Date(); t.setDate(t.getDate() - 1); return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear(); }
function isThisWeek(d: Date) { const t = new Date(); const diff = (t.getTime() - d.getTime()) / (1000 * 60 * 60 * 24); return diff < 7 && !isToday(d) && !isYesterday(d); }

function groupTxns(txns: any[]) {
  const g: Record<string, any[]> = { "Today": [], "Yesterday": [], "This Week": [], "Earlier": [] };
  txns.forEach(t => {
    const d = new Date(t.transaction_date);
    if (isToday(d)) g["Today"].push(t);
    else if (isYesterday(d)) g["Yesterday"].push(t);
    else if (isThisWeek(d)) g["This Week"].push(t);
    else g["Earlier"].push(t);
  });
  return Object.entries(g).filter(([, v]) => v.length > 0);
}

export default function TransactionsPage() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const [fType, setFType] = useState("expense");
  const [fMerchant, setFMerchant] = useState("");
  const [fAmount, setFAmount] = useState("");
  const [fCat, setFCat] = useState("Food Delivery");
  const [fDate, setFDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    const { data } = await supabase.from("transactions").select("*").eq("user_id", u.user.id).order("transaction_date", { ascending: false });
    setTxns(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return txns.filter(t => {
      if (typeFilter !== "all" && t.transaction_type !== typeFilter) return false;
      if (catFilter !== "all" && t.category !== catFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const match = (t.merchant_name || "").toLowerCase().includes(s) || (t.category || "").toLowerCase().includes(s) || (t.note || "").toLowerCase().includes(s);
        if (!match) return false;
      }
      return true;
    });
  }, [txns, typeFilter, catFilter, search]);

  const visible = filtered.slice(0, visibleCount);
  const groups = groupTxns(visible);

  const now = new Date();
  const mTx = txns.filter(t => { const d = new Date(t.transaction_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const totalInc = mTx.filter(t => t.transaction_type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const totalExp = mTx.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  const allCats = useMemo(() => { const s = new Set(txns.map(t => t.category)); return Array.from(s).sort(); }, [txns]);

  const resetForm = () => { setFType("expense"); setFMerchant(""); setFAmount(""); setFCat("Food Delivery"); setFDate(new Date().toISOString().split("T")[0]); };

  const handleAdd = async () => {
    if (!fMerchant.trim() || !fAmount) return;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    await supabase.from("transactions").insert({ user_id: u.user.id, transaction_type: fType, merchant_name: fMerchant.trim(), amount: Math.abs(Number(fAmount)), category: fCat, transaction_date: fDate });
    resetForm(); setShowAdd(false); setSaving(false); load();
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    await supabase.from("transactions").update({ transaction_type: fType, merchant_name: fMerchant.trim(), amount: Math.abs(Number(fAmount)), category: fCat, transaction_date: fDate }).eq("id", id);
    resetForm(); setEditId(null); setSaving(false); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    await supabase.from("transactions").delete().eq("id", id);
    load();
  };

  const startEdit = (t: any) => {
    setEditId(t.id); setFType(t.transaction_type); setFMerchant(t.merchant_name || ""); setFAmount(String(Math.abs(Number(t.amount)))); setFCat(t.category || "Other"); setFDate(t.transaction_date ? t.transaction_date.split("T")[0] : new Date().toISOString().split("T")[0]); setShowAdd(false);
  };

  const activeCats = fType === "income" ? INCOME_CATS : EXPENSE_CATS;

  if (loading) return <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: "0 0 4px" }}>Dashboard</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Transactions</h1>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(v => !v); setEditId(null); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: "#22C55E", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Transaction
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", margin: "0 0 4px" }}>Income</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#22C55E", margin: 0 }}>{fmt(totalInc)}</p>
          <p style={{ fontSize: 10, color: "var(--muted)", margin: "3px 0 0 0" }}>This month</p>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", margin: "0 0 4px" }}>Expense</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#DC2626", margin: 0 }}>{fmt(totalExp)}</p>
          <p style={{ fontSize: 10, color: "var(--muted)", margin: "3px 0 0 0" }}>This month</p>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", margin: "0 0 4px" }}>Net</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: totalInc - totalExp >= 0 ? "#22C55E" : "#DC2626", margin: 0 }}>{fmt(totalInc - totalExp)}</p>
          <p style={{ fontSize: 10, color: "var(--muted)", margin: "3px 0 0 0" }}>This month</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg width="14" height="14" fill="none" stroke="var(--faint)" strokeWidth="2" viewBox="0 0 24 24" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 13, outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["all", "income", "expense"].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid", borderColor: typeFilter === f ? "#22C55E" : "var(--border)", background: typeFilter === f ? "rgba(34,197,94,0.1)" : "var(--card)", color: typeFilter === f ? "#22C55E" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "0.15s" }}>
              {f === "all" ? "All" : f === "income" ? "Income" : "Expense"}
            </button>
          ))}
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 12, fontWeight: 500, outline: "none", cursor: "pointer" }}>
          <option value="all">All Categories</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {(showAdd || editId) && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>{editId ? "Edit Transaction" : "New Transaction"}</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => { setFType("expense"); setFCat("Food Delivery"); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: "2px solid", borderColor: fType === "expense" ? "#DC2626" : "var(--border)", background: fType === "expense" ? "rgba(220,38,38,0.06)" : "var(--bg)", color: fType === "expense" ? "#DC2626" : "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Expense</button>
            <button onClick={() => { setFType("income"); setFCat("Salary"); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: "2px solid", borderColor: fType === "income" ? "#22C55E" : "var(--border)", background: fType === "income" ? "rgba(34,197,94,0.06)" : "var(--bg)", color: fType === "income" ? "#22C55E" : "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Income</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>Merchant / Description</label>
              <input value={fMerchant} onChange={e => setFMerchant(e.target.value)} placeholder="e.g. Swiggy" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>Amount</label>
              <input type="number" value={fAmount} onChange={e => setFAmount(e.target.value)} placeholder="0" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>Date</label>
            <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 8 }}>Category</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeCats.map(c => {
                const m = getCatMeta(c);
                const sel = fCat === c;
                return (
                  <button key={c} onClick={() => setFCat(c)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: "1px solid", borderColor: sel ? m.color : "var(--border)", background: sel ? `${m.color}0D` : "var(--bg)", cursor: "pointer", transition: "0.15s" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: `${m.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: m.color, flexShrink: 0 }}>{m.icon}</div>
                    <span style={{ fontSize: 11, fontWeight: sel ? 600 : 500, color: sel ? m.color : "var(--text)" }}>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => editId ? handleUpdate(editId) : handleAdd()} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, background: "#22C55E", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{saving ? "Saving..." : editId ? "Update" : "Add Transaction"}</button>
            <button onClick={() => { setShowAdd(false); setEditId(null); resetForm(); }} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--panel-alt)", color: "var(--text)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "48px 20px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="22" height="22" fill="none" stroke="var(--muted)" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" /></svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>{search || typeFilter !== "all" || catFilter !== "all" ? "No transactions match your filters" : "No transactions yet"}</p>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>{search || typeFilter !== "all" || catFilter !== "all" ? "Try adjusting your search or filters" : "Add your first transaction to start tracking."}</p>
        </div>
      ) : (
        <>
          {groups.map(([label, items]) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.08, margin: "0 0 8px", paddingLeft: 2 }}>{label}</p>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                {items.map((t, i) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < items.length - 1 ? "1px solid var(--tx-border)" : "none", transition: "0.1s", cursor: "default" }} className="txn-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <CatIcon category={t.category || "Other"} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.merchant_name || t.category || "Transaction"}</p>
                        <p style={{ fontSize: 11, color: "var(--faint)", margin: "2px 0 0 0" }}>{t.category || "Uncategorized"}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: t.transaction_type === "income" ? "#16A34A" : "var(--text)", margin: 0 }}>{t.transaction_type === "income" ? "+" : "-"}{fmt(Math.abs(Number(t.amount)))}</p>
                      <div style={{ display: "flex", gap: 2 }} className="txn-actions">
                        <button onClick={() => startEdit(t)} style={{ width: 28, height: 28, borderRadius: 6, background: "var(--panel-alt)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(t.id)} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(220,38,38,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {visibleCount < filtered.length && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button onClick={() => setVisibleCount(v => v + 20)} style={{ padding: "8px 20px", borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Load More</button>
            </div>
          )}
        </>
      )}

      <style>{`
        .txn-row:hover { background: var(--panel-alt); }
        .txn-actions { opacity: 0; transition: opacity 0.15s; }
        .txn-row:hover .txn-actions { opacity: 1; }
      `}</style>
    </div>
  );
}