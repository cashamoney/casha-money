"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  merchant: string;
  category: string;
  date: string;
  note: string;
  source: "manual" | "sms" | "csv";
};

var CATEGORIES = [
  { name: "Food", color: "#F97316", bg: "#FFF7ED" },
  { name: "Transport", color: "#3B82F6", bg: "#EFF6FF" },
  { name: "Shopping", color: "#A855F7", bg: "#FAF5FF" },
  { name: "Entertainment", color: "#EC4899", bg: "#FDF2F8" },
  { name: "Bills", color: "#EAB308", bg: "#FEFCE8" },
  { name: "Rent", color: "#EF4444", bg: "#FEF2F2" },
  { name: "Income", color: "#22C55E", bg: "#F0FDF4" },
  { name: "Investment", color: "#06B6D4", bg: "#ECFEFF" },
  { name: "Health", color: "#14B8A6", bg: "#F0FDFA" },
  { name: "Education", color: "#6366F1", bg: "#EEF2FF" },
  { name: "Other", color: "#6B7280", bg: "#F9FAFB" },
];

function getCat(name: string) {
  return CATEGORIES.find(function (c) { return c.name === name; }) || CATEGORIES[CATEGORIES.length - 1];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatCurrency(n: number) {
  var abs = Math.abs(n);
  var str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "-" : "") + "$" + str;
}

function parseSms(text: string): { amount: number; merchant: string; category: string; date: string } | null {
  var am = text.match(/Rs\.?([\d,]+\.?\d*)/i) || text.match(/INR\s*([\d,]+\.?\d*)/i) || text.match(/\$([\d,]+\.?\d*)/i) || text.match(/([\d,]+\.?\d*)\s*(?:debited|credited|spent|paid)/i);
  if (!am) return null;
  var amount = parseFloat(am[1].replace(/,/g, ""));
  var mm = text.match(/(?:to|at|info[:\s]*|to\s+)([A-Za-z\s]+)/i);
  var merchant = mm ? mm[1].trim().substring(0, 24) : "Unknown";
  var cat = "Other"; var l = text.toLowerCase();
  if (l.includes("swiggy") || l.includes("zomato") || l.includes("food") || l.includes("doordash") || l.includes("restaurant")) cat = "Food";
  else if (l.includes("uber") || l.includes("ola") || l.includes("fuel") || l.includes("petrol") || l.includes("lyft") || l.includes("gas")) cat = "Transport";
  else if (l.includes("netflix") || l.includes("hotstar") || l.includes("spotify") || l.includes("hulu")) cat = "Entertainment";
  else if (l.includes("amazon") || l.includes("flipkart") || l.includes("myntra") || l.includes("target") || l.includes("walmart")) cat = "Shopping";
  else if (l.includes("rent") || l.includes("housing")) cat = "Rent";
  else if (l.includes("electricity") || l.includes("bill") || l.includes("water") || l.includes("utility")) cat = "Bills";
  else if (l.includes("salary") || l.includes("credited") || l.includes("income") || l.includes("received")) cat = "Income";
  var dm = text.match(/(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/) || text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*)/i);
  var date = dm ? dm[1] : new Date().toISOString().split("T")[0];
  return { amount: amount, merchant: merchant, category: cat, date: date };
}

export default function TransactionsPage() {
  var [transactions, setTransactions] = useState<Transaction[]>([]);
  var [showAdd, setShowAdd] = useState(false);
  var [showSms, setShowSms] = useState(false);
  var [showCsv, setShowCsv] = useState(false);
  var [search, setSearch] = useState("");
  var [filterCat, setFilterCat] = useState("All");
  var [filterType, setFilterType] = useState("all");
  var [addForm, setAddForm] = useState({ amount: "", merchant: "", category: "Food", type: "expense" as "income" | "expense", date: new Date().toISOString().split("T")[0], note: "" });
  var [smsText, setSmsText] = useState("");
  var [csvText, setCsvText] = useState("");

  useEffect(function () {
    var saved = localStorage.getItem("casha-transactions");
    if (saved) {
      try { setTransactions(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(function () {
    localStorage.setItem("casha-transactions", JSON.stringify(transactions));
  }, [transactions]);

  var addManual = function () {
    var amt = parseFloat(addForm.amount);
    if (!amt || !addForm.merchant.trim()) return;
    var t: Transaction = {
      id: generateId(), amount: addForm.type === "expense" ? -amt : amt,
      type: addForm.type, merchant: addForm.merchant.trim(),
      category: addForm.type === "income" ? "Income" : addForm.category,
      date: addForm.date, note: addForm.note, source: "manual",
    };
    setTransactions(function (prev) { return [t, ...prev]; });
    setAddForm({ amount: "", merchant: "", category: "Food", type: "expense", date: new Date().toISOString().split("T")[0], note: "" });
    setShowAdd(false);
  };

  var addSms = function () {
    var parsed = parseSms(smsText);
    if (!parsed) return;
    var isIncome = smsText.toLowerCase().includes("credited") || smsText.toLowerCase().includes("received") || smsText.toLowerCase().includes("salary");
    var t: Transaction = {
      id: generateId(), amount: isIncome ? parsed.amount : -parsed.amount,
      type: isIncome ? "income" : "expense", merchant: parsed.merchant,
      category: isIncome ? "Income" : parsed.category,
      date: parsed.date, note: "", source: "sms",
    };
    setTransactions(function (prev) { return [t, ...prev]; });
    setSmsText("");
    setShowSms(false);
  };

  var addCsv = function () {
    var lines = csvText.trim().split("\n");
    var newT: Transaction[] = [];
    lines.forEach(function (line) {
      var parts = line.split(",");
      if (parts.length >= 3) {
        var amt = parseFloat(parts[2].trim().replace(/[^0-9.\-]/g, ""));
        if (!isNaN(amt)) {
          newT.push({
            id: generateId(), amount: amt, type: amt >= 0 ? "income" : "expense",
            merchant: parts[1].trim().substring(0, 24), category: "Other",
            date: parts[0].trim(), note: "", source: "csv",
          });
        }
      }
    });
    if (newT.length > 0) {
      setTransactions(function (prev) { return [...newT, ...prev]; });
      setCsvText("");
      setShowCsv(false);
    }
  };

  var deleteTx = function (id: string) {
    setTransactions(function (prev) { return prev.filter(function (t) { return t.id !== id; }); });
  };

  var filtered = transactions.filter(function (t) {
    if (search && !t.merchant.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== "All" && t.category !== filterCat) return false;
    if (filterType === "income" && t.type !== "income") return false;
    if (filterType === "expense" && t.type !== "expense") return false;
    return true;
  });

  var totalIncome = filtered.filter(function (t) { return t.type === "income"; }).reduce(function (s, t) { return s + t.amount; }, 0);
  var totalExpense = filtered.filter(function (t) { return t.type === "expense"; }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);

  var uniqueCats = ["All", ...Array.from(new Set(transactions.map(function (t) { return t.category; })))];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5, margin: "0 0 4px 0" }}>Transactions</h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>Track your money</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={function () { setShowSms(true); }} style={{ height: 38, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--surface)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            SMS
          </button>
          <button onClick={function () { setShowCsv(true); }} style={{ height: 38, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--surface)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            CSV
          </button>
          <button onClick={function () { setShowAdd(true); }} style={{ height: 38, padding: "0 16px", borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }} className="lp-stats3">
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px 0" }}>Income</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px 0" }}>Expense</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalExpense)}</p>
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px 0" }}>Net</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: totalIncome - totalExpense >= 0 ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalIncome - totalExpense)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: 12 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search transactions..." value={search} onChange={function (e) { setSearch(e.target.value); }}
            style={{ width: "100%", height: 38, padding: "0 12px 0 36px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
        </div>
        <select value={filterType} onChange={function (e) { setFilterType(e.target.value); }}
          style={{ height: 38, padding: "0 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCat} onChange={function (e) { setFilterCat(e.target.value); }}
          style={{ height: 38, padding: "0 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
          {uniqueCats.map(function (c) { return <option key={c} value={c}>{c}</option>; })}
        </select>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", margin: "0 0 6px 0" }}>Where did your money go?</h3>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 20px 0" }}>Log your first transaction to find out.</p>
          <button onClick={function () { setShowAdd(true); }} style={{ padding: "10px 24px", borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add Transaction</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map(function (t) {
            var cat = getCat(t.category);
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)", transition: "all 150ms ease", cursor: "default" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "var(--bg)"; }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: cat.color }}>{t.category.substring(0, 2).toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.merchant}</p>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>{t.category} · {t.date}{t.source !== "manual" ? " · via " + t.source.toUpperCase() : ""}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.type === "income" ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>{t.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(t.amount))}</span>
                  <button onClick={function () { deleteTx(t.id); }} style={{ width: 28, height: 28, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)", transition: "all 150ms ease" }}
                    onMouseEnter={function (e) { e.currentTarget.style.background = "var(--red-dim)"; e.currentTarget.style.color = "var(--red)"; }}
                    onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--faint)"; }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={function () { setShowAdd(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 20px 0" }}>Add Transaction</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["expense", "income"] as const).map(function (tp) {
                return (
                  <button key={tp} onClick={function () { setAddForm(function (f) { return { ...f, type: tp }; }); }}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid " + (addForm.type === tp ? (tp === "income" ? "var(--green-border)" : "var(--red-border)") : "var(--border)"), background: addForm.type === tp ? (tp === "income" ? "var(--green-dim)" : "var(--red-dim)") : "transparent", color: addForm.type === tp ? (tp === "income" ? "var(--green)" : "var(--red)") : "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}>
                    {tp === "income" ? "↑ Income" : "↓ Expense"}
                  </button>
                );
              })}
            </div>
            <input type="text" placeholder="Amount" value={addForm.amount} onChange={function (e) { setAddForm(function (f) { return { ...f, amount: e.target.value }; }); }}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 15, fontWeight: 600, outline: "none", fontFamily: "inherit", marginBottom: 10, fontVariantNumeric: "tabular-nums" }} />
            <input type="text" placeholder="Merchant / Description" value={addForm.merchant} onChange={function (e) { setAddForm(function (f) { return { ...f, merchant: e.target.value }; }); }}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 10 }} />
            {addForm.type === "expense" && (
              <select value={addForm.category} onChange={function (e) { setAddForm(function (f) { return { ...f, category: e.target.value }; }); }}
                style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 10, cursor: "pointer" }}>
                {CATEGORIES.filter(function (c) { return c.name !== "Income"; }).map(function (c) { return <option key={c.name} value={c.name}>{c.name}</option>; })}
              </select>
            )}
            <input type="date" value={addForm.date} onChange={function (e) { setAddForm(function (f) { return { ...f, date: e.target.value }; }); }}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 10 }} />
            <input type="text" placeholder="Note (optional)" value={addForm.note} onChange={function (e) { setAddForm(function (f) { return { ...f, note: e.target.value }; }); }}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowAdd(false); }} style={{ flex: 1, height: 44, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={addManual} style={{ flex: 1, height: 44, borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SMS MODAL ── */}
      {showSms && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={function () { setShowSms(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>Paste Bank SMS</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px 0" }}>Works with any bank, any country.</p>
            <textarea value={smsText} onChange={function (e) { setSmsText(e.target.value); }} placeholder="Rs.2,500.00 debited from A/c XX1234 on 19-04-26. Info: Swiggy."
              style={{ width: "100%", height: 120, borderRadius: 12, padding: "14px", fontSize: 13, fontFamily: "inherit", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.6, marginBottom: 12 }} />
            {smsText.trim() && parseSms(smsText) && (
              <div style={{ background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 0.06 }}>Detected</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Amount: <strong style={{ color: "var(--text)" }}>{formatCurrency(parseSms(smsText)!.amount)}</strong></span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Merchant: <strong style={{ color: "var(--text)" }}>{parseSms(smsText)!.merchant}</strong></span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Category: <strong style={{ color: "var(--green)" }}>{parseSms(smsText)!.category}</strong></span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Date: <strong style={{ color: "var(--text)" }}>{parseSms(smsText)!.date}</strong></span>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowSms(false); }} style={{ flex: 1, height: 44, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={addSms} disabled={!parseSms(smsText)} style={{ flex: 1, height: 44, borderRadius: 10, background: parseSms(smsText) ? "var(--green)" : "var(--card)", border: "none", color: parseSms(smsText) ? "#fff" : "var(--faint)", fontSize: 14, fontWeight: 600, cursor: parseSms(smsText) ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSV MODAL ── */}
      {showCsv && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={function () { setShowCsv(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>Import CSV</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px 0" }}>Format: date, merchant, amount (one per line)</p>
            <textarea value={csvText} onChange={function (e) { setCsvText(e.target.value); }} placeholder={"2026-01-15, Swiggy, -250\n2026-01-14, Salary, 5000\n2026-01-13, Netflix, -15.99"}
              style={{ width: "100%", height: 140, borderRadius: 12, padding: "14px", fontSize: 13, fontFamily: "monospace", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.6, marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowCsv(false); }} style={{ flex: 1, height: 44, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={addCsv} disabled={!csvText.trim()} style={{ flex: 1, height: 44, borderRadius: 10, background: csvText.trim() ? "var(--green)" : "var(--card)", border: "none", color: csvText.trim() ? "#fff" : "var(--faint)", fontSize: 14, fontWeight: 600, cursor: csvText.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .lp-stats3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}