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
  source: "manual" | "sms" | "csv";
  accountId?: string;
};

type TransferRecord = {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
};

type Profile = { name: string; email: string };

type Preset = {
  type: AccountType;
  label: string;
  color: string;
  icon: string;
  desc: string;
  fields: Record<string, string>;
  canAutoDetect: boolean;
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatCurrency(n: number): string {
  var abs = Math.abs(n);
  var str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "-" : "") + "$" + str;
}

function isOnlineType(t: AccountType): boolean {
  return t === "bank" || t === "upi" || t === "card";
}

var PRESETS: Preset[] = [
  { type: "bank", label: "Bank Account", color: "#3B82F6", icon: "BK", desc: "Savings, checking, current", fields: { bankName: "Bank name (e.g. SBI, HDFC)", accountNumber: "Last 4 digits", holderName: "Your name" }, canAutoDetect: true },
  { type: "upi", label: "UPI", color: "#8B5CF6", icon: "UP", desc: "GPay, PhonePe, Paytm", fields: { platform: "Platform (e.g. GPay)", upiId: "UPI ID (e.g. name@upi)", holderName: "Your name" }, canAutoDetect: true },
  { type: "cash", label: "Cash", color: "#22C55E", icon: "CA", desc: "Wallet, purse, hand cash", fields: { holderName: "Label (e.g. My Wallet)" }, canAutoDetect: false },
  { type: "card", label: "Card", color: "#F97316", icon: "CD", desc: "Credit or debit card", fields: { bankName: "Bank name", cardNumber: "Card number", expiry: "MM/YY", holderName: "Name on card" }, canAutoDetect: true },
];

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
  Other: { color: "#6B7280", bg: "#F9FAFB", label: "OT" },
};

function getCatInfo(name: string): { color: string; bg: string; label: string } {
  var info = CAT_MAP[name];
  return info || { color: "#6B7280", bg: "#F9FAFB", label: "OT" };
}

function detectCardType(n: string): string {
  var c = n.replace(/\D/g, "");
  if (c.startsWith("4")) return "VISA";
  if (c.startsWith("5") || c.startsWith("2")) return "MASTERCARD";
  if (c.startsWith("6")) return "RuPay";
  if (c.startsWith("3")) return "AMEX";
  return "CARD";
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

function fmtCard(n: string): string {
  var c = n.replace(/\D/g, "").substring(0, 16);
  var p: string[] = [];
  for (var i = 0; i < c.length; i += 4) p.push(c.substring(i, i + 4));
  return p.join(" ");
}

function fmtExp(v: string): string {
  var c = v.replace(/\D/g, "").substring(0, 4);
  if (c.length >= 2) return c.substring(0, 2) + "/" + c.substring(2);
  return c;
}

/* 🔧 PRODUCTION: Replace simulateBalance with real API call.
   Example: const res = await fetch("/api/balance", { method: "POST", body: JSON.stringify({type, details}) });
   const data = await res.json(); return data.balance; */
function simulateBalance(type: string, details: Record<string, string>): number {
  var seed = 0;
  var str = JSON.stringify(details);
  for (var i = 0; i < str.length; i++) { seed = ((seed << 5) - seed) + str.charCodeAt(i); seed = seed & seed; }
  seed = Math.abs(seed);
  if (type === "bank") return Math.round((1000 + (seed % 50000)) * 100) / 100;
  if (type === "upi") return Math.round((200 + (seed % 15000)) * 100) / 100;
  if (type === "card") return Math.round((-500 + (seed % 8000)) * 100) / 100;
  return Math.round((100 + (seed % 5000)) * 100) / 100;
}

function parseStatement(text: string): { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean }[] {
  var results: { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean }[] = [];
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
    var cat = "Other";
    if (ml.includes("swiggy") || ml.includes("zomato") || ml.includes("food") || ml.includes("grocery") || ml.includes("coffee") || ml.includes("restaurant") || ml.includes("starbucks") || ml.includes("doordash") || ml.includes("blinkit")) cat = "Food";
    else if (ml.includes("uber") || ml.includes("ola") || ml.includes("lyft") || ml.includes("fuel") || ml.includes("petrol") || ml.includes("metro") || ml.includes("cab") || ml.includes("flight")) cat = "Transport";
    else if (ml.includes("amazon") || ml.includes("flipkart") || ml.includes("myntra") || ml.includes("walmart") || ml.includes("shop") || ml.includes("store")) cat = "Shopping";
    else if (ml.includes("netflix") || ml.includes("spotify") || ml.includes("movie") || ml.includes("gaming") || ml.includes("steam")) cat = "Entertainment";
    else if (ml.includes("bill") || ml.includes("electricity") || ml.includes("water") || ml.includes("internet") || ml.includes("phone")) cat = "Bills";
    else if (ml.includes("rent")) cat = "Rent";
    else if (ml.includes("hospital") || ml.includes("doctor") || ml.includes("medicine") || ml.includes("health") || ml.includes("gym")) cat = "Health";
    else if (ml.includes("course") || ml.includes("school") || ml.includes("book") || ml.includes("udemy")) cat = "Education";
    else if (ml.includes("stock") || ml.includes("invest") || ml.includes("mutual") || ml.includes("sip")) cat = "Investment";
    results.push({ date: date, merchant: merchant, amount: amount, isIncome: isIncome, category: cat, selected: true });
  });
  return results;
}

function getPresetColor(type: AccountType): string {
  var pr = PRESETS.find(function (p) { return p.type === type; });
  return pr ? pr.color : "#6B7280";
}

function getPresetFields(type: AccountType): Record<string, string> {
  var pr = PRESETS.find(function (p) { return p.type === type; });
  return pr ? pr.fields : {};
}

function getPresetCanAutoDetect(type: AccountType): boolean {
  var pr = PRESETS.find(function (p) { return p.type === type; });
  return pr ? pr.canAutoDetect : false;
}

function getPresetLabel(type: AccountType): string {
  var pr = PRESETS.find(function (p) { return p.type === type; });
  return pr ? pr.label : "Account";
}

/* 🔧 PRODUCTION: Replace with DB aggregated query */
function getLast6Months(transactions: Transaction[]): { month: string; income: number; expense: number; label: string }[] {
  var now = new Date();
  var months: { month: string; income: number; expense: number; label: string }[] = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var prefix = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    var label = d.toLocaleString("en-US", { month: "short" });
    var inc = 0;
    var exp = 0;
    transactions.forEach(function (t) {
      if (t.date.startsWith(prefix)) {
        if (t.type === "income") inc += t.amount;
        else exp += Math.abs(t.amount);
      }
    });
    months.push({ month: prefix, income: inc, expense: exp, label: label });
  }
  return months;
}

export default function AccountsPage() {
  var [accounts, setAccounts] = useState<Account[]>([]);
  var [transactions, setTransactions] = useState<Transaction[]>([]);
  var [transfers, setTransfers] = useState<TransferRecord[]>([]);
  var [profile, setProfile] = useState<Profile>({ name: "John Doe", email: "john@example.com" });
  var [showAdd, setShowAdd] = useState(false);
  var [showAddMoney, setShowAddMoney] = useState(false);
  var [showTransfer, setShowTransfer] = useState(false);
  var [showEdit, setShowEdit] = useState(false);
  var [showPerm, setShowPerm] = useState(false);
  var [editId, setEditId] = useState("");
  var [editName, setEditName] = useState("");
  var [editType, setEditType] = useState<AccountType>("bank");
  var [editBalance, setEditBalance] = useState("");
  var [editFields, setEditFields] = useState<Record<string, string>>({});
  var [addMoneyAccountId, setAddMoneyAccountId] = useState("");
  var [addMoneyAmount, setAddMoneyAmount] = useState("");
  var [transferFrom, setTransferFrom] = useState("");
  var [transferTo, setTransferTo] = useState("");
  var [transferAmount, setTransferAmount] = useState("");
  var [selectedType, setSelectedType] = useState<AccountType>("bank");
  var [formFields, setFormFields] = useState<Record<string, string>>({});
  var [initialBalance, setInitialBalance] = useState("");
  var [autoDetectedBalance, setAutoDetectedBalance] = useState<number | null>(null);
  var [detecting, setDetecting] = useState(false);
  var [statementText, setStatementText] = useState("");
  var [parsedEntries, setParsedEntries] = useState<{ date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean }[]>([]);
  var [editingName, setEditingName] = useState(false);
  var [editingEmail, setEditingEmail] = useState(false);
  var [nameInput, setNameInput] = useState("");
  var [emailInput, setEmailInput] = useState("");
  var [showClearConfirm, setShowClearConfirm] = useState(false);
  var [toast, setToast] = useState("");
  var [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  var nameRef = useRef<HTMLInputElement>(null);
  var emailRef = useRef<HTMLInputElement>(null);

  /* 🔧 PRODUCTION: Replace localStorage with DB reads */
  useEffect(function () {
    var a = localStorage.getItem("casha-accounts"); if (a) { try { setAccounts(JSON.parse(a)); } catch (e) { /* ignore */ } }
    var t = localStorage.getItem("casha-transactions"); if (t) { try { setTransactions(JSON.parse(t)); } catch (e) { /* ignore */ } }
    var tr = localStorage.getItem("casha-transfers"); if (tr) { try { setTransfers(JSON.parse(tr)); } catch (e) { /* ignore */ } }
    var p = localStorage.getItem("casha-profile"); if (p) { try { setProfile(JSON.parse(p)); } catch (e) { /* ignore */ } }
  }, []);

  /* 🔧 PRODUCTION: Replace localStorage with DB writes */
  useEffect(function () { localStorage.setItem("casha-accounts", JSON.stringify(accounts)); }, [accounts]);
  useEffect(function () { localStorage.setItem("casha-transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(function () { localStorage.setItem("casha-transfers", JSON.stringify(transfers)); }, [transfers]);
  useEffect(function () { localStorage.setItem("casha-profile", JSON.stringify(profile)); }, [profile]);
  useEffect(function () { if (editingName && nameRef.current) nameRef.current.focus(); }, [editingName]);
  useEffect(function () { if (editingEmail && emailRef.current) emailRef.current.focus(); }, [editingEmail]);

  var showToast = function (msg: string) { setToast(msg); setTimeout(function () { setToast(""); }, 2500); };

  var totalBalance = accounts.reduce(function (s, a) { return s + a.balance; }, 0);
  var now = new Date();
  var thisMs = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  var thisMonthExp = transactions.filter(function (t) { return t.type === "expense" && t.date.startsWith(thisMs); }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);
  var thisMonthInc = transactions.filter(function (t) { return t.type === "income" && t.date.startsWith(thisMs); }).reduce(function (s, t) { return s + t.amount; }, 0);
  var bankTotal = accounts.filter(function (a) { return a.type === "bank"; }).reduce(function (s, a) { return s + a.balance; }, 0);
  var upiTotal = accounts.filter(function (a) { return a.type === "upi"; }).reduce(function (s, a) { return s + a.balance; }, 0);
  var cashTotal = accounts.filter(function (a) { return a.type === "cash"; }).reduce(function (s, a) { return s + a.balance; }, 0);
  var cardTotal = accounts.filter(function (a) { return a.type === "card"; }).reduce(function (s, a) { return s + a.balance; }, 0);

  var sixMonths = getLast6Months(transactions);
  var maxMonthVal = Math.max.apply(null, sixMonths.map(function (m) { return Math.max(m.income, m.expense); })) || 1;

  var canAutoDetect = getPresetCanAutoDetect(selectedType);
  var hasEnoughDetail = (selectedType === "bank" && !!(formFields.bankName && formFields.accountNumber)) ||
    (selectedType === "upi" && !!formFields.upiId) ||
    (selectedType === "card" && !!(formFields.cardNumber && formFields.cardNumber.replace(/\D/g, "").length >= 4));

  var onlineAccounts = accounts.filter(function (a) { return isOnlineType(a.type); });
  var fromAcc = accounts.find(function (a) { return a.id === transferFrom; });
  var fromIsOnline = fromAcc ? isOnlineType(fromAcc.type) : true;
  var eligibleToAccounts = accounts.filter(function (a) {
    if (a.id === transferFrom) return false;
    return fromIsOnline === isOnlineType(a.type);
  });

  var requestAutoDetect = function () { setDetecting(true); setAutoDetectedBalance(null); setShowPerm(true); };

  /* 🔧 PRODUCTION: Replace setTimeout with await fetchRealBalance(type, details) */
  var grantPermission = function () {
    setShowPerm(false);
    setTimeout(function () {
      var bal = simulateBalance(selectedType, formFields);
      setAutoDetectedBalance(bal);
      setInitialBalance(String(bal));
      setDetecting(false);
      showToast("Balance detected: " + formatCurrency(bal));
    }, 1500);
  };

  var denyPermission = function () { setShowPerm(false); setDetecting(false); setAutoDetectedBalance(null); };

  var addAccount = function () {
    var prColor = getPresetColor(selectedType);
    var prLabel = getPresetLabel(selectedType);
    var name = formFields.holderName || formFields.bankName || formFields.platform || prLabel;
    var bal = parseFloat(initialBalance) || 0;
    var newAcc: Account = { id: generateId(), type: selectedType, name: name, balance: bal, color: prColor, details: { ...formFields } };
    setAccounts(function (prev) { return [...prev, newAcc]; });
    if (bal > 0) {
      var t: Transaction = { id: generateId(), amount: bal, type: "income", merchant: "Initial balance", category: "Other", date: new Date().toISOString().split("T")[0], note: "Opening balance", source: "manual", accountId: newAcc.id };
      setTransactions(function (prev) { return [t, ...prev]; });
    }
    setFormFields({}); setInitialBalance(""); setAutoDetectedBalance(null); setShowAdd(false);
    showToast(name + " added with " + formatCurrency(bal));
  };

  var removeAccount = function (id: string) {
    var acc = accounts.find(function (a) { return a.id === id; });
    setAccounts(function (prev) { return prev.filter(function (a) { return a.id !== id; }); });
    if (acc) showToast(acc.name + " removed");
  };

  var openEdit = function (acc: Account) {
    setEditId(acc.id); setEditName(acc.name); setEditType(acc.type); setEditBalance(String(acc.balance)); setEditFields({ ...acc.details }); setShowEdit(true);
  };

  var doEdit = function () {
    var prColor = getPresetColor(editType);
    var prLabel = getPresetLabel(editType);
    var finalName = editName.trim() || editFields.holderName || editFields.bankName || editFields.platform || prLabel;
    var newBal = parseFloat(editBalance) || 0;
    var eid = editId;
    var ef = { ...editFields };
    setAccounts(function (prev) { return prev.map(function (a) { if (a.id !== eid) return a; return { ...a, name: finalName, type: editType, color: prColor, balance: newBal, details: ef }; }); });
    setShowEdit(false);
    showToast(finalName + " updated");
  };

  var doAddMoney = function () {
    var amt = parseFloat(addMoneyAmount);
    if (!amt || amt <= 0 || !addMoneyAccountId) return;
    var acc = accounts.find(function (a) { return a.id === addMoneyAccountId; });
    if (!acc) return;
    var accName = acc.name;
    var aid = addMoneyAccountId;
    setAccounts(function (prev) { return prev.map(function (a) { return a.id === aid ? { ...a, balance: a.balance + amt } : a; }); });
    var t: Transaction = { id: generateId(), amount: amt, type: "income", merchant: "Added to " + accName, category: "Other", date: new Date().toISOString().split("T")[0], note: "", source: "manual", accountId: aid };
    setTransactions(function (prev) { return [t, ...prev]; });
    setAddMoneyAmount(""); setShowAddMoney(false); setAddMoneyAccountId("");
    showToast(formatCurrency(amt) + " added to " + accName);
  };

  var doTransfer = function () {
    var amt = parseFloat(transferAmount);
    if (!amt || amt <= 0 || !transferFrom || !transferTo || transferFrom === transferTo) return;
    var fa = accounts.find(function (a) { return a.id === transferFrom; });
    var ta = accounts.find(function (a) { return a.id === transferTo; });
    if (!fa || !ta) return;
    if (isOnlineType(fa.type) !== isOnlineType(ta.type)) { showToast("Cannot transfer between cash and online accounts"); return; }
    if (fa.balance < amt) { showToast("Not enough balance in " + fa.name); return; }
    var fromName = fa.name;
    var toName = ta.name;
    var fid = transferFrom;
    var tid = transferTo;
    setAccounts(function (prev) { return prev.map(function (a) { if (a.id === fid) return { ...a, balance: a.balance - amt }; if (a.id === tid) return { ...a, balance: a.balance + amt }; return a; }); });
    var today = new Date().toISOString().split("T")[0];
    setTransfers(function (prev) { return [{ id: generateId(), from: fid, to: tid, amount: amt, date: today }, ...prev]; });
    setTransactions(function (prev) { return [{ id: generateId(), amount: -amt, type: "expense" as "income" | "expense", merchant: "Transfer to " + toName, category: "Other", date: today, note: "Transfer", source: "manual" as "manual" | "sms" | "csv", accountId: fid }, { id: generateId(), amount: amt, type: "income" as "income" | "expense", merchant: "Transfer from " + fromName, category: "Other", date: today, note: "Transfer", source: "manual" as "manual" | "sms" | "csv", accountId: tid }, ...prev]; });
    setTransferAmount(""); setTransferFrom(""); setTransferTo(""); setShowTransfer(false);
    showToast(formatCurrency(amt) + " moved from " + fromName + " to " + toName);
  };

  var saveName = function () { if (nameInput.trim()) setProfile(function (p) { return { ...p, name: nameInput.trim() }; }); setEditingName(false); };
  var saveEmail = function () { if (emailInput.trim()) setProfile(function (p) { return { ...p, email: emailInput.trim() }; }); setEditingEmail(false); };
  var exportData = function () {
    var blob = new Blob([JSON.stringify({ profile: profile, accounts: accounts, transactions: transactions, transfers: transfers, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob); var a = document.createElement("a"); a.href = url; a.download = "casha-" + new Date().toISOString().split("T")[0] + ".json"; a.click(); URL.revokeObjectURL(url); showToast("Downloaded");
  };
  var clearAll = function () { setTransactions([]); setAccounts([]); setTransfers([]); setShowClearConfirm(false); showToast("Cleared everything"); };
  var handleParse = function () { if (!statementText.trim()) return; setParsedEntries(parseStatement(statementText)); };
  var toggleEntry = function (idx: number) { setParsedEntries(function (prev) { return prev.map(function (e, i) { return i === idx ? { ...e, selected: !e.selected } : e; }); }); };
  var addParsed = function () {
    var sel = parsedEntries.filter(function (e) { return e.selected; });
    setTransactions(function (prev) { return sel.map(function (e) { return { id: generateId(), amount: e.isIncome ? e.amount : -e.amount, type: (e.isIncome ? "income" : "expense") as "income" | "expense", merchant: e.merchant, category: e.category, date: e.date, note: "", source: "csv" as "manual" | "sms" | "csv" }; }).concat(prev); });
    setParsedEntries([]); setStatementText(""); showToast(sel.length + " transactions added");
  };
  var getAccTx = function (id: string) { return transactions.filter(function (t) { return t.accountId === id; }).slice(0, 5); };
  var initials = profile.name.split(" ").map(function (w) { return w[0] || ""; }).join("").toUpperCase().substring(0, 2);
  var currentFields: Record<string, string> = getPresetFields(selectedType);
  var editCurrentFields: Record<string, string> = getPresetFields(editType);

  /* ---- shared badge style ---- */
  var badgeStyle = function (color1: string, color2: string, text: string): React.CSSProperties => {
    return { width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, " + color1 + ", " + color2 + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 };
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 0 40px" }}>
      {toast && <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "var(--green)", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "inherit", boxShadow: "0 4px 20px rgba(26,143,78,0.3)", animation: "fadeIn 200ms ease" }}>{toast}</div>}

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5, margin: "0 0 2px 0" }}>Accounts</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>See where your money is. Add accounts, move money between them.</p>
      </div>

      {/* TOTAL BALANCE */}
      <div style={{ background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", borderRadius: 16, padding: "24px 24px 20px", marginBottom: 16, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -24, right: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.75, margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: 0.08 }}>Your Total Balance</p>
        <p style={{ fontSize: 34, fontWeight: 800, margin: "0 0 14px 0", fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>{formatCurrency(totalBalance)}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[{ label: "Banks", value: bankTotal, icon: "BK" }, { label: "UPI", value: upiTotal, icon: "UP" }, { label: "Cash", value: cashTotal, icon: "CA" }, { label: "Cards", value: cardTotal, icon: "CD" }].map(function (s) {
            return (<div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px" }}><div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}><span style={{ width: 18, height: 18, borderRadius: 4, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800 }}>{s.icon}</span><span style={{ fontSize: 9, fontWeight: 600, opacity: 0.75 }}>{s.label}</span></div><p style={{ fontSize: 15, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(s.value)}</p></div>);
          })}
        </div>
      </div>

      {/* INCOME / EXPENSE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, margin: "0 0 2px 0" }}>Money in this month</p><p style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", margin: 0, fontVariantNumeric: "tabular-nums" }}>+{formatCurrency(thisMonthInc)}</p></div>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, margin: "0 0 2px 0" }}>Money out this month</p><p style={{ fontSize: 18, fontWeight: 700, color: "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>-{formatCurrency(thisMonthExp)}</p></div>
      </div>

      {/* 6-MONTH CHART */}
      <div style={{ background: "var(--surface)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>6-Month Overview</p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, marginBottom: 8 }}>
          {sixMonths.map(function (m) {
            var incH = Math.max(4, (m.income / maxMonthVal) * 100);
            var expH = Math.max(4, (m.expense / maxMonthVal) * 100);
            return (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 100, width: "100%" }}>
                  <div style={{ flex: 1, height: incH, background: "var(--green)", borderRadius: 3, minHeight: 4, transition: "height 400ms ease", opacity: 0.8 }} title={"Income: " + formatCurrency(m.income)} />
                  <div style={{ flex: 1, height: expH, background: "var(--red)", borderRadius: 3, minHeight: 4, transition: "height 400ms ease", opacity: 0.8 }} title={"Expense: " + formatCurrency(m.expense)} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)" }}>{m.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--green)" }} /><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>Income</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--red)" }} /><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>Expense</span></div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={function () { setSelectedType("bank"); setFormFields({}); setInitialBalance(""); setAutoDetectedBalance(null); setShowAdd(true); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "all 200ms ease", boxShadow: "0 2px 8px rgba(26,143,78,0.15)" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Add Account</button>
        {accounts.length >= 1 && <button onClick={function () { setAddMoneyAccountId(accounts[0].id); setAddMoneyAmount(""); setShowAddMoney(true); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Add Money</button>}
        {onlineAccounts.length >= 2 && <button onClick={function () { setTransferFrom(onlineAccounts[0].id); setTransferTo(onlineAccounts[1].id); setTransferAmount(""); setShowTransfer(true); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>Transfer</button>}
      </div>

      {/* ACCOUNTS LIST */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>Your Accounts</p>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>{accounts.length} added — click to expand</p>
        </div>
        {accounts.length === 0 ? (
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: "36px 20px", border: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg></div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 4px 0" }}>No accounts yet</p>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px 0", lineHeight: 1.5 }}>Add your bank account, UPI, cash wallet, or card.<br />Your total balance will show here.</p>
            <button onClick={function () { setSelectedType("bank"); setFormFields({}); setInitialBalance(""); setAutoDetectedBalance(null); setShowAdd(true); }} style={{ padding: "8px 18px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add Your First Account</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {accounts.map(function (acc) {
              var g = getGrad(acc.type);
              var isExp = expandedAccount === acc.id;
              var txs = getAccTx(acc.id);
              var txCount = transactions.filter(function (t) { return t.accountId === acc.id; }).length;
              return (
                <div key={acc.id} style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", background: "var(--bg)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", transition: "background 150ms ease" }} onClick={function () { setExpandedAccount(isExp ? null : acc.id); }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, " + g[0] + ", " + g[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{getIcon(acc.type)}</span></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.name}</p>
                        <span style={{ fontSize: 8, fontWeight: 700, color: acc.color, background: acc.color + "15", padding: "1px 5px", borderRadius: 3, textTransform: "uppercase" }}>{acc.type}</span>
                        {!isOnlineType(acc.type) && <span style={{ fontSize: 7, fontWeight: 700, color: "#EAB308", background: "#FEFCE8", padding: "1px 4px", borderRadius: 2 }}>PHYSICAL</span>}
                      </div>
                      <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{txCount > 0 ? txCount + " transactions" : "No transactions yet"}{acc.details.bankName ? " \u00B7 " + acc.details.bankName : ""}{acc.details.upiId ? " \u00B7 " + acc.details.upiId : ""}{acc.details.accountNumber ? " \u00B7 \u2022\u2022\u2022" + acc.details.accountNumber.slice(-4) : ""}</p>
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: acc.balance >= 0 ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{formatCurrency(acc.balance)}</p>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 200ms ease", transform: isExp ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  {isExp && (
                    <div style={{ padding: "0 14px 12px", animation: "fadeIn 200ms ease" }}>
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginBottom: 8 }}>
                        {Object.keys(acc.details).length > 0 && (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>{Object.entries(acc.details).map(function (e) { return (<div key={e[0]} style={{ padding: "4px 8px", borderRadius: 5, background: "var(--surface)" }}><span style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>{e[0].replace(/([A-Z])/g, " $1").trim()}</span><p style={{ fontSize: 11, fontWeight: 500, color: "var(--text)", margin: "1px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e[1]}</p></div>); })}</div>)}
                        {txs.length > 0 && (<div style={{ marginBottom: 8 }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>Recent Activity</p>{txs.map(function (t) { var ci = getCatInfo(t.category); return (<div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}><span style={{ width: 16, height: 12, borderRadius: 2, background: ci.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, fontWeight: 800, color: ci.color }}>{ci.label}</span><span style={{ flex: 1, fontSize: 11, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.merchant}</span><span style={{ fontSize: 11, fontWeight: 700, color: t.type === "income" ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>{t.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(t.amount))}</span></div>); })}</div>)}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={function (e) { e.stopPropagation(); openEdit(acc); }} style={{ flex: 1, height: 30, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>Edit</button>
                        <button onClick={function (e) { e.stopPropagation(); setAddMoneyAccountId(acc.id); setAddMoneyAmount(""); setShowAddMoney(true); }} style={{ flex: 1, height: 30, borderRadius: 6, background: "var(--green-dim)", border: "1px solid var(--green-border)", color: "var(--green)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green-dim)"; e.currentTarget.style.color = "var(--green)"; }}>+ Add Money</button>
                        <button onClick={function (e) { e.stopPropagation(); removeAccount(acc.id); }} style={{ height: 30, padding: "0 10px", borderRadius: 6, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--red-border)"; e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.background = "var(--red-dim)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {accounts.length === 0 && (<div style={{ background: "var(--surface)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)", marginBottom: 16 }}><p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 10px 0" }}>How it works</p><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[{ step: "1", title: "Add your accounts", desc: "Bank, UPI (GPay/PhonePe), cash wallet, or card" }, { step: "2", title: "Auto-detect balance", desc: "Enter card/bank/UPI details and we'll fetch your balance" }, { step: "3", title: "Track everything", desc: "Add money, transfer between online accounts, see your total" }].map(function (s) { return (<div key={s.step} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}><span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "var(--green)", flexShrink: 0 }}>{s.step}</span><div><p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>{s.title}</p><p style={{ fontSize: 11, color: "var(--muted)", margin: "1px 0 0 0" }}>{s.desc}</p></div></div>); })}</div></div>)}

      {/* IMPORT STATEMENT */}
      <div style={{ background: "var(--surface)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>Import Statement</p></div>
        <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px 0" }}>Paste your bank statement or SMS. Amounts, names and categories are auto-detected.</p>
        <textarea value={statementText} onChange={function (e) { setStatementText(e.target.value); setParsedEntries([]); }} placeholder={"15/01/2025 SWIGGY 250.00\n16/01/2025 NETFLIX 15.99\n17/01/2025 SALARY 50000.00 CR\n18/01/2025 UBER 185.50"} style={{ width: "100%", height: 80, borderRadius: 8, padding: "10px", fontSize: 11, fontFamily: "monospace", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.5, marginBottom: 8, transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
        <button onClick={handleParse} disabled={!statementText.trim()} style={{ height: 32, padding: "0 14px", borderRadius: 7, background: statementText.trim() ? "var(--green)" : "var(--card)", border: "none", color: statementText.trim() ? "#fff" : "var(--faint)", fontSize: 11, fontWeight: 600, cursor: statementText.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 150ms ease" }}>Detect Transactions</button>
        {parsedEntries.length > 0 && (<div style={{ marginTop: 12, animation: "fadeIn 200ms ease" }}><p style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", margin: "0 0 8px 0" }}>Found {parsedEntries.length} transactions — toggle to select</p><div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>{parsedEntries.map(function (entry, idx) { var ci = getCatInfo(entry.category); return (<div key={idx} onClick={function () { toggleEntry(idx); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, background: entry.selected ? "var(--green-dim)" : "var(--bg)", border: "1px solid " + (entry.selected ? "var(--green-border)" : "var(--border)"), cursor: "pointer", transition: "all 120ms ease", opacity: entry.selected ? 1 : 0.45 }}><div style={{ width: 16, height: 16, borderRadius: 3, border: entry.selected ? "none" : "2px solid var(--border)", background: entry.selected ? "var(--green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{entry.selected && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}</div><span style={{ width: 18, height: 13, borderRadius: 2, background: ci.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, fontWeight: 800, color: ci.color, flexShrink: 0 }}>{ci.label}</span><span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.merchant}</span><span style={{ fontSize: 11, fontWeight: 700, color: entry.isIncome ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{entry.isIncome ? "+" : "-"}{formatCurrency(entry.amount)}</span><span style={{ fontSize: 9, color: "var(--muted)", flexShrink: 0 }}>{entry.date}</span></div>); })}</div><button onClick={addParsed} style={{ height: 32, padding: "0 14px", borderRadius: 7, background: "var(--green)", border: "none", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add {parsedEntries.filter(function (e) { return e.selected; }).length} to Transactions</button></div>)}
      </div>

      {/* TRANSFER RULES */}
      <div style={{ background: "var(--surface)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>How Transfers Work</p>
            <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>Understanding how money moves between your accounts</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--green-dim)", border: "1px solid var(--green-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <span style={badgeStyle("#1E3A5F", "#3B82F6", "BK")}>BK</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              <span style={badgeStyle("#4C1D95", "#8B5CF6", "UP")}>UP</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", margin: 0 }}>Online accounts can transfer freely</p>
              <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Bank ↔ UPI ↔ Card — instant electronic transfer between any online accounts</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--red-dim)", border: "1px solid var(--red-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, opacity: 0.5 }}>
              <span style={badgeStyle("#064E3B", "#22C55E", "CA")}>CA</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5"><line x1="2" y1="2" x2="22" y2="22" /></svg>
              <span style={badgeStyle("#1E3A5F", "#3B82F6", "BK")}>BK</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", margin: 0 }}>Cash cannot transfer electronically</p>
              <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Physical cash and online accounts are separate — no direct electronic link</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--green-dim)", border: "1px solid var(--green-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <span style={badgeStyle("#064E3B", "#22C55E", "CA")}>CA</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>+</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", margin: 0 }}>Use "Add Money" to deposit cash</p>
              <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Manually record cash going into any bank, UPI, or card account</p>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE & SETTINGS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 0 }}>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{initials}</span></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingName ? (<input ref={nameRef} value={nameInput} onChange={function (e) { setNameInput(e.target.value); }} onBlur={saveName} onKeyDown={function (e) { if (e.key === "Enter") saveName(); }} style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", background: "transparent", border: "none", borderBottom: "2px solid var(--green)", outline: "none", fontFamily: "inherit", width: "100%", padding: "0 0 1px 0" }} />) : (<p onClick={function () { setNameInput(profile.name); setEditingName(true); }} style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, cursor: "pointer" }} onMouseEnter={function (e) { e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={function (e) { e.currentTarget.style.color = "var(--text)"; }}>{profile.name} <span style={{ fontSize: 9, color: "var(--muted)" }}>tap to edit</span></p>)}
            {editingEmail ? (<input ref={emailRef} value={emailInput} onChange={function (e) { setEmailInput(e.target.value); }} onBlur={saveEmail} onKeyDown={function (e) { if (e.key === "Enter") saveEmail(); }} style={{ fontSize: 10, color: "var(--muted)", background: "transparent", border: "none", borderBottom: "2px solid var(--green)", outline: "none", fontFamily: "inherit", width: "100%", padding: "0 0 1px 0" }} />) : (<p onClick={function () { setEmailInput(profile.email); setEditingEmail(true); }} style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0", cursor: "pointer" }}>{profile.email}</p>)}
          </div>
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>Export data</span><button onClick={exportData} style={{ height: 26, padding: "0 10px", borderRadius: 5, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}>Download JSON</button></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 11, fontWeight: 600, color: "var(--red)" }}>Clear all data</span>{showClearConfirm ? (<div style={{ display: "flex", gap: 4 }}><button onClick={function () { setShowClearConfirm(false); }} style={{ height: 26, padding: "0 8px", borderRadius: 5, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>No</button><button onClick={clearAll} style={{ height: 26, padding: "0 8px", borderRadius: 5, background: "var(--red)", border: "none", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Yes, clear</button></div>) : (<button onClick={function () { setShowClearConfirm(true); }} style={{ height: 26, padding: "0 10px", borderRadius: 5, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--red)", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}>Clear</button>)}</div>
        </div>
      </div>

      {/* ADD ACCOUNT MODAL */}
      {showAdd && (<div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowAdd(false); }}><div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0" }}>Add Account</h2><p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 12px 0" }}>Choose type, fill details, auto-detect or type balance.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 12 }}>{PRESETS.map(function (p) { var isActive = selectedType === p.type; return (<button key={p.type} onClick={function () { setSelectedType(p.type); setFormFields({}); setAutoDetectedBalance(null); setInitialBalance(""); }} style={{ padding: "8px 0", borderRadius: 7, border: "1px solid " + (isActive ? p.color + "40" : "var(--border)"), background: isActive ? p.color + "10" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><span style={{ width: 24, height: 24, borderRadius: 6, background: isActive ? p.color + "18" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: p.color }}>{p.icon}</span><span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? p.color : "var(--muted)" }}>{p.label}</span></button>); })}</div>
        {Object.keys(currentFields).map(function (key) { var ph = currentFields[key]; return (<input key={key} type="text" placeholder={ph} value={formFields[key] || ""} onChange={function (e) { setFormFields(function (f) { var n = { ...f }; n[key] = key === "cardNumber" ? fmtCard(e.target.value) : key === "expiry" ? fmtExp(e.target.value) : e.target.value; return n; }); setAutoDetectedBalance(null); }} style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6, transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />); })}
        {canAutoDetect && hasEnoughDetail && autoDetectedBalance === null && (<div style={{ marginBottom: 8, animation: "fadeIn 200ms ease" }}><button onClick={requestAutoDetect} disabled={detecting} style={{ width: "100%", height: 38, borderRadius: 8, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: detecting ? "wait" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 200ms ease", boxShadow: "0 2px 12px rgba(26,143,78,0.2)" }} onMouseEnter={function (e) { if (!detecting) e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>{detecting ? "Detecting..." : "Auto-Detect Balance"}</button><p style={{ fontSize: 9, color: "var(--muted)", margin: "4px 0 0 0", textAlign: "center" }}>We'll ask for permission to check your balance</p></div>)}
        {autoDetectedBalance !== null && (<div style={{ marginBottom: 8, padding: "10px 12px", borderRadius: 8, background: "var(--green-dim)", border: "1px solid var(--green-border)", animation: "fadeIn 200ms ease" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><p style={{ fontSize: 9, fontWeight: 600, color: "var(--green)", margin: 0, textTransform: "uppercase" }}>Balance Detected</p><p style={{ fontSize: 20, fontWeight: 800, color: "var(--green)", margin: "2px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(autoDetectedBalance)}</p></div><button onClick={function () { setAutoDetectedBalance(null); setInitialBalance(""); }} style={{ height: 24, padding: "0 8px", borderRadius: 5, background: "transparent", border: "1px solid var(--green-border)", color: "var(--green)", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Change</button></div></div>)}
        <div style={{ marginBottom: 10 }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>{autoDetectedBalance !== null ? "Detected balance (editable)" : canAutoDetect && hasEnoughDetail ? "Or type balance manually" : "How much is in this account?"}</p><input type="text" inputMode="decimal" placeholder="0.00" value={initialBalance} onChange={function (e) { setInitialBalance(e.target.value.replace(/[^0-9.]/g, "")); setAutoDetectedBalance(null); }} style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit", fontVariantNumeric: "tabular-nums", transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} /></div>
        {formFields.cardNumber && formFields.cardNumber.replace(/\D/g, "").length >= 4 && (<div style={{ marginBottom: 8, padding: "4px 8px", borderRadius: 5, background: "var(--green-dim)", border: "1px solid var(--green-border)", animation: "fadeIn 150ms ease" }}><span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)" }}>{detectCardType(formFields.cardNumber)} detected</span></div>)}
        <div style={{ display: "flex", gap: 6 }}><button onClick={function () { setShowAdd(false); }} style={{ flex: 1, height: 38, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button><button onClick={addAccount} style={{ flex: 1, height: 38, borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(26,143,78,0.15)", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>Add Account</button></div>
      </div></div>)}

      {/* PERMISSION MODAL */}
      {showPerm && (<div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", animation: "fadeIn 200ms ease" }}><div style={{ background: "var(--bg)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 340, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>Check Your Balance?</h3>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 6px 0", lineHeight: 1.5 }}>Allow Casha to securely check your {selectedType === "bank" ? "bank account" : selectedType === "upi" ? "UPI wallet" : "card"} balance?</p>
        <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 16px 0", lineHeight: 1.5 }}>We'll only read your current balance once.<br />Your credentials are never stored.</p>
        <div style={{ display: "flex", gap: 8 }}><button onClick={denyPermission} style={{ flex: 1, height: 40, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>No, I'll type it</button><button onClick={grantPermission} style={{ flex: 1, height: 40, borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(26,143,78,0.15)" }}>Yes, check it</button></div>
      </div></div>)}

      {/* EDIT MODAL */}
      {showEdit && (<div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowEdit(false); }}><div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0" }}>Edit Account</h2><p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 12px 0" }}>Change name, type, balance, or details.</p>
        <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>Account name</p>
        <input type="text" placeholder="Account name" value={editName} onChange={function (e) { setEditName(e.target.value); }} style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "inherit", marginBottom: 10, transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
        <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>Type</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 10 }}>{PRESETS.map(function (p) { var isActive = editType === p.type; return (<button key={p.type} onClick={function () { setEditType(p.type); }} style={{ padding: "8px 0", borderRadius: 7, border: "1px solid " + (isActive ? p.color + "40" : "var(--border)"), background: isActive ? p.color + "10" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><span style={{ width: 24, height: 24, borderRadius: 6, background: isActive ? p.color + "18" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: p.color }}>{p.icon}</span><span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? p.color : "var(--muted)" }}>{p.label}</span></button>); })}</div>
        <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>Balance</p>
        <input type="text" inputMode="decimal" placeholder="0.00" value={editBalance} onChange={function (e) { setEditBalance(e.target.value.replace(/[^0-9.\-]/g, "")); }} style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit", fontVariantNumeric: "tabular-nums", marginBottom: 10, transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
        <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>Details</p>
        {Object.keys(editCurrentFields).map(function (key) { var ph = editCurrentFields[key]; return (<input key={key} type="text" placeholder={ph} value={editFields[key] || ""} onChange={function (e) { setEditFields(function (f) { var n = { ...f }; n[key] = key === "cardNumber" ? fmtCard(e.target.value) : key === "expiry" ? fmtExp(e.target.value) : e.target.value; return n; }); }} style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6, transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />); })}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}><button onClick={function () { setShowEdit(false); }} style={{ flex: 1, height: 38, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button><button onClick={doEdit} style={{ flex: 1, height: 38, borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(26,143,78,0.15)", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>Save Changes</button></div>
      </div></div>)}

      {/* ADD MONEY MODAL */}
      {showAddMoney && (<div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowAddMoney(false); }}><div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 360, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0" }}>Add Money</h2><p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 12px 0" }}>Pick an account and enter the amount to add.</p>
        <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>Which account?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>{accounts.map(function (acc) { var isSel = addMoneyAccountId === acc.id; return (<button key={acc.id} onClick={function () { setAddMoneyAccountId(acc.id); }} style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid " + (isSel ? acc.color + "40" : "var(--border)"), background: isSel ? acc.color + "10" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 120ms ease", display: "flex", alignItems: "center", gap: 3 }}><span style={{ fontSize: 7, fontWeight: 800, color: acc.color }}>{getIcon(acc.type)}</span><span style={{ fontSize: 10, fontWeight: isSel ? 700 : 500, color: isSel ? acc.color : "var(--muted)" }}>{acc.name}</span></button>); })}</div>
        <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>How much?</p>
        <input type="text" inputMode="decimal" placeholder="0.00" value={addMoneyAmount} onChange={function (e) { setAddMoneyAmount(e.target.value.replace(/[^0-9.]/g, "")); }} style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 20, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 12, fontVariantNumeric: "tabular-nums", transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
        <div style={{ display: "flex", gap: 6 }}><button onClick={function () { setShowAddMoney(false); }} style={{ flex: 1, height: 38, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button><button onClick={doAddMoney} disabled={!addMoneyAmount || !addMoneyAccountId} style={{ flex: 1, height: 38, borderRadius: 8, background: addMoneyAmount && addMoneyAccountId ? "var(--green)" : "var(--card)", border: "none", color: addMoneyAmount && addMoneyAccountId ? "#fff" : "var(--faint)", fontSize: 12, fontWeight: 600, cursor: addMoneyAmount && addMoneyAccountId ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 200ms ease" }}>Add</button></div>
      </div></div>)}

      {/* TRANSFER MODAL */}
      {showTransfer && (<div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowTransfer(false); }}><div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0" }}>Transfer Money</h2><p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 12px 0" }}>Move money between online accounts. Cash can't be transferred electronically.</p>
        <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>From</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>{accounts.map(function (acc) { var isSel = transferFrom === acc.id; return (<button key={acc.id} onClick={function () { setTransferFrom(acc.id); setTransferTo(""); }} style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid " + (isSel ? acc.color + "40" : "var(--border)"), background: isSel ? acc.color + "10" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 120ms ease", display: "flex", alignItems: "center", gap: 3 }}><span style={{ fontSize: 7, fontWeight: 800, color: acc.color }}>{getIcon(acc.type)}</span><span style={{ fontSize: 10, fontWeight: isSel ? 700 : 500, color: isSel ? acc.color : "var(--muted)" }}>{acc.name}</span><span style={{ fontSize: 8, color: "var(--muted)" }}>{formatCurrency(acc.balance)}</span>{!isOnlineType(acc.type) && <span style={{ fontSize: 6, fontWeight: 700, color: "#EAB308" }}>PHYS</span>}</button>); })}</div>
        <div style={{ textAlign: "center", margin: "4px 0" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg></div>
        <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>To</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>{eligibleToAccounts.map(function (acc) { var isSel = transferTo === acc.id; return (<button key={acc.id} onClick={function () { setTransferTo(acc.id); }} style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid " + (isSel ? acc.color + "40" : "var(--border)"), background: isSel ? acc.color + "10" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 120ms ease", display: "flex", alignItems: "center", gap: 3 }}><span style={{ fontSize: 7, fontWeight: 800, color: acc.color }}>{getIcon(acc.type)}</span><span style={{ fontSize: 10, fontWeight: isSel ? 700 : 500, color: isSel ? acc.color : "var(--muted)" }}>{acc.name}</span></button>); })}{transferFrom && eligibleToAccounts.length === 0 && (<p style={{ fontSize: 10, color: "var(--red)", margin: 0, padding: "6px 0" }}>No eligible accounts. Cash can only transfer to cash.</p>)}</div>
        <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 4px 0" }}>How much?</p>
        <input type="text" inputMode="decimal" placeholder="0.00" value={transferAmount} onChange={function (e) { setTransferAmount(e.target.value.replace(/[^0-9.]/g, "")); }} style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 20, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 12, fontVariantNumeric: "tabular-nums", transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
        <div style={{ display: "flex", gap: 6 }}><button onClick={function () { setShowTransfer(false); }} style={{ flex: 1, height: 38, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button><button onClick={doTransfer} disabled={!transferAmount || !transferFrom || !transferTo || transferFrom === transferTo} style={{ flex: 1, height: 38, borderRadius: 8, background: transferAmount && transferFrom && transferTo && transferFrom !== transferTo ? "var(--green)" : "var(--card)", border: "none", color: transferAmount && transferFrom && transferTo && transferFrom !== transferTo ? "#fff" : "var(--faint)", fontSize: 12, fontWeight: 600, cursor: transferAmount && transferFrom && transferTo && transferFrom !== transferTo ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 200ms ease" }}>Transfer</button></div>
      </div></div>)}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}