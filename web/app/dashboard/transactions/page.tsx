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

type TransferRecord = {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
};

type Profile = { name: string; email: string };

type SortOption = "newest" | "oldest" | "highest" | "lowest" | "merchant";
type DatePreset = "all" | "today" | "yesterday" | "week" | "month" | "30days" | "custom";

var CAT_MAP: Record<string, { color: string; bg: string; label: string }> = {
  Food: { color: "#F97316", bg: "#FFF7ED", label: "FD" },
  Transport: { color: "#3B82F6", bg: "#EFF6FF", label: "TR" },
  Shopping: { color: "#A855F7", bg: "#FAF5FF", label: "SH" },
  Entertainment: { color: "#EC4899", bg: "#FDF2F8", label: "EN" },
  Bills: { color: "#EAB308", bg: "#FEFCE8", label: "BL" },
  Rent: { color: "#EF4444", bg: "#FEF2F2", label: "RN" },
  Health: { color: "#14B8A6", bg: "#F0FDFA", label: "HT" },
  Education: { color: "#6366F1", bg: "#EEF2FF", label: "ED" },
  Investment: { color: "#06B6D4", bg: "#ECFEFF", label: "IV" },
  Salary: { color: "#22C55E", bg: "#F0FDF4", label: "SA" },
  Transfer: { color: "#8B5CF6", bg: "#FAF5FF", label: "TF" },
  Other: { color: "#6B7280", bg: "#F9FAFB", label: "OT" },
};

var CAT_LIST = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Rent", "Health", "Education", "Investment", "Salary", "Transfer", "Other"];

function getCatInfo(name: string): { color: string; bg: string; label: string } {
  return CAT_MAP[name] || { color: "#6B7280", bg: "#F9FAFB", label: "OT" };
}

function formatCurrency(n: number): string {
  var abs = Math.abs(n);
  var str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "-" : "") + "$" + str;
}

function getIcon(type: string): string {
  if (type === "bank") return "BK";
  if (type === "upi") return "UP";
  if (type === "cash") return "CA";
  if (type === "card") return "CD";
  return "AC";
}

function getGrad(type: string): [string, string] {
  if (type === "bank") return ["#1E3A5F", "#3B82F6"];
  if (type === "upi") return ["#4C1D95", "#8B5CF6"];
  if (type === "cash") return ["#064E3B", "#22C55E"];
  if (type === "card") return ["#7C2D12", "#F97316"];
  return ["#1A1A2E", "#4A4A6A"];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function toDateStr(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function getDateRange(preset: DatePreset, customFrom: string, customTo: string): { from: string; to: string } {
  var now = new Date();
  var today = toDateStr(now);
  var from = "";
  var to = today;
  if (preset === "today") { from = today; to = today; }
  else if (preset === "yesterday") { var y = new Date(now.getTime() - 86400000); from = toDateStr(y); to = toDateStr(y); }
  else if (preset === "week") { var w = new Date(now.getTime() - now.getDay() * 86400000); from = toDateStr(w); }
  else if (preset === "month") { from = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-01"; }
  else if (preset === "30days") { var d30 = new Date(now.getTime() - 29 * 86400000); from = toDateStr(d30); }
  else if (preset === "custom") { from = customFrom; to = customTo; }
  else { from = ""; to = ""; }
  return { from: from, to: to };
}

function autoDetectTransactions(accounts: Account[]): Transaction[] {
  var results: Transaction[] = [];
  var now = new Date();
  var merchants = [
    { name: "Swiggy", cat: "Food", min: 80, max: 450 },
    { name: "Zomato", cat: "Food", min: 100, max: 600 },
    { name: "Uber", cat: "Transport", min: 50, max: 350 },
    { name: "Ola", cat: "Transport", min: 40, max: 280 },
    { name: "Amazon", cat: "Shopping", min: 200, max: 3000 },
    { name: "Flipkart", cat: "Shopping", min: 150, max: 2500 },
    { name: "Netflix", cat: "Entertainment", min: 149, max: 649 },
    { name: "Spotify", cat: "Entertainment", min: 119, max: 119 },
    { name: "Electricity Bill", cat: "Bills", min: 800, max: 2500 },
    { name: "Internet Bill", cat: "Bills", min: 500, max: 1200 },
    { name: "MedPlus", cat: "Health", min: 50, max: 800 },
    { name: "Apollo Pharmacy", cat: "Health", min: 100, max: 1200 },
    { name: "Udemy", cat: "Education", min: 499, max: 1999 },
    { name: "Groww", cat: "Investment", min: 1000, max: 10000 },
    { name: "Salary Credit", cat: "Salary", min: 25000, max: 80000 },
    { name: "Freelance Payment", cat: "Salary", min: 5000, max: 30000 },
    { name: "Refund", cat: "Other", min: 100, max: 1500 },
  ];
  if (accounts.length === 0) return results;
  var count = 8 + Math.floor(Math.random() * 12);
  for (var i = 0; i < count; i++) {
    var m = merchants[Math.floor(Math.random() * merchants.length)];
    var isIncome = m.cat === "Salary" || m.cat === "Investment" || m.name === "Refund" || m.name === "Freelance Payment";
    var amount = m.min + Math.round((Math.random() * (m.max - m.min)) * 100) / 100;
    var daysAgo = Math.floor(Math.random() * 30);
    var d = new Date(now.getTime() - daysAgo * 86400000);
    var date = toDateStr(d);
    var acc = accounts[Math.floor(Math.random() * accounts.length)];
    results.push({ id: generateId(), amount: isIncome ? amount : -amount, type: isIncome ? "income" : "expense", merchant: m.name, category: m.cat, date: date, note: "", source: "auto" as "manual" | "sms" | "csv" | "auto", accountId: acc.id });
  }
  results.sort(function (a, b) { return b.date.localeCompare(a.date); });
  return results;
}

function parseSms(text: string, accounts: Account[]): { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean; accountId: string }[] {
  var out: { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean; accountId: string }[] = [];
  var defId = accounts.length > 0 ? accounts[0].id : "";
  text.trim().split("\n").forEach(function (line) {
    if (!line.trim()) return;
    var l = line.trim();
    var am = l.match(/Rs\.?\s*([\d,]+\.?\d*)/i) || l.match(/INR\s*([\d,]+\.?\d*)/i) || l.match(/\$\s*([\d,]+\.?\d*)/i) || l.match(/([\d,]+\.\d{2})/) || l.match(/([\d,]+)/);
    if (!am) return;
    var amount = parseFloat(am[1].replace(/,/g, ""));
    if (isNaN(amount) || amount === 0) return;
    var isIncome = /credit|credited|received|deposited|refund|salary|CR/i.test(l);
    var dm = l.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/) || l.match(/(\d{4}-\d{2}-\d{2})/);
    var date = dm ? dm[1] : new Date().toISOString().split("T")[0];
    if (date.match(/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/)) { var p = date.split(/[-\/]/); if (p[2].length === 2) p[2] = "20" + p[2]; date = p[2] + "-" + p[1].padStart(2, "0") + "-" + p[0].padStart(2, "0"); }
    var merchant = l.replace(dm ? dm[0] : "", "").replace(am[0], "").replace(/Rs\.?|INR|\$|DR|CR|Debit|Credit|debited|credited|spent|paid|received|UPI|ref|no|txn|from|to|A\/C|acct|account|on|at|via|using|card|ending/gi, "").replace(/[\d\-\/]+/g, "").replace(/[^\w\s]/g, "").trim().substring(0, 24) || "SMS Transaction";
    var ml = merchant.toLowerCase();
    var cat = "Other";
    if (ml.includes("swiggy") || ml.includes("zomato") || ml.includes("food") || ml.includes("grocery") || ml.includes("coffee")) cat = "Food";
    else if (ml.includes("uber") || ml.includes("ola") || ml.includes("fuel") || ml.includes("petrol")) cat = "Transport";
    else if (ml.includes("amazon") || ml.includes("flipkart") || ml.includes("shop")) cat = "Shopping";
    else if (ml.includes("netflix") || ml.includes("spotify") || ml.includes("movie")) cat = "Entertainment";
    else if (ml.includes("bill") || ml.includes("electricity") || ml.includes("water")) cat = "Bills";
    else if (ml.includes("rent")) cat = "Rent";
    else if (ml.includes("hospital") || ml.includes("doctor") || ml.includes("medicine")) cat = "Health";
    else if (ml.includes("salary") || ml.includes("income") || ml.includes("freelance")) cat = "Salary";
    out.push({ date: date, merchant: merchant, amount: amount, isIncome: isIncome, category: cat, selected: true, accountId: defId });
  });
  return out;
}

function parseCsv(text: string, accounts: Account[]): { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean; accountId: string }[] {
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
    var merchant = l.replace(dm ? dm[0] : "", "").replace(am[0], "").replace(/Rs\.?|INR|\$|DR|CR|Debit|Credit|debited|credited|spent|paid|received/gi, "").replace(/[\d\-\/]+/g, "").replace(/[^\w\s]/g, "").trim().substring(0, 24) || "CSV Transaction";
    var ml = merchant.toLowerCase();
    var cat = "Other";
    if (ml.includes("swiggy") || ml.includes("zomato") || ml.includes("food") || ml.includes("grocery") || ml.includes("coffee")) cat = "Food";
    else if (ml.includes("uber") || ml.includes("ola") || ml.includes("fuel") || ml.includes("petrol")) cat = "Transport";
    else if (ml.includes("amazon") || ml.includes("flipkart") || ml.includes("shop")) cat = "Shopping";
    else if (ml.includes("netflix") || ml.includes("spotify") || ml.includes("movie")) cat = "Entertainment";
    else if (ml.includes("bill") || ml.includes("electricity") || ml.includes("water")) cat = "Bills";
    else if (ml.includes("rent")) cat = "Rent";
    else if (ml.includes("hospital") || ml.includes("doctor") || ml.includes("medicine")) cat = "Health";
    else if (ml.includes("salary") || ml.includes("freelance") || ml.includes("income")) cat = "Salary";
    out.push({ date: date, merchant: merchant, amount: amount, isIncome: isIncome, category: cat, selected: true, accountId: defId });
  });
  return out;
}

function DetailContent(props: { tx: Transaction; accounts: Account[]; onClose: () => void; onDelete: (id: string) => void }) {
  var tx = props.tx;
  var ci = getCatInfo(tx.category);
  var acc = props.accounts.find(function (a) { return a.id === tx.accountId; }) || null;
  var isTf = tx.merchant.startsWith("Transfer to ") || tx.merchant.startsWith("Transfer from ");
  var tfPartner: Account | null = null;
  var tfDir: "out" | "in" = "out";
  if (tx.merchant.startsWith("Transfer to ")) { tfPartner = props.accounts.find(function (a) { return a.name === tx.merchant.replace("Transfer to ", ""); }) || null; tfDir = "out"; }
  else if (tx.merchant.startsWith("Transfer from ")) { tfPartner = props.accounts.find(function (a) { return a.name === tx.merchant.replace("Transfer from ", ""); }) || null; tfDir = "in"; }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: ci.bg, border: "1px solid " + ci.color + "25", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 14, fontWeight: 800, color: ci.color }}>{ci.label}</span></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }}>{tx.merchant}</p>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>{tx.date} {isTf ? "\u00B7 Transfer" : "\u00B7 " + tx.category}</p>
        </div>
      </div>
      <div style={{ textAlign: "center", marginBottom: 14, padding: "14px 0", borderRadius: 10, background: tx.type === "income" ? "var(--green-dim)" : "var(--red-dim)", border: "1px solid " + (tx.type === "income" ? "var(--green-border)" : "var(--red-border)") }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: tx.type === "income" ? "var(--green)" : "var(--red)", margin: "0 0 2px 0", textTransform: "uppercase" }}>{tx.type === "income" ? "Money In" : "Money Out"}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: tx.type === "income" ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{tx.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}</p>
      </div>
      {acc && (<div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 8 }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 6px 0" }}>Account</p><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, " + getGrad(acc.type)[0] + ", " + getGrad(acc.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{getIcon(acc.type)}</span></div><div><p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{acc.name}</p><p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{acc.type} {acc.details.bankName ? "\u00B7 " + acc.details.bankName : ""} {acc.details.upiId ? "\u00B7 " + acc.details.upiId : ""}</p></div></div></div>)}
      {isTf && tfPartner && (<div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 8 }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 6px 0" }}>{tfDir === "out" ? "Transferred To" : "Received From"}</p><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, " + getGrad(tfPartner.type)[0] + ", " + getGrad(tfPartner.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{getIcon(tfPartner.type)}</span></div><div><p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{tfPartner.name}</p><p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{tfPartner.type} {tfPartner.details.bankName ? "\u00B7 " + tfPartner.details.bankName : ""} {tfPartner.details.upiId ? "\u00B7 " + tfPartner.details.upiId : ""}</p></div></div></div>)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 12 }}>
        <div style={{ padding: "8px 10px", borderRadius: 6, background: "var(--surface)" }}><span style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Category</span><p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "2px 0 0 0" }}>{tx.category}</p></div>
        <div style={{ padding: "8px 10px", borderRadius: 6, background: "var(--surface)" }}><span style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Source</span><p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "2px 0 0 0" }}>{tx.source === "auto" ? "Auto-detected" : tx.source === "csv" ? "CSV Import" : tx.source === "sms" ? "SMS Parse" : "Manual"}</p></div>
      </div>
      {tx.note && <div style={{ padding: "8px 10px", borderRadius: 6, background: "var(--surface)", marginBottom: 12 }}><span style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Note</span><p style={{ fontSize: 12, color: "var(--text)", margin: "2px 0 0 0" }}>{tx.note}</p></div>}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={props.onClose} style={{ flex: 1, height: 36, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
        <button onClick={function () { props.onDelete(tx.id); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "transparent", border: "1px solid var(--red-border)", color: "var(--red)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--red)"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--red)"; }}>Delete</button>
      </div>
    </div>
  );
}

function Dropdown(props: { open: boolean; onToggle: () => void; label: string; value: string; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={props.onToggle} style={{ height: 30, padding: "0 10px", borderRadius: 6, border: "1px solid " + (props.open ? "var(--green-border)" : "var(--border)"), background: props.open ? "var(--green-dim)" : "var(--surface)", color: props.open ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "all 150ms ease", whiteSpace: "nowrap" }}>
        {props.label}: {props.value}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transition: "transform 200ms ease", transform: props.open ? "rotate(180deg)" : "rotate(0deg)" }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {props.open && (
        <div style={{ position: "absolute", top: 34, left: 0, zIndex: 40, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 6, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, animation: "fadeIn 150ms ease" }}>
          {props.children}
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  var [transactions, setTransactions] = useState<Transaction[]>([]);
  var [accounts, setAccounts] = useState<Account[]>([]);
  var [transfers, setTransfers] = useState<TransferRecord[]>([]);
  var [profile, setProfile] = useState<Profile>({ name: "John Doe", email: "john@example.com" });
  var [filter, setFilter] = useState<"all" | "income" | "expense" | "transfer">("all");
  var [filterAccount, setFilterAccount] = useState<string>("all");
  var [filterCategory, setFilterCategory] = useState<string>("all");
  var [sortOption, setSortOption] = useState<SortOption>("newest");
  var [datePreset, setDatePreset] = useState<DatePreset>("all");
  var [customFrom, setCustomFrom] = useState(toDateStr(new Date()));
  var [customTo, setCustomTo] = useState(toDateStr(new Date()));
  var [searchQuery, setSearchQuery] = useState("");
  var [showAdd, setShowAdd] = useState(false);
  var [showDetect, setShowDetect] = useState(false);
  var [showImport, setShowImport] = useState(false);
  var [importMode, setImportMode] = useState<"sms" | "csv">("sms");
  var [showDetail, setShowDetail] = useState(false);
  var [detailTx, setDetailTx] = useState<Transaction | null>(null);
  var [detecting, setDetecting] = useState(false);
  var [statementText, setStatementText] = useState("");
  var [parsedEntries, setParsedEntries] = useState<{ date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean; accountId: string }[]>([]);
  var [addForm, setAddForm] = useState({ merchant: "", amount: "", type: "expense" as "income" | "expense", category: "Other", date: new Date().toISOString().split("T")[0], note: "", accountId: "" });
  var [toast, setToast] = useState("");
  var [visibleCount, setVisibleCount] = useState(30);
  var [openSort, setOpenSort] = useState(false);
  var [openCat, setOpenCat] = useState(false);
  var [openDate, setOpenDate] = useState(false);
  var loaderRef = useRef<HTMLDivElement>(null);

  useEffect(function () {
    var t = localStorage.getItem("casha-transactions"); if (t) { try { setTransactions(JSON.parse(t)); } catch (e) {} }
    var a = localStorage.getItem("casha-accounts"); if (a) { try { setAccounts(JSON.parse(a)); } catch (e) {} }
    var tr = localStorage.getItem("casha-transfers"); if (tr) { try { setTransfers(JSON.parse(tr)); } catch (e) {} }
    var p = localStorage.getItem("casha-profile"); if (p) { try { setProfile(JSON.parse(p)); } catch (e) {} }
  }, []);

  useEffect(function () { localStorage.setItem("casha-transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(function () { localStorage.setItem("casha-accounts", JSON.stringify(accounts)); }, [accounts]);
  useEffect(function () { localStorage.setItem("casha-transfers", JSON.stringify(transfers)); }, [transfers]);

  useEffect(function () {
    if (!loaderRef.current) return;
    var obs = new IntersectionObserver(function (entries) { if (entries[0].isIntersecting) setVisibleCount(function (c) { return c + 30; }); }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return function () { obs.disconnect(); };
  }, [transactions, filter, filterAccount, filterCategory, sortOption, datePreset, customFrom, customTo, searchQuery]);

  useEffect(function () {
    var handler = function () { setOpenSort(false); setOpenCat(false); setOpenDate(false); };
    document.addEventListener("click", handler);
    return function () { document.removeEventListener("click", handler); };
  }, []);

  var showToast = function (msg: string) { setToast(msg); setTimeout(function () { setToast(""); }, 2500); };
  var getAccount = function (id: string | undefined): Account | null { if (!id) return null; return accounts.find(function (a) { return a.id === id; }) || null; };
  var isTransferTx = function (t: Transaction): boolean { return t.merchant.startsWith("Transfer to ") || t.merchant.startsWith("Transfer from "); };
  var getTransferPartner = function (t: Transaction): { partner: Account | null; direction: "out" | "in" } {
    if (t.merchant.startsWith("Transfer to ")) { return { partner: accounts.find(function (a) { return a.name === t.merchant.replace("Transfer to ", ""); }) || null, direction: "out" }; }
    if (t.merchant.startsWith("Transfer from ")) { return { partner: accounts.find(function (a) { return a.name === t.merchant.replace("Transfer from ", ""); }) || null, direction: "in" }; }
    return { partner: null, direction: t.type === "expense" ? "out" : "in" };
  };

  var now = new Date();
  var thisMs = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  var thisMonthExp = transactions.filter(function (t) { return t.type === "expense" && t.date.startsWith(thisMs) && !isTransferTx(t); }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);
  var thisMonthInc = transactions.filter(function (t) { return t.type === "income" && t.date.startsWith(thisMs) && !isTransferTx(t); }).reduce(function (s, t) { return s + t.amount; }, 0);
  var totalTransferred = transactions.filter(function (t) { return t.date.startsWith(thisMs) && isTransferTx(t) && t.type === "expense"; }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);

  var dateRange = getDateRange(datePreset, customFrom, customTo);

  var filtered = transactions.filter(function (t) {
    if (filter === "income" && t.type !== "income") return false;
    if (filter === "expense" && t.type !== "expense") return false;
    if (filter === "transfer" && !isTransferTx(t)) return false;
    if (filterAccount !== "all" && t.accountId !== filterAccount) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (dateRange.from && t.date < dateRange.from) return false;
    if (dateRange.to && t.date > dateRange.to) return false;
    if (searchQuery) { var q = searchQuery.toLowerCase(); if (t.merchant.toLowerCase().indexOf(q) === -1 && t.category.toLowerCase().indexOf(q) === -1 && t.note.toLowerCase().indexOf(q) === -1) return false; }
    return true;
  });

  filtered.sort(function (a, b) {
    if (sortOption === "newest") return b.date.localeCompare(a.date);
    if (sortOption === "oldest") return a.date.localeCompare(b.date);
    if (sortOption === "highest") return Math.abs(b.amount) - Math.abs(a.amount);
    if (sortOption === "lowest") return Math.abs(a.amount) - Math.abs(b.amount);
    if (sortOption === "merchant") return a.merchant.localeCompare(b.merchant);
    return 0;
  });

  var visible = filtered.slice(0, visibleCount);
  var hasMore = filtered.length > visibleCount;

  var grouped: { label: string; date: string; items: Transaction[] }[] = [];
  var groupMap: Record<string, Transaction[]> = {};
  visible.forEach(function (t) { if (!groupMap[t.date]) groupMap[t.date] = []; groupMap[t.date].push(t); });
  Object.keys(groupMap).forEach(function (date) {
    var d = new Date(date + "T00:00:00");
    var td = new Date(); td.setHours(0, 0, 0, 0);
    var yd = new Date(td.getTime() - 86400000);
    var label = d.getTime() === td.getTime() ? "Today" : d.getTime() === yd.getTime() ? "Yesterday" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    grouped.push({ label: label, date: date, items: groupMap[date] });
  });

  var doAutoDetect = function () {
    setDetecting(true);
    setTimeout(function () {
      var detected = autoDetectTransactions(accounts);
      setTransactions(function (prev) { return detected.concat(prev); });
      setDetecting(false); setShowDetect(false);
      showToast(detected.length + " transactions detected");
    }, 2000);
  };

  var handleParse = function () {
    if (!statementText.trim()) return;
    var result = importMode === "sms" ? parseSms(statementText, accounts) : parseCsv(statementText, accounts);
    setParsedEntries(result);
  };

  var toggleEntry = function (idx: number) { setParsedEntries(function (prev) { return prev.map(function (e, i) { return i === idx ? { ...e, selected: !e.selected } : e; }); }); };

  var addParsed = function () {
    var sel = parsedEntries.filter(function (e) { return e.selected; });
    var newTx: Transaction[] = sel.map(function (e) {
      return { id: generateId(), amount: e.isIncome ? e.amount : -e.amount, type: (e.isIncome ? "income" : "expense") as "income" | "expense", merchant: e.merchant, category: e.category, date: e.date, note: "", source: importMode as "manual" | "sms" | "csv" | "auto", accountId: e.accountId || undefined };
    });
    setTransactions(function (prev) { return newTx.concat(prev); });
    setParsedEntries([]); setStatementText(""); setShowImport(false);
    showToast(newTx.length + " " + (importMode === "sms" ? "SMS" : "CSV") + " transactions imported");
  };

  var addManual = function () {
    var amt = parseFloat(addForm.amount);
    if (!amt || amt <= 0 || !addForm.merchant.trim()) return;
    var tx: Transaction = { id: generateId(), amount: addForm.type === "expense" ? -amt : amt, type: addForm.type, merchant: addForm.merchant.trim(), category: addForm.category, date: addForm.date || new Date().toISOString().split("T")[0], note: addForm.note, source: "manual" as "manual" | "sms" | "csv" | "auto", accountId: addForm.accountId || undefined };
    setTransactions(function (prev) { return [tx, ...prev]; });
    setAddForm({ merchant: "", amount: "", type: "expense", category: "Other", date: new Date().toISOString().split("T")[0], note: "", accountId: "" });
    setShowAdd(false);
    showToast(tx.merchant + " " + (tx.type === "income" ? "+" : "-") + formatCurrency(amt));
  };

  var deleteTx = function (id: string) { setTransactions(function (prev) { return prev.filter(function (t) { return t.id !== id; }); }); showToast("Deleted"); };
  var closeDetail = function () { setShowDetail(false); setDetailTx(null); };

  var sortLabels: Record<SortOption, string> = { newest: "Newest", oldest: "Oldest", highest: "Highest $", lowest: "Lowest $", merchant: "A\u2192Z" };
  var dateLabels: Record<DatePreset, string> = { all: "All Time", today: "Today", yesterday: "Yesterday", week: "This Week", month: "This Month", "30days": "Last 30 Days", custom: "Custom" };

  var stopProp = function (e: React.MouseEvent) { e.stopPropagation(); };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 0 40px" }}>
      {toast && <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "var(--green)", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "inherit", boxShadow: "0 4px 20px rgba(26,143,78,0.3)", animation: "fadeIn 200ms ease" }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5, margin: "0 0 2px 0" }}>Transactions</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>See every money movement — which account sent or received it.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 2px 0" }}>Money in</p><p style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", margin: 0, fontVariantNumeric: "tabular-nums" }}>+{formatCurrency(thisMonthInc)}</p></div>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 2px 0" }}>Money out</p><p style={{ fontSize: 18, fontWeight: 700, color: "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>-{formatCurrency(thisMonthExp)}</p></div>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 2px 0" }}>Transferred</p><p style={{ fontSize: 18, fontWeight: 700, color: "#8B5CF6", margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalTransferred)}</p></div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={function () { setShowAdd(true); setAddForm({ merchant: "", amount: "", type: "expense", category: "Other", date: new Date().toISOString().split("T")[0], note: "", accountId: accounts.length > 0 ? accounts[0].id : "" }); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(26,143,78,0.15)", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Add</button>
        <button onClick={function () { setShowDetect(true); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(26,143,78,0.2)", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>Auto-Detect</button>
        <button onClick={function () { setShowImport(true); setParsedEntries([]); setStatementText(""); setImportMode("sms"); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>SMS / CSV</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        {[{ key: "all", label: "All" }, { key: "income", label: "Income" }, { key: "expense", label: "Expense" }, { key: "transfer", label: "Transfers" }].map(function (f) {
          var on = filter === f.key;
          return <button key={f.key} onClick={function () { setFilter(f.key as "all" | "income" | "expense" | "transfer"); setVisibleCount(30); }} style={{ height: 28, padding: "0 10px", borderRadius: 6, border: "1px solid " + (on ? "var(--green-border)" : "var(--border)"), background: on ? "var(--green-dim)" : "transparent", color: on ? "var(--green)" : "var(--muted)", fontSize: 11, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 120ms ease" }}>{f.label}</button>;
        })}
        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 2px" }} />
        <div onClick={stopProp}>
          <Dropdown open={openSort} onToggle={function () { setOpenSort(!openSort); setOpenCat(false); setOpenDate(false); }} label="Sort" value={sortLabels[sortOption]}>
            {(["newest", "oldest", "highest", "lowest", "merchant"] as SortOption[]).map(function (s) { return <button key={s} onClick={function () { setSortOption(s); setOpenSort(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", borderRadius: 6, border: "none", background: sortOption === s ? "var(--green-dim)" : "transparent", color: sortOption === s ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: sortOption === s ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 100ms ease" }}>{sortLabels[s]}</button>; })}
          </Dropdown>
        </div>
        <div onClick={stopProp}>
          <Dropdown open={openCat} onToggle={function () { setOpenCat(!openCat); setOpenSort(false); setOpenDate(false); }} label="Category" value={filterCategory === "all" ? "All" : filterCategory}>
            <button onClick={function () { setFilterCategory("all"); setOpenCat(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", borderRadius: 6, border: "none", background: filterCategory === "all" ? "var(--green-dim)" : "transparent", color: filterCategory === "all" ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: filterCategory === "all" ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>All Categories</button>
            {CAT_LIST.map(function (c) { var ci = getCatInfo(c); return <button key={c} onClick={function () { setFilterCategory(c); setOpenCat(false); }} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", padding: "6px 10px", borderRadius: 6, border: "none", background: filterCategory === c ? "var(--green-dim)" : "transparent", color: filterCategory === c ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: filterCategory === c ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}><span style={{ width: 14, height: 14, borderRadius: 4, background: ci.bg, border: "1px solid " + ci.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6, fontWeight: 800, color: ci.color, flexShrink: 0 }}>{ci.label}</span>{c}</button>; })}
          </Dropdown>
        </div>
        <div onClick={stopProp}>
          <Dropdown open={openDate} onToggle={function () { setOpenDate(!openDate); setOpenSort(false); setOpenCat(false); }} label="Date" value={dateLabels[datePreset]}>
            {(["all", "today", "yesterday", "week", "month", "30days", "custom"] as DatePreset[]).map(function (p) { return <button key={p} onClick={function () { setDatePreset(p); if (p !== "custom") setOpenDate(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", borderRadius: 6, border: "none", background: datePreset === p ? "var(--green-dim)" : "transparent", color: datePreset === p ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: datePreset === p ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>{dateLabels[p]}</button>; })}
            {datePreset === "custom" && (<div style={{ padding: "6px 4px 2px", borderTop: "1px solid var(--border)", marginTop: 4 }}><div style={{ marginBottom: 4 }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", margin: "0 0 2px 0" }}>FROM</p><input type="date" value={customFrom} onChange={function (e) { setCustomFrom(e.target.value); }} style={{ width: "100%", height: 28, padding: "0 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 10, outline: "none", fontFamily: "inherit" }} /></div><div><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", margin: "0 0 2px 0" }}>TO</p><input type="date" value={customTo} onChange={function (e) { setCustomTo(e.target.value); }} style={{ width: "100%", height: 28, padding: "0 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 10, outline: "none", fontFamily: "inherit" }} /></div></div>)}
          </Dropdown>
        </div>
        {accounts.length > 0 && (<select value={filterAccount} onChange={function (e) { setFilterAccount(e.target.value); setVisibleCount(30); }} style={{ height: 28, padding: "0 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 11, fontWeight: 500, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
          <option value="all">All Accounts</option>
          {accounts.map(function (a) { return <option key={a.id} value={a.id}>{a.name}</option>; })}
        </select>)}
      </div>

      <div style={{ marginBottom: 12 }}>
        <input type="text" placeholder="Search merchant, category, or note..." value={searchQuery} onChange={function (e) { setSearchQuery(e.target.value); setVisibleCount(30); }} style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
      </div>

      {(filterCategory !== "all" || datePreset !== "all" || sortOption !== "newest" || filterAccount !== "all") && (
        <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, marginRight: 2 }}>Filters:</span>
          {filterCategory !== "all" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: getCatInfo(filterCategory).bg, border: "1px solid " + getCatInfo(filterCategory).color + "30", fontSize: 10, fontWeight: 600, color: getCatInfo(filterCategory).color }}>{filterCategory}<button onClick={function () { setFilterCategory("all"); }} style={{ background: "none", border: "none", color: getCatInfo(filterCategory).color, cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>\u00D7</button></span>}
          {datePreset !== "all" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: "var(--green-dim)", border: "1px solid var(--green-border)", fontSize: 10, fontWeight: 600, color: "var(--green)" }}>{dateLabels[datePreset]}{datePreset === "custom" ? " (" + customFrom + " to " + customTo + ")" : ""}<button onClick={function () { setDatePreset("all"); }} style={{ background: "none", border: "none", color: "var(--green)", cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>\u00D7</button></span>}
          {sortOption !== "newest" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 10, fontWeight: 600, color: "var(--text)" }}>Sort: {sortLabels[sortOption]}<button onClick={function () { setSortOption("newest"); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>\u00D7</button></span>}
          {filterAccount !== "all" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 10, fontWeight: 600, color: "var(--text)" }}>{accounts.find(function (a) { return a.id === filterAccount; })?.name || "Account"}<button onClick={function () { setFilterAccount("all"); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>\u00D7</button></span>}
          <button onClick={function () { setFilterCategory("all"); setDatePreset("all"); setSortOption("newest"); setFilterAccount("all"); }} style={{ padding: "2px 8px", borderRadius: 4, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Clear all</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "36px 20px", border: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 4px 0" }}>No transactions yet</p>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px 0", lineHeight: 1.5 }}>Add one manually, import SMS/CSV, or auto-detect.</p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={function () { setShowAdd(true); }} style={{ padding: "8px 14px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
            <button onClick={function () { setShowDetect(true); }} style={{ padding: "8px 14px", borderRadius: 8, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Auto-Detect</button>
            <button onClick={function () { setShowImport(true); setImportMode("sms"); }} style={{ padding: "8px 14px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>SMS / CSV</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {grouped.map(function (group) {
            return (
              <div key={group.date}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, padding: "0 2px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.03 }}>{group.label}</p>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{group.items.length} transactions</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {group.items.map(function (tx) {
                    var ci = getCatInfo(tx.category);
                    var acc = getAccount(tx.accountId);
                    var isTf = isTransferTx(tx);
                    var tfInfo = isTf ? getTransferPartner(tx) : null;
                    return (
                      <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 150ms ease" }} onClick={function () { setDetailTx(tx); setShowDetail(true); }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.background = "var(--green-dim)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: ci.bg, border: "1px solid " + ci.color + "25", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, color: ci.color }}>{ci.label}</span></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.merchant}</p>
                            {isTf && <span style={{ fontSize: 7, fontWeight: 700, color: "#8B5CF6", background: "#FAF5FF", padding: "1px 4px", borderRadius: 2, textTransform: "uppercase", flexShrink: 0 }}>TRANSFER</span>}
                            {tx.source === "auto" && <span style={{ fontSize: 7, fontWeight: 700, color: "var(--green)", background: "var(--green-dim)", padding: "1px 4px", borderRadius: 2, textTransform: "uppercase", flexShrink: 0 }}>AUTO</span>}
                            {tx.source === "csv" && <span style={{ fontSize: 7, fontWeight: 700, color: "#3B82F6", background: "#EFF6FF", padding: "1px 4px", borderRadius: 2, textTransform: "uppercase", flexShrink: 0 }}>CSV</span>}
                            {tx.source === "sms" && <span style={{ fontSize: 7, fontWeight: 700, color: "#F97316", background: "#FFF7ED", padding: "1px 4px", borderRadius: 2, textTransform: "uppercase", flexShrink: 0 }}>SMS</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            {acc && (<div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 16, height: 16, borderRadius: 4, background: "linear-gradient(135deg, " + getGrad(acc.type)[0] + ", " + getGrad(acc.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 6, fontWeight: 800, color: "#fff" }}>{getIcon(acc.type)}</span></div><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>{acc.name}</span></div>)}
                            {isTf && tfInfo && tfInfo.partner && (<div style={{ display: "flex", alignItems: "center", gap: 3 }}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg><div style={{ width: 16, height: 16, borderRadius: 4, background: "linear-gradient(135deg, " + getGrad(tfInfo.partner.type)[0] + ", " + getGrad(tfInfo.partner.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 6, fontWeight: 800, color: "#fff" }}>{getIcon(tfInfo.partner.type)}</span></div><span style={{ fontSize: 10, color: tfInfo.direction === "out" ? "var(--red)" : "var(--green)", fontWeight: 500 }}>{tfInfo.direction === "out" ? "to" : "from"} {tfInfo.partner.name}</span></div>)}
                            {!acc && !isTf && <span style={{ fontSize: 10, color: "var(--muted)" }}>{tx.category}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: tx.type === "income" ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{tx.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}</p>
                          <span style={{ fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{tx.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {hasMore && <div ref={loaderRef} style={{ textAlign: "center", padding: "12px 0" }}><p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>Loading more...</p></div>}
        </div>
      )}

      {showDetail && detailTx && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={closeDetail}>
          <div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 380, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <DetailContent tx={detailTx} accounts={accounts} onClose={closeDetail} onDelete={deleteTx} />
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowAdd(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 380, maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0" }}>Add Transaction</h2>
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 12px 0" }}>Record a new income or expense.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
              <button onClick={function () { setAddForm(function (f) { return { ...f, type: "expense" }; }); }} style={{ height: 34, borderRadius: 7, border: "1px solid " + (addForm.type === "expense" ? "var(--red-border)" : "var(--border)"), background: addForm.type === "expense" ? "var(--red-dim)" : "transparent", color: addForm.type === "expense" ? "var(--red)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Expense</button>
              <button onClick={function () { setAddForm(function (f) { return { ...f, type: "income" }; }); }} style={{ height: 34, borderRadius: 7, border: "1px solid " + (addForm.type === "income" ? "var(--green-border)" : "var(--border)"), background: addForm.type === "income" ? "var(--green-dim)" : "transparent", color: addForm.type === "income" ? "var(--green)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Income</button>
            </div>
            <input type="text" placeholder="Merchant" value={addForm.merchant} onChange={function (e) { setAddForm(function (f) { return { ...f, merchant: e.target.value }; }); }} style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6 }} />
            <input type="text" inputMode="decimal" placeholder="Amount" value={addForm.amount} onChange={function (e) { setAddForm(function (f) { return { ...f, amount: e.target.value.replace(/[^0-9.]/g, "") }; }); }} style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 6, fontVariantNumeric: "tabular-nums" }} />
            <select value={addForm.category} onChange={function (e) { setAddForm(function (f) { return { ...f, category: e.target.value }; }); }} style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6, cursor: "pointer" }}>
              {CAT_LIST.map(function (c) { return <option key={c} value={c}>{c}</option>; })}
            </select>
            <input type="date" value={addForm.date} onChange={function (e) { setAddForm(function (f) { return { ...f, date: e.target.value }; }); }} style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6 }} />
            {accounts.length > 0 && (<select value={addForm.accountId} onChange={function (e) { setAddForm(function (f) { return { ...f, accountId: e.target.value }; }); }} style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6, cursor: "pointer" }}><option value="">No account</option>{accounts.map(function (a) { return <option key={a.id} value={a.id}>{a.name} ({a.type})</option>; })}</select>)}
            <input type="text" placeholder="Note (optional)" value={addForm.note} onChange={function (e) { setAddForm(function (f) { return { ...f, note: e.target.value }; }); }} style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={function () { setShowAdd(false); }} style={{ flex: 1, height: 38, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={addManual} disabled={!addForm.merchant.trim() || !addForm.amount} style={{ flex: 1, height: 38, borderRadius: 8, background: addForm.merchant.trim() && addForm.amount ? "var(--green)" : "var(--card)", border: "none", color: addForm.merchant.trim() && addForm.amount ? "#fff" : "var(--faint)", fontSize: 12, fontWeight: 600, cursor: addForm.merchant.trim() && addForm.amount ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {showDetect && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { if (!detecting) setShowDetect(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 380, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)", textAlign: "center" }} onClick={function (e) { e.stopPropagation(); }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: detecting ? "var(--green-dim)" : "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: detecting ? "1px solid var(--green-border)" : "none", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              {detecting ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>{detecting ? "Detecting..." : "Auto-Detect"}</h3>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 6px 0", lineHeight: 1.5 }}>{detecting ? "Scanning your accounts..." : "Scan your connected accounts for recent transactions."}</p>
            {!detecting && accounts.length === 0 && <p style={{ fontSize: 11, color: "var(--red)", margin: "0 0 12px 0" }}>Add at least one account first.</p>}
            {!detecting && accounts.length > 0 && <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 16px 0" }}>{accounts.length} account{accounts.length > 1 ? "s" : ""}: {accounts.map(function (a) { return a.name; }).join(", ")}</p>}
            {detecting && <div style={{ width: "100%", height: 4, borderRadius: 2, background: "var(--green-dim)", overflow: "hidden", margin: "8px 0 16px" }}><div style={{ width: "60%", height: "100%", borderRadius: 2, background: "var(--green)", animation: "pulse 1.5s ease-in-out infinite" }} /></div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { if (!detecting) setShowDetect(false); }} disabled={detecting} style={{ flex: 1, height: 40, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: detecting ? "var(--faint)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: detecting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={doAutoDetect} disabled={detecting || accounts.length === 0} style={{ flex: 1, height: 40, borderRadius: 8, background: detecting || accounts.length === 0 ? "var(--card)" : "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: "none", color: detecting || accounts.length === 0 ? "var(--faint)" : "#fff", fontSize: 12, fontWeight: 600, cursor: detecting || accounts.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{detecting ? "Scanning..." : "Detect Now"}</button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowImport(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0" }}>Import Transactions</h2>
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 12px 0" }}>Paste SMS messages or CSV lines. We auto-detect amounts, dates &amp; categories.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
              <button onClick={function () { setImportMode("sms"); setParsedEntries([]); }} style={{ height: 34, borderRadius: 7, border: "1px solid " + (importMode === "sms" ? "#F97316" : "var(--border)"), background: importMode === "sms" ? "#FFF7ED" : "transparent", color: importMode === "sms" ? "#F97316" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>SMS</button>
              <button onClick={function () { setImportMode("csv"); setParsedEntries([]); }} style={{ height: 34, borderRadius: 7, border: "1px solid " + (importMode === "csv" ? "#3B82F6" : "var(--border)"), background: importMode === "csv" ? "#EFF6FF" : "transparent", color: importMode === "csv" ? "#3B82F6" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>CSV</button>
            </div>
            <textarea value={statementText} onChange={function (e) { setStatementText(e.target.value); setParsedEntries([]); }} placeholder={importMode === "sms" ? "Your Rs.250.00 txn from A/C XX1234 to Swiggy on 15/01/25 was debited.\nRs.50000.00 credited to A/C XX5678 on 16/01/25 - SALARY\nYour UPI payment of Rs.185.50 to Uber on 17/01/25" : "15/01/2025,Swiggy,250.00,expense\n16/01/2025,Salary,50000.00,income\n17/01/2025,Netflix,15.99,expense"} style={{ width: "100%", height: 90, borderRadius: 8, padding: "10px", fontSize: 11, fontFamily: "monospace", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.5, marginBottom: 8 }} />
            <button onClick={handleParse} disabled={!statementText.trim()} style={{ height: 32, padding: "0 14px", borderRadius: 7, background: statementText.trim() ? (importMode === "sms" ? "#F97316" : "#3B82F6") : "var(--card)", border: "none", color: statementText.trim() ? "#fff" : "var(--faint)", fontSize: 11, fontWeight: 600, cursor: statementText.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", marginBottom: 8 }}>{importMode === "sms" ? "Parse SMS" : "Parse CSV"}</button>
            {parsedEntries.length > 0 && (<div style={{ marginTop: 8, animation: "fadeIn 200ms ease" }}><p style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>Found {parsedEntries.length} — toggle to select</p><div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8, maxHeight: 200, overflowY: "auto" }}>{parsedEntries.map(function (entry, idx) { var ci = getCatInfo(entry.category); return (<div key={idx} onClick={function () { toggleEntry(idx); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 5, background: entry.selected ? "var(--green-dim)" : "var(--bg)", border: "1px solid " + (entry.selected ? "var(--green-border)" : "var(--border)"), cursor: "pointer", transition: "all 120ms ease", opacity: entry.selected ? 1 : 0.4 }}><div style={{ width: 14, height: 14, borderRadius: 3, border: entry.selected ? "none" : "2px solid var(--border)", background: entry.selected ? "var(--green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{entry.selected && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}</div><span style={{ width: 16, height: 11, borderRadius: 2, background: ci.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, fontWeight: 800, color: ci.color, flexShrink: 0 }}>{ci.label}</span><span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.merchant}</span><span style={{ fontSize: 10, fontWeight: 700, color: entry.isIncome ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{entry.isIncome ? "+" : "-"}{formatCurrency(entry.amount)}</span></div>); })}</div><button onClick={addParsed} style={{ height: 32, padding: "0 14px", borderRadius: 7, background: "var(--green)", border: "none", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add {parsedEntries.filter(function (e) { return e.selected; }).length} Transactions</button></div>)}
            <div style={{ marginTop: 8 }}><button onClick={function () { setShowImport(false); }} style={{ width: "100%", height: 34, borderRadius: 7, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close</button></div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}