"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

const CATS = [
  { name: "Housing/Rent", color: "#6366F1" },
  { name: "Groceries", color: "#22C55E" },
  { name: "Food Delivery", color: "#F97316" },
  { name: "Dining Out", color: "#FB923C" },
  { name: "Transportation", color: "#3B82F6" },
  { name: "EMI Payment", color: "#EF4444" },
  { name: "Entertainment", color: "#EC4899" },
  { name: "Shopping", color: "#A855F7" },
  { name: "Healthcare", color: "#14B8A6" },
  { name: "Education", color: "#8B5CF6" },
  { name: "Subscription", color: "#F43F5E" },
  { name: "Streaming/OTT", color: "#E11D48" },
  { name: "Insurance", color: "#0EA5E9" },
  { name: "Savings", color: "#10B981" },
  { name: "Personal Care", color: "#F472B6" },
  { name: "Gifts & Donations", color: "#C084FC" },
  { name: "Pet Care", color: "#A3E635" },
  { name: "Home Maintenance", color: "#78716C" },
  { name: "Utilities", color: "#FACC15" },
  { name: "Internet & Phone", color: "#38BDF8" },
  { name: "Travel", color: "#2DD4BF" },
  { name: "Fitness", color: "#FB7185" },
  { name: "Baby & Kids", color: "#818CF8" },
  { name: "Clothing", color: "#E879F9" },
  { name: "Salary", color: "#22C55E" },
  { name: "Freelance", color: "#3B82F6" },
  { name: "Investment Returns", color: "#8B5CF6" },
  { name: "Refund", color: "#F97316" },
  { name: "Bonus", color: "#34D399" },
  { name: "Commission", color: "#60A5FA" },
  { name: "Rental Income", color: "#A78BFA" },
  { name: "Dividend", color: "#4ADE80" },
  { name: "Interest Income", color: "#FBBF24" },
  { name: "Gift Received", color: "#F9A8D4" },
  { name: "Cashback", color: "#86EFAC" },
  { name: "Side Hustle", color: "#FB923C" },
  { name: "Consulting", color: "#93C5FD" },
  { name: "Scholarship", color: "#C4B5FD" },
  { name: "Other Income", color: "#64748B" },
  { name: "Other Expense", color: "#64748B" },
];

function getCat(n: string) {
  return CATS.find(function (c) { return c.name === n; }) || CATS[CATS.length - 1];
}

function Av(props: { name: string; color: string; small?: boolean }) {
  var sz = props.small ? 24 : 30;
  var n = props.name;
  var l: string;
  if (n === "Housing/Rent") l = "H";
  else if (n === "Food Delivery") l = "FD";
  else if (n === "EMI Payment") l = "EM";
  else if (n === "Streaming/OTT") l = "ST";
  else if (n === "Other Expense") l = "OT";
  else if (n === "Other Income") l = "OI";
  else if (n === "Investment Returns") l = "IR";
  else if (n === "Interest Income") l = "II";
  else if (n === "Gift Received") l = "GR";
  else if (n === "Rental Income") l = "RI";
  else if (n === "Side Hustle") l = "SH";
  else if (n === "Gifts & Donations") l = "GD";
  else if (n === "Pet Care") l = "PT";
  else if (n === "Home Maintenance") l = "HM";
  else if (n === "Internet & Phone") l = "IP";
  else if (n === "Baby & Kids") l = "BK";
  else if (n === "Dining Out") l = "DO";
  else if (n === "Personal Care") l = "PC";
  else if (n === "All categories") l = "A";
  else l = n.charAt(0);
  return (
    <div style={{
      width: sz, height: sz, borderRadius: 6,
      background: props.color + "12", color: props.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: props.small ? 8 : 11, fontWeight: 700, flexShrink: 0,
      border: "1px solid " + props.color + "18"
    }}>{l}</div>
  );
}

function Drop(props: { value: string; options: string[]; placeholder: string; onChange: (v: string) => void }) {
  var [open, setOpen] = useState(false);
  var sel = getCat(props.value);

  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={function () { setOpen(!open); }}
        style={{
          height: 30, width: "100%", borderRadius: 6, padding: "0 8px",
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--bg)", border: open ? "1px solid " + sel.color + "44" : "1px solid var(--border)",
          color: props.value ? "var(--text)" : "var(--muted)",
          fontSize: 11, fontFamily: "inherit", cursor: "pointer",
          transition: "border-color 0.15s", boxSizing: "border-box", outline: "none"
        }}>
        {props.value ? <Av name={props.value} color={sel.color} small /> : null}
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{props.value || props.placeholder}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open ? (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={function () { setOpen(false); }} />
          <div className="droplist" style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
            marginTop: 2, background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 6, maxHeight: 220, overflowY: "auto",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
          }}>
            {props.options.map(function (c) {
              var cat = getCat(c);
              var isSel = c === props.value;
              return (
                <button key={c} type="button"
                  onClick={function () { props.onChange(c); setOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 10px", width: "100%", border: "none",
                    background: isSel ? cat.color + "0F" : "transparent",
                    color: "var(--text)", fontSize: 11, cursor: "pointer",
                    fontFamily: "inherit", textAlign: "left", transition: "background 0.1s"
                  }}
                  onMouseEnter={function (e) { e.currentTarget.style.background = cat.color + "0F"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.background = isSel ? cat.color + "0F" : "transparent"; }}>
                  <Av name={c} color={cat.color} small />
                  <span style={{ flex: 1 }}>{c}</span>
                  {isSel ? <span style={{ width: 4, height: 4, borderRadius: 2, background: cat.color, flexShrink: 0 }} /> : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

function fmtDate(d: string) {
  var dt = new Date(d + "T00:00:00");
  var t = new Date();
  var y = new Date();
  y.setDate(y.getDate() - 1);
  if (dt.toDateString() === t.toDateString()) return "Today";
  if (dt.toDateString() === y.toDateString()) return "Yesterday";
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

var INCOME_CATS = ["Salary", "Freelance", "Investment Returns", "Refund", "Bonus", "Commission", "Rental Income", "Dividend", "Interest Income", "Gift Received", "Cashback", "Side Hustle", "Consulting", "Scholarship", "Other Income"];
var EXPENSE_CATS = ["Housing/Rent", "Groceries", "Food Delivery", "Dining Out", "Transportation", "EMI Payment", "Entertainment", "Shopping", "Healthcare", "Education", "Subscription", "Streaming/OTT", "Insurance", "Savings", "Personal Care", "Gifts & Donations", "Pet Care", "Home Maintenance", "Utilities", "Internet & Phone", "Travel", "Fitness", "Baby & Kids", "Clothing", "Other Expense"];

export default function TransactionsPage() {
  var [txns, setTxns] = useState<Array<{
    id: string; description: string; amount: number; category: string;
    transaction_type: string; transaction_date: string; account_id: string;
    accounts: Array<{ name: string }> | null;
  }>>([]);
  var [loading, setLoading] = useState(true);
  var [tab, setTab] = useState<"all" | "income" | "expense">("all");
  var [search, setSearch] = useState("");
  var [catFilter, setCatFilter] = useState("");
  var [sort, setSort] = useState<"date" | "amount">("date");
  var [showAdd, setShowAdd] = useState(false);
  var [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);
  var [desc, setDesc] = useState("");
  var [amt, setAmt] = useState("");
  var [cat, setCat] = useState("Groceries");
  var [typ, setTyp] = useState<"income" | "expense">("expense");
  var [dt, setDt] = useState(new Date().toISOString().split("T")[0]);
  var [accId, setAccId] = useState("");
  var [submitting, setSubmitting] = useState(false);
  var [added, setAdded] = useState(false);
  var [err, setErr] = useState("");

  useEffect(function () { load(); }, []);

  var load = async function () {
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    var uid = u.user.id;
    var { data: aData } = await supabase.from("accounts").select("id, name").eq("user_id", uid);
    setAccounts((aData || []) as Array<{ id: string; name: string }>);
    if (aData && aData.length > 0 && !accId) { setAccId(aData[0].id); }
    var { data: tData } = await supabase
      .from("transactions")
      .select("id, description, amount, category, transaction_type, transaction_date, account_id, accounts(name)")
      .eq("user_id", uid)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });
    setTxns((tData || []) as typeof txns);
    setLoading(false);
  };

  var submit = async function () {
    setErr("");
    if (!desc.trim()) { setErr("Enter a description."); return; }
    if (!amt || Number(amt) <= 0) { setErr("Enter a valid amount."); return; }
    if (!accId) { setErr("Select an account."); return; }
    setSubmitting(true);
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSubmitting(false); return; }
    var a = typ === "expense" ? -Math.abs(Number(amt)) : Math.abs(Number(amt));
    var { error } = await supabase.from("transactions").insert({
      user_id: u.user.id, description: desc.trim(), amount: a,
      category: cat, transaction_type: typ, transaction_date: dt, account_id: accId,
    });
    setSubmitting(false);
    if (error) { setErr("Failed to add. Try again."); return; }
    setAdded(true);
    setTimeout(function () { setAdded(false); setShowAdd(false); }, 1500);
    setDesc(""); setAmt(""); setCat(typ === "income" ? "Salary" : "Groceries");
    setDt(new Date().toISOString().split("T")[0]);
    load();
  };

  var filtered = useMemo(function () {
    var f = [...txns];
    if (tab === "income") f = f.filter(function (t) { return t.transaction_type === "income"; });
    if (tab === "expense") f = f.filter(function (t) { return t.transaction_type === "expense"; });
    if (search.trim()) {
      var s = search.toLowerCase();
      f = f.filter(function (t) { return (t.description || "").toLowerCase().indexOf(s) >= 0 || (t.category || "").toLowerCase().indexOf(s) >= 0; });
    }
    if (catFilter) f = f.filter(function (t) { return t.category === catFilter; });
    if (sort === "date") f.sort(function (a, b) { return b.transaction_date.localeCompare(a.transaction_date); });
    else f.sort(function (a, b) { return Math.abs(b.amount) - Math.abs(a.amount); });
    return f;
  }, [txns, tab, search, catFilter, sort]);

  var totalIn = txns.filter(function (t) { return t.transaction_type === "income"; }).reduce(function (s, t) { return s + Math.abs(Number(t.amount)); }, 0);
  var totalOut = txns.filter(function (t) { return t.transaction_type === "expense"; }).reduce(function (s, t) { return s + Math.abs(Number(t.amount)); }, 0);
  var net = totalIn - totalOut;

  var grouped = useMemo(function () {
    var g: Array<{ label: string; items: typeof txns }> = [];
    var cur = "";
    filtered.forEach(function (t) {
      var l = fmtDate(t.transaction_date);
      if (l !== cur) { cur = l; g.push({ label: l, items: [] }); }
      g[g.length - 1].items.push(t);
    });
    return g;
  }, [filtered]);

  var activeCats = useMemo(function () {
    var s = new Set<string>();
    txns.forEach(function (t) { if (t.category) s.add(t.category); });
    return Array.from(s).sort();
  }, [txns]);

  var catList = typ === "income" ? INCOME_CATS : EXPENSE_CATS;

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "sp 0.6s linear infinite" }} />
      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bw" style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Header */}
        <div className="bh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Transactions</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "2px 0 0 0" }}>Track every rupee in and out</p>
          </div>
          <button onClick={function () { setShowAdd(!showAdd); setErr(""); }}
            style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s", display: "flex", alignItems: "center", gap: 5 }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "#16A34A"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "#22C55E"; }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add
          </button>
        </div>

        {/* Add Form */}
        {showAdd ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>New Transaction</p>
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              <button onClick={function () { setTyp("expense"); setCat("Groceries"); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: typ === "expense" ? "1px solid rgba(239,68,68,0.25)" : "1px solid var(--border)", background: typ === "expense" ? "rgba(239,68,68,0.06)" : "transparent", color: typ === "expense" ? "#EF4444" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
                Expense
              </button>
              <button onClick={function () { setTyp("income"); setCat("Salary"); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: typ === "income" ? "1px solid rgba(34,197,94,0.25)" : "1px solid var(--border)", background: typ === "income" ? "rgba(34,197,94,0.06)" : "transparent", color: typ === "income" ? "#22C55E" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
                Income
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <input placeholder="Description" value={desc} onChange={function (e) { setDesc(e.target.value); }}
                style={{ height: 34, borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%" }} />
              <input type="number" placeholder="Amount" value={amt} onChange={function (e) { setAmt(e.target.value); }}
                style={{ height: 34, borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", fontVariantNumeric: "tabular-nums" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <Drop key={typ} value={cat} options={catList} placeholder="Category" onChange={function (v) { setCat(v); }} />
              <input type="date" value={dt} onChange={function (e) { setDt(e.target.value); }}
                style={{ height: 30, borderRadius: 6, padding: "0 8px", fontSize: 11, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%" }} />
              <select value={accId} onChange={function (e) { setAccId(e.target.value); }}
                style={{ height: 30, borderRadius: 6, padding: "0 8px", fontSize: 11, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%" }}>
                {accounts.map(function (a) { return <option key={a.id} value={a.id}>{a.name}</option>; })}
              </select>
            </div>
            {err ? <p style={{ fontSize: 11, color: "#EF4444", margin: "0 0 8px", fontWeight: 500 }}>{err}</p> : null}
            <button onClick={submit} disabled={submitting}
              style={{ width: "100%", height: 36, borderRadius: 6, border: "none", background: added ? "#16A34A" : "#22C55E", color: "#fff", fontSize: 12, fontWeight: 600, cursor: submitting ? "wait" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1, transition: "background 0.15s" }}
              onMouseEnter={function (e) { if (!submitting && !added) e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = added ? "#16A34A" : "#22C55E"; }}>
              {submitting ? "Adding..." : added ? "Added" : "Add Transaction"}
            </button>
          </div>
        ) : null}

        {txns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px 40px" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>No transactions yet</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px", maxWidth: 280, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Add your first transaction to start tracking your money.</p>
            <button onClick={function () { setShowAdd(true); }}
              style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "#22C55E"; }}>
              Add Transaction
            </button>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: net >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                {net >= 0 ? "" : "-"}{fmt(Math.abs(net))}
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0 0" }}>net cash flow</p>
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                <div>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: "#22C55E", display: "inline-block", marginRight: 4 }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Income </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#22C55E", fontVariantNumeric: "tabular-nums" }}>{fmt(totalIn)}</span>
                </div>
                <div>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: "#EF4444", display: "inline-block", marginRight: 4 }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Expense </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444", fontVariantNumeric: "tabular-nums" }}>{fmt(totalOut)}</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder="Search..." value={search} onChange={function (e) { setSearch(e.target.value); }}
                style={{ height: 30, borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: 140, transition: "border-color 0.15s" }}
                onFocus={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)"; }}
                onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
              {activeCats.length > 1 ? (
                <div style={{ width: 160 }}>
                  <Drop value={catFilter} options={["All categories"].concat(activeCats)} placeholder="All categories" onChange={function (v) { setCatFilter(v === "All categories" ? "" : v); }} />
                </div>
              ) : null}
              <select value={sort} onChange={function (e) { setSort(e.target.value as "date" | "amount"); }}
                style={{ height: 30, borderRadius: 6, padding: "0 8px", fontSize: 11, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", marginLeft: "auto" }}>
                <option value="date">By date</option>
                <option value="amount">By amount</option>
              </select>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 8, borderBottom: "1px solid var(--border)" }}>
              <button onClick={function () { setTab("all"); }}
                style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0", border: "none", background: tab === "all" ? "var(--card)" : "transparent", color: tab === "all" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: tab === "all" ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.15s", borderBottom: tab === "all" ? "2px solid #22C55E" : "2px solid transparent", marginBottom: -1 }}>
                All
              </button>
              <button onClick={function () { setTab("income"); }}
                style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0", border: "none", background: tab === "income" ? "var(--card)" : "transparent", color: tab === "income" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: tab === "income" ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.15s", borderBottom: tab === "income" ? "2px solid #22C55E" : "2px solid transparent", marginBottom: -1 }}>
                Income
              </button>
              <button onClick={function () { setTab("expense"); }}
                style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0", border: "none", background: tab === "expense" ? "var(--card)" : "transparent", color: tab === "expense" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: tab === "expense" ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.15s", borderBottom: tab === "expense" ? "2px solid #22C55E" : "2px solid transparent", marginBottom: -1 }}>
                Expense
              </button>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No transactions found</p>
              </div>
            ) : (
              <div style={{ paddingTop: 6 }}>
                {grouped.map(function (g) {
                  var dayNet = g.items.reduce(function (s, t) {
                    return s + (t.transaction_type === "income" ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount)));
                  }, 0);
                  return (
                    <div key={g.label}>
                      <div style={{ padding: "8px 12px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.03 }}>{g.label}</span>
                        <span style={{ fontSize: 10, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(dayNet)}</span>
                      </div>
                      {g.items.map(function (t) {
                        var c = getCat(t.category);
                        var isInc = t.transaction_type === "income";
                        var a = Math.abs(Number(t.amount));
                        var acct = t.accounts && t.accounts[0] ? t.accounts[0].name : "";
                        return (
                          <div key={t.id} style={{ padding: "9px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 10, transition: "background 0.1s", cursor: "default" }}
                            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; }}
                            onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
                            <Av name={t.category || "Other Expense"} color={c.color} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description || t.category}</p>
                              <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{t.category}{acct ? " · " + acct : ""}</p>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: isInc ? "#22C55E" : "#EF4444", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                              {isInc ? "+" : "-"}{fmt(a)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ padding: "12px 12px 0", borderTop: "1px solid var(--border)", marginTop: 8 }}>
              <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}{catFilter ? " in " + catFilter : ""}{tab !== "all" ? " · " + tab : ""}
              </p>
            </div>
          </>
        )}
      </div>

      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
      <style>{"@media(max-width:640px){.bh{flex-direction:column!important;align-items:flex-start!important}}"}</style>
      <style>{".droplist::-webkit-scrollbar{width:4px}.droplist::-webkit-scrollbar-track{background:transparent}.droplist::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}"}</style>
    </div>
  );
}