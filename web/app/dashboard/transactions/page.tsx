"use client";

import { useState, useEffect, useRef } from "react";

type AccountType = "bank" | "upi" | "cash" | "card";

type Account = {
  id: string;
  type: AccountType;
  name: string;
  balance: number;
  color: string;
  details: Record<string, string>;
};

type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  merchant: string;
  category: string;
  date: string;
  note: string;
  source: "manual" | "sms" | "csv" | "auto";
  accountId?: string;
  toAccountId?: string;
};

type Profile = { name: string; email: string };

var CATS: Record<string, { color: string; bg: string; icon: string }> = {
  Food: { color: "#F97316", bg: "#FFF7ED", icon: "🍔" },
  Transport: { color: "#3B82F6", bg: "#EFF6FF", icon: "🚗" },
  Shopping: { color: "#A855F7", bg: "#FAF5FF", icon: "🛍" },
  Entertainment: { color: "#EC4899", bg: "#FDF2F8", icon: "🎬" },
  Bills: { color: "#EAB308", bg: "#FEFCE8", icon: "💡" },
  Rent: { color: "#EF4444", bg: "#FEF2F2", icon: "🏠" },
  Health: { color: "#14B8A6", bg: "#F0FDFA", icon: "💊" },
  Education: { color: "#6366F1", bg: "#EEF2FF", icon: "📚" },
  Investment: { color: "#06B6D4", bg: "#ECFEFF", icon: "📈" },
  Salary: { color: "#22C55E", bg: "#F0FDF4", icon: "💰" },
  Transfer: { color: "#8B5CF6", bg: "#FAF5FF", icon: "↔️" },
  Other: { color: "#6B7280", bg: "#F9FAFB", icon: "📦" },
};

function cat(name: string) {
  return CATS[name] || CATS.Other;
}

function fmt(n: number): string {
  var a = Math.abs(n);
  var s = a.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "-" : "") + "$" + s;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function accBadge(type: string): string {
  if (type === "bank") return "🏦";
  if (type === "upi") return "📱";
  if (type === "cash") return "💵";
  if (type === "card") return "💳";
  return "💼";
}

function accGrad(type: string): [string, string] {
  if (type === "bank") return ["#1E3A5F", "#3B82F6"];
  if (type === "upi") return ["#4C1D95", "#8B5CF6"];
  if (type === "cash") return ["#064E3B", "#22C55E"];
  if (type === "card") return ["#7C2D12", "#F97316"];
  return ["#1A1A2E", "#4A4A6A"];
}

function isTf(t: Transaction): boolean {
  return t.merchant.startsWith("Transfer to ") || t.merchant.startsWith("Transfer from ");
}

function detectTx(accounts: Account[]): Transaction[] {
  var res: Transaction[] = [];
  var now = new Date();
  var pool = [
    { m: "Swiggy", c: "Food", lo: 80, hi: 450 },
    { m: "Zomato", c: "Food", lo: 100, hi: 600 },
    { m: "Uber", c: "Transport", lo: 50, hi: 350 },
    { m: "Ola", c: "Transport", lo: 40, hi: 280 },
    { m: "Amazon", c: "Shopping", lo: 200, hi: 3000 },
    { m: "Flipkart", c: "Shopping", lo: 150, hi: 2500 },
    { m: "Netflix", c: "Entertainment", lo: 149, hi: 649 },
    { m: "Spotify", c: "Entertainment", lo: 119, hi: 119 },
    { m: "Electricity Bill", c: "Bills", lo: 800, hi: 2500 },
    { m: "Internet Bill", c: "Bills", lo: 500, hi: 1200 },
    { m: "MedPlus", c: "Health", lo: 50, hi: 800 },
    { m: "Apollo Pharmacy", c: "Health", lo: 100, hi: 1200 },
    { m: "Udemy", c: "Education", lo: 499, hi: 1999 },
    { m: "Groww", c: "Investment", lo: 1000, hi: 10000 },
    { m: "Salary Credit", c: "Salary", lo: 25000, hi: 80000 },
    { m: "Freelance Payment", c: "Salary", lo: 5000, hi: 30000 },
    { m: "Refund", c: "Other", lo: 100, hi: 1500 },
  ];
  if (accounts.length === 0) return res;
  var n = 8 + Math.floor(Math.random() * 12);
  for (var i = 0; i < n; i++) {
    var p = pool[Math.floor(Math.random() * pool.length)];
    var inc = p.c === "Salary" || p.c === "Investment" || p.m === "Refund" || p.m === "Freelance Payment";
    var amt = p.lo + Math.round((Math.random() * (p.hi - p.lo)) * 100) / 100;
    var ago = Math.floor(Math.random() * 30);
    var d = new Date(now.getTime() - ago * 86400000);
    var ds = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    var ac = accounts[Math.floor(Math.random() * accounts.length)];
    res.push({ id: uid(), amount: inc ? amt : -amt, type: inc ? "income" : "expense", merchant: p.m, category: p.c, date: ds, note: "", source: "auto" as "manual" | "sms" | "csv" | "auto", accountId: ac.id });
  }
  res.sort(function (a, b) { return b.date.localeCompare(a.date); });
  return res;
}

function parseStmt(text: string, accounts: Account[]): { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean; accountId: string }[] {
  var out: { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean; accountId: string }[] = [];
  var defId = accounts.length > 0 ? accounts[0].id : "";
  text.trim().split("\n").forEach(function (line) {
    if (!line.trim()) return;
    var l = line.trim();
    var am = l.match(/Rs\.?\s*([\d,]+\.?\d*)/i) || l.match(/INR\s*([\d,]+\.?\d*)/i) || l.match(/\$\s*([\d,]+\.?\d*)/i) || l.match(/([\d,]+\.\d{2})/) || l.match(/([\d,]+)/);
    if (!am) return;
    var amount = parseFloat(am[1].replace(/,/g, ""));
    if (isNaN(amount) || amount === 0) return;
    var isIncome = /CR|Credit|credited|received|deposited|refund|salary|income/i.test(l);
    var dm = l.match(/(\d{4}-\d{2}-\d{2})/) || l.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    var date = dm ? dm[1] : new Date().toISOString().split("T")[0];
    if (date.match(/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/)) { var p = date.split(/[-\/]/); if (p[2].length === 2) p[2] = "20" + p[2]; date = p[2] + "-" + p[1].padStart(2, "0") + "-" + p[0].padStart(2, "0"); }
    var merchant = l.replace(dm ? dm[0] : "", "").replace(am[0], "").replace(/Rs\.?|INR|\$|DR|CR|Debit|Credit|debited|credited|spent|paid|received/gi, "").replace(/[\d\-\/]+/g, "").replace(/[^\w\s]/g, "").trim().substring(0, 24) || "Transaction";
    var ml = merchant.toLowerCase();
    var category = "Other";
    if (ml.includes("swiggy") || ml.includes("zomato") || ml.includes("food") || ml.includes("grocery") || ml.includes("coffee") || ml.includes("restaurant")) category = "Food";
    else if (ml.includes("uber") || ml.includes("ola") || ml.includes("lyft") || ml.includes("fuel") || ml.includes("petrol") || ml.includes("metro")) category = "Transport";
    else if (ml.includes("amazon") || ml.includes("flipkart") || ml.includes("myntra") || ml.includes("walmart") || ml.includes("shop")) category = "Shopping";
    else if (ml.includes("netflix") || ml.includes("spotify") || ml.includes("movie") || ml.includes("gaming")) category = "Entertainment";
    else if (ml.includes("bill") || ml.includes("electricity") || ml.includes("water") || ml.includes("internet")) category = "Bills";
    else if (ml.includes("rent")) category = "Rent";
    else if (ml.includes("hospital") || ml.includes("doctor") || ml.includes("medicine") || ml.includes("health")) category = "Health";
    else if (ml.includes("course") || ml.includes("school") || ml.includes("book") || ml.includes("udemy")) category = "Education";
    else if (ml.includes("stock") || ml.includes("invest") || ml.includes("mutual") || ml.includes("sip")) category = "Investment";
    else if (ml.includes("salary") || ml.includes("freelance") || ml.includes("income")) category = "Salary";
    else if (ml.includes("transfer")) category = "Transfer";
    out.push({ date: date, merchant: merchant, amount: amount, isIncome: isIncome, category: category, selected: true, accountId: defId });
  });
  return out;
}

function DetailView(props: { tx: Transaction; accounts: Account[]; onClose: () => void; onDelete: (id: string) => void }) {
  var tx = props.tx;
  var accounts = props.accounts;
  var c = cat(tx.category);
  var acc = accounts.find(function (a) { return a.id === tx.accountId; }) || null;
  var transfer = isTf(tx);
  var partner: Account | null = null;
  var dir: "out" | "in" = "out";
  if (tx.merchant.startsWith("Transfer to ")) {
    partner = accounts.find(function (a) { return a.name === tx.merchant.replace("Transfer to ", ""); }) || null;
    dir = "out";
  } else if (tx.merchant.startsWith("Transfer from ")) {
    partner = accounts.find(function (a) { return a.name === tx.merchant.replace("Transfer from ", ""); }) || null;
    dir = "in";
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, border: "1px solid " + c.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{c.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: 0 }}>{tx.merchant}</p>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>{tx.date} · {tx.category}</p>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "16px 0", borderRadius: 12, background: tx.type === "income" ? "var(--green-dim)" : "var(--red-dim)", border: "1px solid " + (tx.type === "income" ? "var(--green-border)" : "var(--red-border)"), marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: tx.type === "income" ? "var(--green)" : "var(--red)", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: 0.05 }}>{tx.type === "income" ? "Money In" : "Money Out"}</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: tx.type === "income" ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{tx.type === "income" ? "+" : "-"}{fmt(Math.abs(tx.amount))}</p>
      </div>
      {acc && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, " + accGrad(acc.type)[0] + ", " + accGrad(acc.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{accBadge(acc.type)}</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{acc.name}</p>
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "1px 0 0 0" }}>{acc.type}{acc.details.bankName ? " · " + acc.details.bankName : ""}{acc.details.upiId ? " · " + acc.details.upiId : ""}</p>
          </div>
        </div>
      )}
      {transfer && partner && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, " + accGrad(partner.type)[0] + ", " + accGrad(partner.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{accBadge(partner.type)}</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{dir === "out" ? "Transferred to" : "Received from"} {partner.name}</p>
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "1px 0 0 0" }}>{partner.type}{partner.details.bankName ? " · " + partner.details.bankName : ""}{partner.details.upiId ? " · " + partner.details.upiId : ""}</p>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        <div style={{ padding: "10px", borderRadius: 8, background: "var(--surface)" }}>
          <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 2px 0" }}>Category</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{tx.category}</p>
        </div>
        <div style={{ padding: "10px", borderRadius: 8, background: "var(--surface)" }}>
          <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 2px 0" }}>Source</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{tx.source === "auto" ? "Auto-detected" : tx.source === "csv" ? "Imported" : tx.source === "sms" ? "SMS" : "Manual"}</p>
        </div>
      </div>
      {tx.note && <div style={{ padding: "10px", borderRadius: 8, background: "var(--surface)", marginBottom: 12 }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 2px 0" }}>Note</p><p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>{tx.note}</p></div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={props.onClose} style={{ flex: 1, height: 40, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
        <button onClick={function () { props.onDelete(tx.id); }} style={{ height: 40, padding: "0 18px", borderRadius: 8, background: "transparent", border: "1px solid var(--red-border)", color: "var(--red)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--red)"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--red)"; }}>Delete</button>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  var [txs, setTxs] = useState<Transaction[]>([]);
  var [accounts, setAccounts] = useState<Account[]>([]);
  var [profile, setProfile] = useState<Profile>({ name: "John Doe", email: "john@example.com" });
  var [tab, setTab] = useState<"all" | "income" | "expense" | "transfer">("all");
  var [accFilter, setAccFilter] = useState<string>("all");
  var [q, setQ] = useState("");
  var [showAdd, setShowAdd] = useState(false);
  var [showDetect, setShowDetect] = useState(false);
  var [showImport, setShowImport] = useState(false);
  var [showDetail, setShowDetail] = useState(false);
  var [detailTx, setDetailTx] = useState<Transaction | null>(null);
  var [detecting, setDetecting] = useState(false);
  var [stmtText, setStmtText] = useState("");
  var [parsed, setParsed] = useState<{ date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean; accountId: string }[]>([]);
  var [form, setForm] = useState({ merchant: "", amount: "", type: "expense" as "income" | "expense", category: "Other", date: new Date().toISOString().split("T")[0], note: "", accountId: "" });
  var [toast, setToast] = useState("");
  var [vCount, setVCount] = useState(30);
  var loaderRef = useRef<HTMLDivElement>(null);

  useEffect(function () {
    var t = localStorage.getItem("casha-transactions"); if (t) { try { setTxs(JSON.parse(t)); } catch (e) {} }
    var a = localStorage.getItem("casha-accounts"); if (a) { try { setAccounts(JSON.parse(a)); } catch (e) {} }
    var p = localStorage.getItem("casha-profile"); if (p) { try { setProfile(JSON.parse(p)); } catch (e) {} }
  }, []);
  useEffect(function () { localStorage.setItem("casha-transactions", JSON.stringify(txs)); }, [txs]);
  useEffect(function () { localStorage.setItem("casha-accounts", JSON.stringify(accounts)); }, [accounts]);

  useEffect(function () {
    if (!loaderRef.current) return;
    var ob = new IntersectionObserver(function (es) { if (es[0].isIntersecting) setVCount(function (c) { return c + 30; }); }, { threshold: 0.1 });
    ob.observe(loaderRef.current);
    return function () { ob.disconnect(); };
  }, [txs, tab, accFilter, q]);

  var toast_ = function (m: string) { setToast(m); setTimeout(function () { setToast(""); }, 2500); };

  var now = new Date();
  var ms = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  var mIn = txs.filter(function (t) { return t.type === "income" && t.date.startsWith(ms) && !isTf(t); }).reduce(function (s, t) { return s + t.amount; }, 0);
  var mOut = txs.filter(function (t) { return t.type === "expense" && t.date.startsWith(ms) && !isTf(t); }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);
  var mTf = txs.filter(function (t) { return t.date.startsWith(ms) && isTf(t) && t.type === "expense"; }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);

  var filtered = txs.filter(function (t) {
    if (tab === "income" && t.type !== "income") return false;
    if (tab === "expense" && t.type !== "expense") return false;
    if (tab === "transfer" && !isTf(t)) return false;
    if (accFilter !== "all" && t.accountId !== accFilter) return false;
    if (q) { var lq = q.toLowerCase(); if (t.merchant.toLowerCase().indexOf(lq) === -1 && t.category.toLowerCase().indexOf(lq) === -1 && t.note.toLowerCase().indexOf(lq) === -1) return false; }
    return true;
  });

  var vis = filtered.slice(0, vCount);
  var more = filtered.length > vCount;

  var groups: { label: string; date: string; items: Transaction[] }[] = [];
  var gm: Record<string, Transaction[]> = {};
  vis.forEach(function (t) { if (!gm[t.date]) gm[t.date] = []; gm[t.date].push(t); });
  Object.keys(gm).sort(function (a, b) { return b.localeCompare(a); }).forEach(function (date) {
    var d = new Date(date + "T00:00:00");
    var td = new Date(); td.setHours(0, 0, 0, 0);
    var yd = new Date(td.getTime() - 86400000);
    var label = d.getTime() === td.getTime() ? "Today" : d.getTime() === yd.getTime() ? "Yesterday" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    groups.push({ label: label, date: date, items: gm[date] });
  });

  var doDetect = function () {
    setDetecting(true);
    setTimeout(function () {
      var found = detectTx(accounts);
      setTxs(function (p) { return found.concat(p); });
      setDetecting(false); setShowDetect(false);
      toast_(found.length + " transactions detected");
    }, 2000);
  };

  var doParse = function () { if (!stmtText.trim()) return; setParsed(parseStmt(stmtText, accounts)); };
  var toggleP = function (i: number) { setParsed(function (ps) { return ps.map(function (e, j) { return j === i ? { ...e, selected: !e.selected } : e; }); }); };

  var doImport = function () {
    var sel = parsed.filter(function (e) { return e.selected; });
    var nw: Transaction[] = sel.map(function (e) { return { id: uid(), amount: e.isIncome ? e.amount : -e.amount, type: (e.isIncome ? "income" : "expense") as "income" | "expense", merchant: e.merchant, category: e.category, date: e.date, note: "", source: "csv" as "manual" | "sms" | "csv" | "auto", accountId: e.accountId || undefined }; });
    setTxs(function (p) { return nw.concat(p); });
    setParsed([]); setStmtText(""); setShowImport(false);
    toast_(nw.length + " imported");
  };

  var doAdd = function () {
    var amt = parseFloat(form.amount);
    if (!amt || amt <= 0 || !form.merchant.trim()) return;
    var tx: Transaction = { id: uid(), amount: form.type === "expense" ? -amt : amt, type: form.type, merchant: form.merchant.trim(), category: form.category, date: form.date || new Date().toISOString().split("T")[0], note: form.note, source: "manual" as "manual" | "sms" | "csv" | "auto", accountId: form.accountId || undefined };
    setTxs(function (p) { return [tx, ...p]; });
    setForm({ merchant: "", amount: "", type: "expense", category: "Other", date: new Date().toISOString().split("T")[0], note: "", accountId: "" });
    setShowAdd(false);
    toast_(tx.merchant + " " + (tx.type === "income" ? "+" : "-") + fmt(amt));
  };

  var doDelete = function (id: string) { setTxs(function (p) { return p.filter(function (t) { return t.id !== id; }); }); toast_("Deleted"); setShowDetail(false); setDetailTx(null); };
  var closeDetail = function () { setShowDetail(false); setDetailTx(null); };

  var getAcc = function (id: string | undefined) { if (!id) return null; return accounts.find(function (a) { return a.id === id; }) || null; };

  var tfPartner = function (t: Transaction): { p: Account | null; d: "out" | "in" } {
    if (t.merchant.startsWith("Transfer to ")) { var n = t.merchant.replace("Transfer to ", ""); return { p: accounts.find(function (a) { return a.name === n; }) || null, d: "out" }; }
    if (t.merchant.startsWith("Transfer from ")) { var n2 = t.merchant.replace("Transfer from ", ""); return { p: accounts.find(function (a) { return a.name === n2; }) || null, d: "in" }; }
    return { p: null, d: t.type === "expense" ? "out" : "in" };
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 0 48px" }}>
      {toast && <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "var(--green)", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "inherit", boxShadow: "0 4px 20px rgba(26,143,78,0.3)", animation: "fadeIn 200ms ease" }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", margin: "0 0 4px 0" }}>👋 {profile.name}</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5, margin: "0 0 2px 0" }}>Transactions</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Every money movement — see which account sent or received it.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
        <div style={{ background: "var(--green-dim)", borderRadius: 12, padding: "16px", border: "1px solid var(--green-border)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--green)", textTransform: "uppercase", margin: "0 0 4px 0" }}>Money In</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "var(--green)", margin: 0, fontVariantNumeric: "tabular-nums" }}>+{fmt(mIn)}</p>
        </div>
        <div style={{ background: "var(--red-dim)", borderRadius: 12, padding: "16px", border: "1px solid var(--red-border)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--red)", textTransform: "uppercase", margin: "0 0 4px 0" }}>Money Out</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>-{fmt(mOut)}</p>
        </div>
        <div style={{ background: "#FAF5FF", borderRadius: 12, padding: "16px", border: "1px solid #E9D5FF" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#8B5CF6", textTransform: "uppercase", margin: "0 0 4px 0" }}>Transferred</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#8B5CF6", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(mTf)}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={function () { setShowAdd(true); setForm({ merchant: "", amount: "", type: "expense", category: "Other", date: new Date().toISOString().split("T")[0], note: "", accountId: accounts.length > 0 ? accounts[0].id : "" }); }} style={{ height: 38, padding: "0 16px", borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 12px rgba(26,143,78,0.2)", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>+ Add</button>
        <button onClick={function () { setShowDetect(true); }} style={{ height: 38, padding: "0 16px", borderRadius: 10, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 12px rgba(26,143,78,0.2)", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>🔍 Auto-Detect</button>
        <button onClick={function () { setShowImport(true); setParsed([]); setStmtText(""); }} style={{ height: 38, padding: "0 16px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>📤 Import</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        {[{ k: "all", l: "All" }, { k: "income", l: "Income" }, { k: "expense", l: "Expense" }, { k: "transfer", l: "Transfers" }].map(function (f) {
          var on = tab === f.k;
          return <button key={f.k} onClick={function () { setTab(f.k as "all" | "income" | "expense" | "transfer"); setVCount(30); }} style={{ height: 30, padding: "0 12px", borderRadius: 8, border: "1px solid " + (on ? "var(--green-border)" : "var(--border)"), background: on ? "var(--green-dim)" : "transparent", color: on ? "var(--green)" : "var(--muted)", fontSize: 12, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 120ms ease" }}>{f.l}</button>;
        })}
        {accounts.length > 0 && <select value={accFilter} onChange={function (e) { setAccFilter(e.target.value); setVCount(30); }} style={{ height: 30, padding: "0 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="all">All Accounts</option>
          {accounts.map(function (a) { return <option key={a.id} value={a.id}>{accBadge(a.type)} {a.name}</option>; })}
        </select>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="Search merchant, category, or note..." value={q} onChange={function (e) { setQ(e.target.value); setVCount(30); }} style={{ width: "100%", height: 38, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <p style={{ fontSize: 40, margin: "0 0 8px 0" }}>💳</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0" }}>No transactions yet</p>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px 0" }}>Add one, import a statement, or auto-detect.</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={function () { setShowAdd(true); }} style={{ padding: "10px 18px", borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
            <button onClick={function () { setShowDetect(true); }} style={{ padding: "10px 18px", borderRadius: 10, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>🔍 Auto-Detect</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {groups.map(function (g) {
            var dayNet = g.items.reduce(function (s, t) { return s + (t.type === "income" ? t.amount : t.amount); }, 0);
            return (
              <div key={g.date}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, padding: "0 4px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.04 }}>{g.label}</p>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{g.items.length} txns</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {g.items.map(function (tx) {
                    var c = cat(tx.category);
                    var acc = getAcc(tx.accountId);
                    var tf = isTf(tx);
                    var tp = tf ? tfPartner(tx) : null;
                    return (
                      <div key={tx.id} onClick={function () { setDetailTx(tx); setShowDetail(true); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.background = "var(--green-dim)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: c.bg, border: "1px solid " + c.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.merchant}</p>
                            {tf && <span style={{ fontSize: 8, fontWeight: 700, color: "#8B5CF6", background: "#FAF5FF", padding: "2px 5px", borderRadius: 4, textTransform: "uppercase", flexShrink: 0 }}>Transfer</span>}
                            {tx.source === "auto" && <span style={{ fontSize: 8, fontWeight: 700, color: "var(--green)", background: "var(--green-dim)", padding: "2px 5px", borderRadius: 4, textTransform: "uppercase", flexShrink: 0 }}>Auto</span>}
                            {tx.source === "csv" && <span style={{ fontSize: 8, fontWeight: 700, color: "#3B82F6", background: "#EFF6FF", padding: "2px 5px", borderRadius: 4, textTransform: "uppercase", flexShrink: 0 }}>CSV</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                            {acc && <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 3 }}>{accBadge(acc.type)} {acc.name}</span>}
                            {tf && tp && tp.p && <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 3 }}>→ {accBadge(tp.p.type)} {tp.p.name}</span>}
                            {!acc && !tf && <span style={{ fontSize: 11, color: "var(--muted)" }}>{tx.category}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: tx.type === "income" ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{tx.type === "income" ? "+" : "-"}{fmt(Math.abs(tx.amount))}</p>
                          <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>{tx.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {more && <div ref={loaderRef} style={{ textAlign: "center", padding: "12px 0" }}><p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Loading more...</p></div>}
        </div>
      )}

      {/* DETAIL */}
      {showDetail && detailTx && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", animation: "fadeIn 200ms ease" }} onClick={closeDetail}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <DetailView tx={detailTx} accounts={accounts} onClose={closeDetail} onDelete={doDelete} />
          </div>
        </div>
      )}

      {/* ADD */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowAdd(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 16px 0" }}>Add Transaction</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
              <button onClick={function () { setForm(function (f) { return { ...f, type: "expense" }; }); }} style={{ height: 38, borderRadius: 10, border: "1px solid " + (form.type === "expense" ? "var(--red-border)" : "var(--border)"), background: form.type === "expense" ? "var(--red-dim)" : "transparent", color: form.type === "expense" ? "var(--red)" : "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Expense</button>
              <button onClick={function () { setForm(function (f) { return { ...f, type: "income" }; }); }} style={{ height: 38, borderRadius: 10, border: "1px solid " + (form.type === "income" ? "var(--green-border)" : "var(--border)"), background: form.type === "income" ? "var(--green-dim)" : "transparent", color: form.type === "income" ? "var(--green)" : "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Income</button>
            </div>
            <input type="text" placeholder="Merchant" value={form.merchant} onChange={function (e) { setForm(function (f) { return { ...f, merchant: e.target.value }; }); }} style={{ width: "100%", height: 42, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 8 }} />
            <input type="text" inputMode="decimal" placeholder="Amount" value={form.amount} onChange={function (e) { setForm(function (f) { return { ...f, amount: e.target.value.replace(/[^0-9.]/g, "") }; }); }} style={{ width: "100%", height: 50, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 22, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 8, fontVariantNumeric: "tabular-nums" }} />
            <select value={form.category} onChange={function (e) { setForm(function (f) { return { ...f, category: e.target.value }; }); }} style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 8, cursor: "pointer" }}>
              {["Food", "Transport", "Shopping", "Entertainment", "Bills", "Rent", "Health", "Education", "Investment", "Salary", "Other"].map(function (c) { return <option key={c} value={c}>{c}</option>; })}
            </select>
            <input type="date" value={form.date} onChange={function (e) { setForm(function (f) { return { ...f, date: e.target.value }; }); }} style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 8 }} />
            {accounts.length > 0 && <select value={form.accountId} onChange={function (e) { setForm(function (f) { return { ...f, accountId: e.target.value }; }); }} style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 8, cursor: "pointer" }}>
              <option value="">No account</option>
              {accounts.map(function (a) { return <option key={a.id} value={a.id}>{accBadge(a.type)} {a.name}</option>; })}
            </select>}
            <input type="text" placeholder="Note (optional)" value={form.note} onChange={function (e) { setForm(function (f) { return { ...f, note: e.target.value }; }); }} style={{ width: "100%", height: 38, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowAdd(false); }} style={{ flex: 1, height: 42, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={doAdd} disabled={!form.merchant.trim() || !form.amount} style={{ flex: 1, height: 42, borderRadius: 10, background: form.merchant.trim() && form.amount ? "var(--green)" : "var(--card)", border: "none", color: form.merchant.trim() && form.amount ? "#fff" : "var(--faint)", fontSize: 14, fontWeight: 600, cursor: form.merchant.trim() && form.amount ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* DETECT */}
      {showDetect && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", animation: "fadeIn 200ms ease" }} onClick={function () { if (!detecting) setShowDetect(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)", textAlign: "center" }} onClick={function (e) { e.stopPropagation(); }}>
            <div style={{ fontSize: 48, margin: "0 0 12px 0" }}>{detecting ? "⏳" : "🔍"}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 8px 0" }}>{detecting ? "Detecting..." : "Auto-Detect"}</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 8px 0", lineHeight: 1.5 }}>{detecting ? "Scanning your accounts..." : "We'll scan your connected accounts and find recent transactions."}</p>
            {!detecting && accounts.length === 0 && <p style={{ fontSize: 12, color: "var(--red)", margin: "0 0 12px 0" }}>Add at least one account first.</p>}
            {!detecting && accounts.length > 0 && <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 16px 0" }}>{accounts.length} account{accounts.length > 1 ? "s" : ""}: {accounts.map(function (a) { return a.name; }).join(", ")}</p>}
            {detecting && <div style={{ width: "100%", height: 4, borderRadius: 2, background: "var(--green-dim)", overflow: "hidden", margin: "8px 0 16px" }}><div style={{ width: "60%", height: "100%", borderRadius: 2, background: "var(--green)", animation: "pulse 1.5s ease-in-out infinite" }} /></div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { if (!detecting) setShowDetect(false); }} disabled={detecting} style={{ flex: 1, height: 42, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: detecting ? "var(--faint)" : "var(--muted)", fontSize: 14, fontWeight: 600, cursor: detecting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={doDetect} disabled={detecting || accounts.length === 0} style={{ flex: 1, height: 42, borderRadius: 10, background: detecting || accounts.length === 0 ? "var(--card)" : "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: "none", color: detecting || accounts.length === 0 ? "var(--faint)" : "#fff", fontSize: 14, fontWeight: 600, cursor: detecting || accounts.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{detecting ? "Scanning..." : "Detect Now"}</button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT */}
      {showImport && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowImport(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 8px 0" }}>Import Statement</h2>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px 0" }}>Paste your bank statement or SMS. We auto-detect amounts, names and categories.</p>
            <textarea value={stmtText} onChange={function (e) { setStmtText(e.target.value); setParsed([]); }} placeholder={"15/01/2025 SWIGGY 250.00\n16/01/2025 NETFLIX 15.99\n17/01/2025 SALARY 50000.00 CR"} style={{ width: "100%", height: 80, borderRadius: 10, padding: "12px", fontSize: 12, fontFamily: "monospace", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.5, marginBottom: 8 }} />
            <button onClick={doParse} disabled={!stmtText.trim()} style={{ height: 36, padding: "0 14px", borderRadius: 10, background: stmtText.trim() ? "var(--green)" : "var(--card)", border: "none", color: stmtText.trim() ? "#fff" : "var(--faint)", fontSize: 12, fontWeight: 600, cursor: stmtText.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", marginBottom: 8 }}>Detect Transactions</button>
            {parsed.length > 0 && <div style={{ marginTop: 8 }}><p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>Found {parsed.length}</p><div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8, maxHeight: 200, overflowY: "auto" }}>{parsed.map(function (en, idx) { var c = cat(en.category); return <div key={idx} onClick={function () { toggleP(idx); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: en.selected ? "var(--green-dim)" : "var(--bg)", border: "1px solid " + (en.selected ? "var(--green-border)" : "var(--border)"), cursor: "pointer", opacity: en.selected ? 1 : 0.4, transition: "all 120ms ease" }}><span style={{ fontSize: 14 }}>{c.icon}</span><span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{en.merchant}</span><span style={{ fontSize: 12, fontWeight: 700, color: en.isIncome ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>{en.isIncome ? "+" : "-"}{fmt(en.amount)}</span></div>; })}</div><button onClick={doImport} style={{ height: 36, padding: "0 14px", borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add {parsed.filter(function (e) { return e.selected; }).length}</button></div>}
            <div style={{ marginTop: 8 }}><button onClick={function () { setShowImport(false); }} style={{ width: "100%", height: 36, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close</button></div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
    </div>
  );
}