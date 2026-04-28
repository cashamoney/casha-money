"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const EXPENSE_CATS = [
  { value: "Food", label: "Food", color: "#F97316" },
  { value: "Shopping", label: "Shopping", color: "#8B5CF6" },
  { value: "Transport", label: "Transport", color: "#3B82F6" },
  { value: "Bills", label: "Bills", color: "#EAB308" },
  { value: "Entertainment", label: "Fun", color: "#EC4899" },
  { value: "Health", label: "Health", color: "#EF4444" },
  { value: "Education", label: "Education", color: "#6366F1" },
  { value: "Rent", label: "Rent", color: "#F59E0B" },
  { value: "Travel", label: "Travel", color: "#06B6D4" },
  { value: "Groceries", label: "Groceries", color: "#10B981" },
  { value: "Subscriptions", label: "Subs", color: "#A855F7" },
  { value: "Other", label: "Other", color: "#6B7280" },
];

const INCOME_CATS = [
  { value: "Salary", label: "Salary", color: "#22C55E" },
  { value: "Freelance", label: "Freelance", color: "#06B6D4" },
  { value: "Investment", label: "Invest", color: "#10B981" },
  { value: "Interest", label: "Interest", color: "#3B82F6" },
  { value: "Dividend", label: "Dividend", color: "#8B5CF6" },
  { value: "Gift", label: "Gift", color: "#EC4899" },
  { value: "Refund", label: "Refund", color: "#F59E0B" },
  { value: "Rental", label: "Rental", color: "#F97316" },
  { value: "Bonus", label: "Bonus", color: "#6366F1" },
  { value: "Other", label: "Other", color: "#6B7280" },
];

function getCats(type: string) {
  return type === "income" ? INCOME_CATS : EXPENSE_CATS;
}

function getCatAny(v: string) {
  return EXPENSE_CATS.find(c => c.value === v) || INCOME_CATS.find(c => c.value === v) || EXPENSE_CATS[EXPENSE_CATS.length - 1];
}

function CatIcon({ category }: { category: string }) {
  const cat = getCatAny(category);
  const c = cat.color;
  let svg: React.ReactElement;

  switch (category) {
    case "Food":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h18M5 14c0 4 3 7 7 7s7-3 7-7M12 3v2m-3-1l1 2m5-2l-1 2M9 7h6c0 2-1.5 3-3 3S9 9 9 7z" /></svg>;
      break;
    case "Shopping":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h15l-1.5 9h-12zM6 6L5 2H2m4 4l1.5 9m0 0L7 21m10-6l1.5 6M9 20a1 1 0 102 0 1 1 0 00-2 0zm7 0a1 1 0 102 0 1 1 0 00-2 0z" /></svg>;
      break;
    case "Transport":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="15" height="10" rx="2" /><path d="M16 10h4l2 4v4h-6v-4zM5 18a2 2 0 104 0 2 2 0 00-4 0zm12 0a2 2 0 104 0 2 2 0 00-4 0z" /></svg>;
      break;
    case "Bills":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V8l-6-6H9z" /><path d="M9 2v6H5M8 13h8M8 17h5" /></svg>;
      break;
    case "Entertainment":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
      break;
    case "Health":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
      break;
    case "Education":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>;
      break;
    case "Rent":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9" /><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" /></svg>;
      break;
    case "Travel":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>;
      break;
    case "Groceries":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 7v13a2 2 0 002 2h14a2 2 0 002-2V7l-3-5zM3 7h18M16 11a4 4 0 01-8 0" /></svg>;
      break;
    case "Subscriptions":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>;
      break;
    case "Salary":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20M12 4v16M8 14h2M14 14h2M8 17h2M14 17h2" /></svg>;
      break;
    case "Freelance":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;
      break;
    case "Investment":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;
      break;
    case "Interest":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
      break;
    case "Dividend":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83" /><path d="M22 12A10 10 0 0012 2v10z" /></svg>;
      break;
    case "Gift":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M3 12v6a2 2 0 002 2h14a2 2 0 002-2v-6" /><path d="M7.5 8a2.5 2.5 0 014.5-1.5A2.5 2.5 0 0116.5 8" /></svg>;
      break;
    case "Refund":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>;
      break;
    case "Rental":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5l3 3" /></svg>;
      break;
    case "Bonus":
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
      break;
    default:
      svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></svg>;
      break;
  }

  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: c + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {svg}
    </div>
  );
}

function groupByDate(txns: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const groups: { label: string; items: any[] }[] = [];
  const map = new Map<string, any[]>();
  txns.forEach(t => {
    const d = new Date(t.transaction_date);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label: string;
    if (day.getTime() === today.getTime()) label = "Today";
    else if (day.getTime() === yesterday.getTime()) label = "Yesterday";
    else label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (!map.has(label)) { map.set(label, []); groups.push({ label, items: map.get(label)! }); }
    map.get(label)!.push(t);
  });
  return groups;
}

export default function TransactionsPage() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      if (filter !== "all" && t.transaction_type !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(t.merchant_name || "").toLowerCase().includes(s) && !(t.category || "").toLowerCase().includes(s) && !(t.note || "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [txns, filter, search]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const mTx = txns.filter(t => { const d = new Date(t.transaction_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const mInc = mTx.filter(t => t.transaction_type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const mExp = mTx.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const mNet = mInc - mExp;

  const resetForm = () => {
    setMerchant(""); setAmount(""); setCategory("Food"); setTxType("expense"); setTxDate(new Date().toISOString().split("T")[0]); setNote(""); setError(""); setEditId(null);
  };

  const openAdd = () => { resetForm(); setShowForm(true); };

  const openEdit = (t: any) => {
    setEditId(t.id);
    setMerchant(t.merchant_name || "");
    setAmount(String(Math.abs(Number(t.amount))));
    setTxType(t.transaction_type || "expense");
    setCategory(t.category || "Other");
    setTxDate(t.transaction_date ? t.transaction_date.split("T")[0] : new Date().toISOString().split("T")[0]);
    setNote(t.note || "");
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!merchant.trim() || !amount) return;
    setSaving(true); setError("");
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSaving(false); return; }

    if (editId) {
      const { error: err } = await supabase.from("transactions").update({
        merchant_name: merchant.trim(),
        amount: txType === "expense" ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
        transaction_type: txType,
        category,
        transaction_date: txDate,
        note: note.trim(),
      }).eq("id", editId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("transactions").insert({
        user_id: u.user.id,
        merchant_name: merchant.trim(),
        amount: txType === "expense" ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
        transaction_type: txType,
        category,
        transaction_date: txDate,
        note: note.trim(),
      });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    resetForm(); setShowForm(false); setSaving(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id);
    load();
  };

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 22, height: 22, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "xsp 0.6s linear infinite" }} />
      <style>{`@keyframes xsp { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="xw" style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 64px" }}>

        <div className="xh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Transactions</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0 0" }}>Track your income and expenses</p>
          </div>
          <button onClick={openAdd}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#16A34A"}
            onMouseLeave={e => e.currentTarget.style.background = "#22C55E"}>
            <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Transaction
          </button>
        </div>

        <div className="xsum" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.05 }}>Income · {monthLabel}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#22C55E", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(mInc)}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.05 }}>Expense · {monthLabel}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(mExp)}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.05 }}>Net · {monthLabel}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: mNet >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>{mNet >= 0 ? "+" : ""}{fmt(mNet)}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <svg width="14" height="14" fill="none" stroke="var(--muted)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
              style={{ width: "100%", height: 38, borderRadius: 8, padding: "0 12px 0 36px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
              onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
          </div>
          {(["all", "income", "expense"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid " + (filter === f ? "#22C55E" : "var(--border)"), background: filter === f ? "rgba(34,197,94,0.08)" : "var(--card)", color: filter === f ? "#22C55E" : "var(--muted)", fontSize: 12, fontWeight: filter === f ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.1s", textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>

        {groups.length === 0 && txns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px 40px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#22C55E" }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" /></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>No transactions yet</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 18px", maxWidth: 280, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Start tracking your money by adding your first transaction.</p>
            <button onClick={openAdd} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add transaction</button>
          </div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 24px" }}>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No transactions match your search.</p>
          </div>
        ) : (
          groups.map(g => (
            <div key={g.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, padding: "0 2px" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{g.label}</span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(g.items.reduce((s, t) => s + (t.transaction_type === "income" ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount))), 0))}</span>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                {g.items.map((t, i) => {
                  const cat = getCatAny(t.category);
                  const amt = Math.abs(Number(t.amount));
                  const isInc = t.transaction_type === "income";
                  return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < g.items.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <CatIcon category={t.category} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.merchant_name || t.category}</p>
                        <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{cat.label}{t.note ? " · " + t.note : ""}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <button onClick={() => openEdit(t)}
                          style={{ width: 22, height: 22, borderRadius: 4, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "transparent", transition: "color 0.12s", padding: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = "var(--muted)"}
                          onMouseLeave={e => e.currentTarget.style.color = "transparent"}>
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(t.id)}
                          style={{ width: 22, height: 22, borderRadius: 4, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "transparent", transition: "color 0.12s", padding: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                          onMouseLeave={e => e.currentTarget.style.color = "transparent"}>
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <p style={{ fontSize: 13, fontWeight: 700, color: isInc ? "#22C55E" : "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums", paddingLeft: 4 }}>{isInc ? "+" : "-"}{fmt(amt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}
          onClick={() => { setShowForm(false); resetForm(); }}>
          <div className="xm" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>{editId ? "Edit Transaction" : "New Transaction"}</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: "14px 22px 22px" }}>
              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#DC2626", fontWeight: 500 }}>{error}</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 14 }}>
                {(["expense", "income"] as const).map(t => (
                  <button key={t} onClick={() => { setTxType(t); setCategory(getCats(t)[0].value); }}
                    style={{ padding: "8px", borderRadius: 6, border: "1px solid " + (txType === t ? "#22C55E" : "var(--border)"), background: txType === t ? "rgba(34,197,94,0.08)" : "var(--bg)", color: txType === t ? "#22C55E" : "var(--muted)", fontSize: 12, fontWeight: txType === t ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "0.1s", textTransform: "capitalize" }}>
                    {t === "income" ? "+ " : "\u2212 "}{t}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Merchant / Description</label>
                <input type="text" required value={merchant} onChange={e => setMerchant(e.target.value)} placeholder={txType === "income" ? "e.g. Company, Client" : "e.g. Swiggy, Uber"}
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Amount</label>
                <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Category</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {getCats(txType).map(c => (
                    <button key={c.value} onClick={() => setCategory(c.value)}
                      style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid " + (category === c.value ? c.color : "var(--border)"), background: category === c.value ? c.color + "14" : "var(--bg)", color: category === c.value ? c.color : "var(--muted)", fontSize: 11, fontWeight: category === c.value ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "0.1s", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: 5, background: c.color, flexShrink: 0 }} />{c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Date</label>
                <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)}
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Note (optional)</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..."
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <button onClick={handleSave} disabled={saving}
                style={{ width: "100%", height: 40, borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#16A34A"}
                onMouseLeave={e => e.currentTarget.style.background = "#22C55E"}>
                {saving ? "Saving..." : editId ? "Update Transaction" : "Add Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        @keyframes xsp { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .xw { padding: 20px 16px 0 !important; }
          .xh { flex-direction: column !important; align-items: flex-start !important; }
          .xsum { grid-template-columns: 1fr !important; }
          .xm { max-width: 100% !important; }
        }
        @media (max-width: 480px) {
          .xw { padding: 16px 12px 0 !important; }
        }
      `}</style>
    </div>
  );
}