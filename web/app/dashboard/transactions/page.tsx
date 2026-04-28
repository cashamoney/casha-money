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
  const s = 14;
  const icons: Record<string, React.ReactElement> = {
    Food: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
    Shopping: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
    Transport: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
    Bills: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    Entertainment: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>,
    Health: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
    Education: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>,
    Rent: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
    Travel: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>,
    Groceries: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
    Subscriptions: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>,
    Salary: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>,
    Freelance: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>,
    Investment: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
    Interest: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Dividend: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Gift: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
    Refund: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>,
    Rental: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
    Bonus: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
    Other: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
  };
  const icon = icons[category] || icons.Other;
  return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", color: cat.color, flexShrink: 0 }}>
      {icon}
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