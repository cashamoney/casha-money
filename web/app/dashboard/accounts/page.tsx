"use client";

import { useState, useEffect, useRef } from "react";

type Account = {
  id: string;
  type: "bank" | "upi" | "cash" | "card";
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

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatCurrency(n: number) {
  var abs = Math.abs(n);
  var str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "-" : "") + "$" + str;
}

var ACCOUNT_PRESETS: { type: "bank" | "upi" | "cash" | "card"; label: string; color: string; icon: string; placeholders: Record<string, string> }[] = [
  { type: "bank", label: "Bank", color: "#3B82F6", icon: "BK", placeholders: { bankName: "Bank name", accountNumber: "Account number (last 4)", ifsc: "IFSC code", holderName: "Account holder name" } },
  { type: "upi", label: "UPI", color: "#8B5CF6", icon: "UP", placeholders: { platform: "GPay / PhonePe / Paytm / other", upiId: "yourname@upi", holderName: "Name on UPI" } },
  { type: "cash", label: "Cash", color: "#22C55E", icon: "CA", placeholders: { holderName: "Wallet name (e.g. My Wallet)" } },
  { type: "card", label: "Card", color: "#F97316", icon: "CD", placeholders: { cardNumber: "Card number", expiry: "MM/YY", holderName: "Cardholder name", bankName: "Bank name" } },
];

function detectCardType(n: string): string {
  var c = n.replace(/\D/g, "");
  if (c.startsWith("4")) return "VISA";
  if (c.startsWith("5") || c.startsWith("2")) return "MASTERCARD";
  if (c.startsWith("6")) return "RuPay";
  if (c.startsWith("3")) return "AMEX";
  return "CARD";
}

function getAccountIcon(type: string): string {
  if (type === "bank") return "BK";
  if (type === "upi") return "UP";
  if (type === "cash") return "CA";
  if (type === "card") return "CD";
  return "AC";
}

function getAccountGradient(type: string): [string, string] {
  if (type === "bank") return ["#1E3A5F", "#3B82F6"];
  if (type === "upi") return ["#4C1D95", "#8B5CF6"];
  if (type === "cash") return ["#064E3B", "#22C55E"];
  if (type === "card") return ["#7C2D12", "#F97316"];
  return ["#1A1A2E", "#4A4A6A"];
}

function formatCardInput(n: string): string {
  var c = n.replace(/\D/g, "").substring(0, 16);
  var parts: string[] = [];
  for (var i = 0; i < c.length; i += 4) parts.push(c.substring(i, i + 4));
  return parts.join(" ");
}

function formatExpiry(v: string): string {
  var c = v.replace(/\D/g, "").substring(0, 4);
  if (c.length >= 2) return c.substring(0, 2) + "/" + c.substring(2);
  return c;
}

function getMonthlyData(txs: Transaction[]): { month: string; expense: number; income: number }[] {
  var now = new Date();
  var names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var data: { month: string; expense: number; income: number }[] = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var ms = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    var exp = txs.filter(function (t) { return t.type === "expense" && t.date.startsWith(ms); }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);
    var inc = txs.filter(function (t) { return t.type === "income" && t.date.startsWith(ms); }).reduce(function (s, t) { return s + t.amount; }, 0);
    data.push({ month: names[d.getMonth()], expense: exp, income: inc });
  }
  return data;
}

function getCategoryIcon(name: string): { letters: string; color: string; bg: string } {
  var cats: Record<string, { letters: string; color: string; bg: string }> = {
    "Food": { letters: "FD", color: "#F97316", bg: "#FFF7ED" }, "Transport": { letters: "TR", color: "#3B82F6", bg: "#EFF6FF" },
    "Shopping": { letters: "SH", color: "#A855F7", bg: "#FAF5FF" }, "Entertainment": { letters: "EN", color: "#EC4899", bg: "#FDF2F8" },
    "Bills": { letters: "BL", color: "#EAB308", bg: "#FEFCE8" }, "Rent": { letters: "RN", color: "#EF4444", bg: "#FEF2F2" },
    "Health": { letters: "HT", color: "#14B8A6", bg: "#F0FDFA" }, "Education": { letters: "ED", color: "#6366F1", bg: "#EEF2FF" },
    "Investment": { letters: "IV", color: "#06B6D4", bg: "#ECFEFF" }, "Salary": { letters: "SA", color: "#22C55E", bg: "#F0FDF4" },
    "Freelance": { letters: "FR", color: "#10B981", bg: "#ECFDF5" }, "Other": { letters: "OT", color: "#6B7280", bg: "#F9FAFB" },
  };
  return cats[name] || { letters: "OT", color: "#6B7280", bg: "#F9FAFB" };
}

function parseStatement(text: string): { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean }[] {
  var lines = text.trim().split("\n");
  var results: { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean }[] = [];
  lines.forEach(function (line) {
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

export default function AccountsPage() {
  var [accounts, setAccounts] = useState<Account[]>([]);
  var [transactions, setTransactions] = useState<Transaction[]>([]);
  var [transfers, setTransfers] = useState<TransferRecord[]>([]);
  var [profile, setProfile] = useState<Profile>({ name: "John Doe", email: "john@example.com" });
  var [showAdd, setShowAdd] = useState(false);
  var [showAddMoney, setShowAddMoney] = useState(false);
  var [showTransfer, setShowTransfer] = useState(false);
  var [addMoneyAccountId, setAddMoneyAccountId] = useState("");
  var [addMoneyAmount, setAddMoneyAmount] = useState("");
  var [transferFrom, setTransferFrom] = useState("");
  var [transferTo, setTransferTo] = useState("");
  var [transferAmount, setTransferAmount] = useState("");
  var [selectedType, setSelectedType] = useState<"bank" | "upi" | "cash" | "card">("bank");
  var [formFields, setFormFields] = useState<Record<string, string>>({});
  var [initialBalance, setInitialBalance] = useState("");
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

  useEffect(function () {
    var a = localStorage.getItem("casha-accounts");
    if (a) { try { setAccounts(JSON.parse(a)); } catch (e) {} }
    var t = localStorage.getItem("casha-transactions");
    if (t) { try { setTransactions(JSON.parse(t)); } catch (e) {} }
    var tr = localStorage.getItem("casha-transfers");
    if (tr) { try { setTransfers(JSON.parse(tr)); } catch (e) {} }
    var p = localStorage.getItem("casha-profile");
    if (p) { try { setProfile(JSON.parse(p)); } catch (e) {} }
  }, []);

  useEffect(function () { localStorage.setItem("casha-accounts", JSON.stringify(accounts)); }, [accounts]);
  useEffect(function () { localStorage.setItem("casha-transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(function () { localStorage.setItem("casha-transfers", JSON.stringify(transfers)); }, [transfers]);
  useEffect(function () { localStorage.setItem("casha-profile", JSON.stringify(profile)); }, [profile]);
  useEffect(function () { if (editingName && nameRef.current) nameRef.current.focus(); }, [editingName]);
  useEffect(function () { if (editingEmail && emailRef.current) emailRef.current.focus(); }, [editingEmail]);

  var showToast = function (msg: string) { setToast(msg); setTimeout(function () { setToast(""); }, 2500); };

  var totalBalance = accounts.reduce(function (s, a) { return s + a.balance; }, 0);
  var totalIncome = transactions.filter(function (t) { return t.type === "income"; }).reduce(function (s, t) { return s + t.amount; }, 0);
  var totalExpense = transactions.filter(function (t) { return t.type === "expense"; }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);
  var now = new Date();
  var thisMonthStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  var thisMonthExpense = transactions.filter(function (t) { return t.type === "expense" && t.date.startsWith(thisMonthStr); }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);
  var thisMonthIncome = transactions.filter(function (t) { return t.type === "income" && t.date.startsWith(thisMonthStr); }).reduce(function (s, t) { return s + t.amount; }, 0);
  var bankTotal = accounts.filter(function (a) { return a.type === "bank"; }).reduce(function (s, a) { return s + a.balance; }, 0);
  var upiTotal = accounts.filter(function (a) { return a.type === "upi"; }).reduce(function (s, a) { return s + a.balance; }, 0);
  var cashTotal = accounts.filter(function (a) { return a.type === "cash"; }).reduce(function (s, a) { return s + a.balance; }, 0);
  var cardTotal = accounts.filter(function (a) { return a.type === "card"; }).reduce(function (s, a) { return s + a.balance; }, 0);

  var currentPlaceholders: Record<string, string> = {};
  for (var pi = 0; pi < ACCOUNT_PRESETS.length; pi++) {
    if (ACCOUNT_PRESETS[pi].type === selectedType) {
      currentPlaceholders = ACCOUNT_PRESETS[pi].placeholders;
      break;
    }
  }
  var currentColor = "#3B82F6";
  for (var ci = 0; ci < ACCOUNT_PRESETS.length; ci++) {
    if (ACCOUNT_PRESETS[ci].type === selectedType) {
      currentColor = ACCOUNT_PRESETS[ci].color;
      break;
    }
  }

  var addAccount = function () {
    var preset = ACCOUNT_PRESETS.find(function (p) { return p.type === selectedType; });
    if (!preset) return;
    var name = formFields.holderName || formFields.bankName || formFields.platform || preset.label;
    var bal = parseFloat(initialBalance) || 0;
    var newAccount: Account = { id: generateId(), type: selectedType, name: name, balance: bal, color: preset.color, details: { ...formFields } };
    setAccounts(function (prev) { return [...prev, newAccount]; });
    if (bal > 0) {
      var t: Transaction = { id: generateId(), amount: bal, type: "income", merchant: "Initial balance", category: "Other", date: new Date().toISOString().split("T")[0], note: "Opening balance for " + name, source: "manual", accountId: newAccount.id };
      setTransactions(function (prev) { return [t, ...prev]; });
    }
    setFormFields({}); setInitialBalance(""); setShowAdd(false);
    showToast(name + " added");
  };

  var removeAccount = function (id: string) {
    var acc = accounts.find(function (a) { return a.id === id; });
    setAccounts(function (prev) { return prev.filter(function (a) { return a.id !== id; }); });
    if (acc) showToast(acc.name + " removed");
  };

  var doAddMoney = function () {
    var amt = parseFloat(addMoneyAmount);
    if (!amt || amt <= 0 || !addMoneyAccountId) return;
    var acc = accounts.find(function (a) { return a.id === addMoneyAccountId; });
    if (!acc) return;
    setAccounts(function (prev) { return prev.map(function (a) { return a.id === addMoneyAccountId ? { ...a, balance: a.balance + amt } : a; }); });
    var t: Transaction = { id: generateId(), amount: amt, type: "income", merchant: "Added to " + acc.name, category: "Other", date: new Date().toISOString().split("T")[0], note: "Money added", source: "manual", accountId: addMoneyAccountId };
    setTransactions(function (prev) { return [t, ...prev]; });
    setAddMoneyAmount(""); setShowAddMoney(false); setAddMoneyAccountId("");
    showToast(formatCurrency(amt) + " added to " + acc.name);
  };

  var doTransfer = function () {
    var amt = parseFloat(transferAmount);
    if (!amt || amt <= 0 || !transferFrom || !transferTo || transferFrom === transferTo) return;
    var fromAcc = accounts.find(function (a) { return a.id === transferFrom; });
    var toAcc = accounts.find(function (a) { return a.id === transferTo; });
    if (!fromAcc || !toAcc) return;
    if (fromAcc.balance < amt) { showToast("Insufficient balance in " + fromAcc.name); return; }
    setAccounts(function (prev) {
      return prev.map(function (a) {
        if (a.id === transferFrom) return { ...a, balance: a.balance - amt };
        if (a.id === transferTo) return { ...a, balance: a.balance + amt };
        return a;
      });
    });
    var tr: TransferRecord = { id: generateId(), from: transferFrom, to: transferTo, amount: amt, date: new Date().toISOString().split("T")[0] };
    setTransfers(function (prev) { return [tr, ...prev]; });
    var today = new Date().toISOString().split("T")[0];
    var t1: Transaction = { id: generateId(), amount: -amt, type: "expense", merchant: "Transfer to " + toAcc.name, category: "Other", date: today, note: "Transfer", source: "manual", accountId: transferFrom };
    var t2: Transaction = { id: generateId(), amount: amt, type: "income", merchant: "Transfer from " + fromAcc.name, category: "Other", date: today, note: "Transfer", source: "manual", accountId: transferTo };
    setTransactions(function (prev) { return [t1, t2, ...prev]; });
    setTransferAmount(""); setTransferFrom(""); setTransferTo(""); setShowTransfer(false);
    showToast(formatCurrency(amt) + " transferred");
  };

  var openAddMoneyFor = function (id: string) { setAddMoneyAccountId(id); setAddMoneyAmount(""); setShowAddMoney(true); };

  var saveName = function () { if (nameInput.trim()) setProfile(function (p) { return { ...p, name: nameInput.trim() }; }); setEditingName(false); };
  var saveEmail = function () { if (emailInput.trim()) setProfile(function (p) { return { ...p, email: emailInput.trim() }; }); setEditingEmail(false); };

  var exportData = function () {
    var data = { profile: profile, accounts: accounts, transactions: transactions, transfers: transfers, exportedAt: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = "casha-export-" + new Date().toISOString().split("T")[0] + ".json"; a.click(); URL.revokeObjectURL(url);
    showToast("Data exported");
  };

  var clearAll = function () { setTransactions([]); setAccounts([]); setTransfers([]); setShowClearConfirm(false); showToast("All data cleared"); };

  var handleParse = function () { if (!statementText.trim()) return; setParsedEntries(parseStatement(statementText)); };
  var toggleEntry = function (idx: number) { setParsedEntries(function (prev) { return prev.map(function (e, i) { return i === idx ? { ...e, selected: !e.selected } : e; }); }); };
  var addParsedToTransactions = function () {
    var selected = parsedEntries.filter(function (e) { return e.selected; });
    var newT = selected.map(function (e) { return { id: generateId(), amount: e.isIncome ? e.amount : -e.amount, type: e.isIncome ? "income" as const : "expense" as const, merchant: e.merchant, category: e.category, date: e.date, note: "", source: "csv" as const }; });
    setTransactions(function (prev) { return [...newT, ...prev]; });
    setParsedEntries([]); setStatementText("");
    showToast(newT.length + " transactions added");
  };

  var getAccountTx = function (id: string) { return transactions.filter(function (t) { return t.accountId === id; }).slice(0, 5); };
  var getAccountTransferCount = function (id: string) { return transfers.filter(function (t) { return t.from === id || t.to === id; }).length; };

  var monthlyData = getMonthlyData(transactions);
  var maxMonth = Math.max.apply(null, monthlyData.map(function (m) { return Math.max(m.expense, m.income); }).concat([1]));
  var initials = profile.name.split(" ").map(function (w) { return w[0] || ""; }).join("").toUpperCase().substring(0, 2);

  var placeholderKeys = Object.keys(currentPlaceholders);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 0" }}>
      {toast && <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "var(--green)", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "inherit", boxShadow: "0 4px 20px rgba(26,143,78,0.3)", animation: "fadeIn 200ms ease" }}>{toast}</div>}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5, margin: "0 0 4px 0" }}>Accounts</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>Your money, your way</p>
      </div>

      {/* TOTAL BALANCE HERO */}
      <div style={{ background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", borderRadius: 18, padding: "28px 28px 24px", marginBottom: 20, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -20, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 0.08 }}>Total Balance</p>
        <p style={{ fontSize: 38, fontWeight: 800, margin: "0 0 16px 0", fontVariantNumeric: "tabular-nums", letterSpacing: -1 }}>{formatCurrency(totalBalance)}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "Banks", value: bankTotal, icon: "BK" },
            { label: "UPI", value: upiTotal, icon: "UP" },
            { label: "Cash", value: cashTotal, icon: "CA" },
            { label: "Cards", value: cardTotal, icon: "CD" },
          ].map(function (s) {
            return (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 12px", backdropFilter: "blur(4px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 5, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800 }}>{s.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.8 }}>{s.label}</span>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(s.value)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "This month in", value: formatCurrency(thisMonthIncome), color: "var(--green)" },
          { label: "This month out", value: formatCurrency(thisMonthExpense), color: "var(--red)" },
          { label: "All time in", value: formatCurrency(totalIncome), color: "var(--green)" },
          { label: "All time out", value: formatCurrency(totalExpense), color: "var(--red)" },
        ].map(function (s) {
          return (
            <div key={s.label} style={{ background: "var(--surface)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px 0" }}>{s.label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: s.color, margin: 0, fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={function () { setSelectedType("bank"); setFormFields({}); setInitialBalance(""); setShowAdd(true); }} style={{ height: 38, padding: "0 16px", borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "all 200ms ease", boxShadow: "0 2px 8px rgba(26,143,78,0.2)" }}
          onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Add Account
        </button>
        {accounts.length >= 1 && (
          <button onClick={function () { setAddMoneyAccountId(accounts[0]?.id || ""); setAddMoneyAmount(""); setShowAddMoney(true); }} style={{ height: 38, padding: "0 16px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "all 200ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Add Money
          </button>
        )}
        {accounts.length >= 2 && (
          <button onClick={function () { setTransferFrom(accounts[0]?.id || ""); setTransferTo(accounts[1]?.id || ""); setTransferAmount(""); setShowTransfer(true); }} style={{ height: 38, padding: "0 16px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "all 200ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>Transfer
          </button>
        )}
      </div>

      {/* ACCOUNTS LIST */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 12px 0" }}>Your Accounts ({accounts.length})</p>
        {accounts.length === 0 ? (
          <div style={{ background: "var(--surface)", borderRadius: 14, padding: "48px 20px", border: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "0 0 4px 0" }}>No accounts yet</p>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px 0" }}>Add a bank, UPI, cash or card to start tracking</p>
            <button onClick={function () { setSelectedType("bank"); setFormFields({}); setInitialBalance(""); setShowAdd(true); }} style={{ padding: "8px 20px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add Account</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {accounts.map(function (acc) {
              var g = getAccountGradient(acc.type);
              var isExpanded = expandedAccount === acc.id;
              var accTx = getAccountTx(acc.id);
              var txCount = transactions.filter(function (t) { return t.accountId === acc.id; }).length;
              var trCount = getAccountTransferCount(acc.id);
              return (
                <div key={acc.id} style={{ borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", transition: "all 200ms ease", background: "var(--bg)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer", transition: "all 200ms ease" }}
                    onClick={function () { setExpandedAccount(isExpanded ? null : acc.id); }}
                    onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
                    onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, " + g[0] + ", " + g[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{getAccountIcon(acc.type)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.name}</p>
                        <span style={{ fontSize: 9, fontWeight: 700, color: acc.color, background: acc.color + "18", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", flexShrink: 0 }}>{acc.type}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{txCount} tx</span>
                        {trCount > 0 && <span style={{ fontSize: 11, color: "var(--muted)" }}>{trCount} transfers</span>}
                        {acc.details.bankName && <span style={{ fontSize: 11, color: "var(--muted)" }}>{acc.details.bankName}</span>}
                        {acc.details.upiId && <span style={{ fontSize: 11, color: "var(--muted)" }}>{acc.details.upiId}</span>}
                        {acc.details.accountNumber && <span style={{ fontSize: 11, color: "var(--muted)" }}>{"\u2022\u2022\u2022" + acc.details.accountNumber.slice(-4)}</span>}
                      </div>
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: acc.balance >= 0 ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{formatCurrency(acc.balance)}</p>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 200ms ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: "0 16px 14px", animation: "fadeIn 200ms ease" }}>
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginBottom: 10 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          {Object.entries(acc.details).map(function (entry) {
                            return (
                              <div key={entry[0]} style={{ padding: "6px 10px", borderRadius: 6, background: "var(--surface)" }}>
                                <span style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.04 }}>{entry[0].replace(/([A-Z])/g, " $1").trim()}</span>
                                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry[1]}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {accTx.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px 0" }}>Recent</p>
                          {accTx.map(function (t) {
                            var cat = getCategoryIcon(t.category);
                            return (
                              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                                <span style={{ width: 18, height: 14, borderRadius: 3, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6, fontWeight: 800, color: cat.color }}>{cat.letters}</span>
                                <span style={{ flex: 1, fontSize: 12, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.merchant}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: t.type === "income" ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>{t.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(t.amount))}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={function (e) { e.stopPropagation(); openAddMoneyFor(acc.id); }} style={{ flex: 1, height: 32, borderRadius: 8, background: "var(--green-dim)", border: "1px solid var(--green-border)", color: "var(--green)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
                          onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green-dim)"; e.currentTarget.style.color = "var(--green)"; }}>Add Money</button>
                        <button onClick={function (e) { e.stopPropagation(); removeAccount(acc.id); }} style={{ height: 32, padding: "0 12px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
                          onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--red-border)"; e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.background = "var(--red-dim)"; }}
                          onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Chart */}
      <div style={{ background: "var(--surface)", borderRadius: 14, padding: "20px 22px 16px", border: "1px solid var(--border)", marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 16px 0" }}>Last 6 months</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
          {monthlyData.map(function (m) {
            var expH = maxMonth > 0 ? (m.expense / maxMonth) * 100 : 0;
            var incH = maxMonth > 0 ? (m.income / maxMonth) * 100 : 0;
            return (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 80 }}>
                  <div style={{ flex: 1, height: Math.max(expH, 4) + "%", background: "var(--red)", borderRadius: 3, transition: "height 400ms cubic-bezier(0.16,1,0.3,1)", opacity: 0.8 }} />
                  <div style={{ flex: 1, height: Math.max(incH, 4) + "%", background: "var(--green)", borderRadius: 3, transition: "height 400ms cubic-bezier(0.16,1,0.3,1)", opacity: 0.8 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)" }}>{m.month}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--muted)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--red)" }} />Expense</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--muted)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--green)" }} />Income</span>
        </div>
      </div>

      {/* Statement Parser */}
      <div style={{ background: "var(--surface)", borderRadius: 14, padding: 22, border: "1px solid var(--border)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>Statement Parser</p>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px 0" }}>Paste bank/card statement. Amounts, merchants & categories auto-detected.</p>
        <textarea value={statementText} onChange={function (e) { setStatementText(e.target.value); setParsedEntries([]); }} placeholder={"15/01/2025 SWIGGY 250.00\n16/01/2025 NETFLIX 15.99\n17/01/2025 SALARY 50000.00 CR\n18/01/2025 AMAZON 1,499.00"}
          style={{ width: "100%", height: 100, borderRadius: 10, padding: "12px", fontSize: 12, fontFamily: "monospace", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.6, marginBottom: 12, transition: "all 200ms ease" }}
          onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
          onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
        <button onClick={handleParse} disabled={!statementText.trim()} style={{ height: 36, padding: "0 18px", borderRadius: 8, background: statementText.trim() ? "var(--green)" : "var(--card)", border: "none", color: statementText.trim() ? "#fff" : "var(--faint)", fontSize: 12, fontWeight: 600, cursor: statementText.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 200ms ease" }}>Parse Statement</button>
        {parsedEntries.length > 0 && (
          <div style={{ marginTop: 16, animation: "fadeIn 200ms ease" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", margin: "0 0 10px 0" }}>Detected {parsedEntries.length} transactions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {parsedEntries.map(function (entry, idx) {
                var cat = getCategoryIcon(entry.category);
                return (
                  <div key={idx} onClick={function () { toggleEntry(idx); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: entry.selected ? "var(--green-dim)" : "var(--bg)", border: "1px solid " + (entry.selected ? "var(--green-border)" : "var(--border)"), cursor: "pointer", transition: "all 150ms ease", opacity: entry.selected ? 1 : 0.5 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: entry.selected ? "none" : "2px solid var(--border)", background: entry.selected ? "var(--green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {entry.selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <span style={{ width: 22, height: 16, borderRadius: 3, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6, fontWeight: 800, color: cat.color, flexShrink: 0 }}>{cat.letters}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.merchant}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: entry.isIncome ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{entry.isIncome ? "+" : "-"}{formatCurrency(entry.amount)}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>{entry.date}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={addParsedToTransactions} style={{ height: 36, padding: "0 18px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease" }}>Add {parsedEntries.filter(function (e) { return e.selected; }).length} to Transactions</button>
          </div>
        )}
      </div>

      {/* Profile */}
      <div style={{ background: "var(--surface)", borderRadius: 14, padding: 20, border: "1px solid var(--border)", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          {editingName ? (
            <input ref={nameRef} value={nameInput} onChange={function (e) { setNameInput(e.target.value); }} onBlur={saveName} onKeyDown={function (e) { if (e.key === "Enter") saveName(); }}
              style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", background: "transparent", border: "none", borderBottom: "2px solid var(--green)", outline: "none", fontFamily: "inherit", width: "100%", padding: "0 0 2px 0", marginBottom: 2 }} />
          ) : (
            <p onClick={function () { setNameInput(profile.name); setEditingName(true); }} style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 2px 0", cursor: "pointer" }}
              onMouseEnter={function (e) { e.currentTarget.style.color = "var(--green)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.color = "var(--text)"; }}>{profile.name} <span style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)" }}>edit</span></p>
          )}
          {editingEmail ? (
            <input ref={emailRef} value={emailInput} onChange={function (e) { setEmailInput(e.target.value); }} onBlur={saveEmail} onKeyDown={function (e) { if (e.key === "Enter") saveEmail(); }}
              style={{ fontSize: 12, color: "var(--muted)", background: "transparent", border: "none", borderBottom: "2px solid var(--green)", outline: "none", fontFamily: "inherit", width: "100%", padding: "0 0 2px 0" }} />
          ) : (
            <p onClick={function () { setEmailInput(profile.email); setEditingEmail(true); }} style={{ fontSize: 12, color: "var(--muted)", margin: 0, cursor: "pointer" }}
              onMouseEnter={function (e) { e.currentTarget.style.color = "var(--green)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>{profile.email}</p>
          )}
        </div>
      </div>

      {/* Settings */}
      <div style={{ background: "var(--surface)", borderRadius: 14, padding: 22, border: "1px solid var(--border)", marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 14px 0" }}>Settings</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Export Data</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>Download all data as JSON</p>
            </div>
            <button onClick={exportData} style={{ height: 34, padding: "0 16px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}>Export</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Clear All Data</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>Remove everything</p>
            </div>
            {showClearConfirm ? (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={function () { setShowClearConfirm(false); }} style={{ height: 34, padding: "0 12px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={clearAll} style={{ height: 34, padding: "0 12px", borderRadius: 8, background: "var(--red)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            ) : (
              <button onClick={function () { setShowClearConfirm(true); }} style={{ height: 34, padding: "0 16px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--red)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--red-border)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* ADD ACCOUNT MODAL */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowAdd(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 420, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 14px 0" }}>Add Account</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 14 }}>
              {ACCOUNT_PRESETS.map(function (p) {
                var isActive = selectedType === p.type;
                return (
                  <button key={p.type} onClick={function () { setSelectedType(p.type); setFormFields({}); }} style={{ padding: "10px 0", borderRadius: 8, border: "1px solid " + (isActive ? p.color + "40" : "var(--border)"), background: isActive ? p.color + "12" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, background: isActive ? p.color + "20" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: p.color }}>{p.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? p.color : "var(--muted)" }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
            {placeholderKeys.map(function (key) {
              var ph = currentPlaceholders[key];
              return (
                <input key={key} type="text" placeholder={ph} value={formFields[key] || ""} onChange={function (e) { setFormFields(function (f) { var n = { ...f }; n[key] = key === "cardNumber" ? formatCardInput(e.target.value) : key === "expiry" ? formatExpiry(e.target.value) : e.target.value; return n; }); }}
                  style={{ width: "100%", height: 40, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 8, transition: "all 200ms ease", fontVariantNumeric: key === "cardNumber" || key === "accountNumber" ? "tabular-nums" : "normal" }}
                  onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
                  onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
              );
            })}
            <input type="text" inputMode="decimal" placeholder="Initial balance (0.00)" value={initialBalance} onChange={function (e) { setInitialBalance(e.target.value.replace(/[^0-9.]/g, "")); }}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 14, fontVariantNumeric: "tabular-nums", transition: "all 200ms ease" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
            {formFields.cardNumber && formFields.cardNumber.replace(/\D/g, "").length >= 4 && (
              <div style={{ marginBottom: 10, padding: "6px 10px", borderRadius: 6, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", gap: 6, animation: "fadeIn 150ms ease" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--green)" }}>{detectCardType(formFields.cardNumber)}</span>
                <span style={{ fontSize: 10, color: "var(--green)" }}>detected</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowAdd(false); }} style={{ flex: 1, height: 42, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={addAccount} style={{ flex: 1, height: 42, borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(26,143,78,0.2)", transition: "all 200ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>Add Account</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MONEY MODAL */}
      {showAddMoney && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowAddMoney(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 14px 0" }}>Add Money</h2>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px 0" }}>Account</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {accounts.map(function (acc) {
                  var isSel = addMoneyAccountId === acc.id;
                  return (
                    <button key={acc.id} onClick={function () { setAddMoneyAccountId(acc.id); }} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + (isSel ? acc.color + "40" : "var(--border)"), background: isSel ? acc.color + "12" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 8, fontWeight: 800, color: acc.color }}>{getAccountIcon(acc.type)}</span>
                      <span style={{ fontSize: 11, fontWeight: isSel ? 700 : 500, color: isSel ? acc.color : "var(--muted)" }}>{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <input type="text" inputMode="decimal" placeholder="0.00" value={addMoneyAmount} onChange={function (e) { setAddMoneyAmount(e.target.value.replace(/[^0-9.]/g, "")); }}
              style={{ width: "100%", height: 48, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 22, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 14, fontVariantNumeric: "tabular-nums", transition: "all 200ms ease" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowAddMoney(false); }} style={{ flex: 1, height: 42, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={doAddMoney} disabled={!addMoneyAmount || !addMoneyAccountId} style={{ flex: 1, height: 42, borderRadius: 10, background: addMoneyAmount && addMoneyAccountId ? "var(--green)" : "var(--card)", border: "none", color: addMoneyAmount && addMoneyAccountId ? "#fff" : "var(--faint)", fontSize: 13, fontWeight: 600, cursor: addMoneyAmount && addMoneyAccountId ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 200ms ease" }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransfer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowTransfer(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 14px 0" }}>Transfer</h2>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px 0" }}>From</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {accounts.map(function (acc) {
                  var isSel = transferFrom === acc.id;
                  return (
                    <button key={acc.id} onClick={function () { setTransferFrom(acc.id); }} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + (isSel ? acc.color + "40" : "var(--border)"), background: isSel ? acc.color + "12" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 8, fontWeight: 800, color: acc.color }}>{getAccountIcon(acc.type)}</span>
                      <span style={{ fontSize: 11, fontWeight: isSel ? 700 : 500, color: isSel ? acc.color : "var(--muted)" }}>{acc.name}</span>
                      <span style={{ fontSize: 9, color: "var(--muted)" }}>{formatCurrency(acc.balance)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ textAlign: "center", margin: "6px 0" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
            </div>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px 0" }}>To</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {accounts.filter(function (a) { return a.id !== transferFrom; }).map(function (acc) {
                  var isSel = transferTo === acc.id;
                  return (
                    <button key={acc.id} onClick={function () { setTransferTo(acc.id); }} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + (isSel ? acc.color + "40" : "var(--border)"), background: isSel ? acc.color + "12" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 8, fontWeight: 800, color: acc.color }}>{getAccountIcon(acc.type)}</span>
                      <span style={{ fontSize: 11, fontWeight: isSel ? 700 : 500, color: isSel ? acc.color : "var(--muted)" }}>{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <input type="text" inputMode="decimal" placeholder="0.00" value={transferAmount} onChange={function (e) { setTransferAmount(e.target.value.replace(/[^0-9.]/g, "")); }}
              style={{ width: "100%", height: 48, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 22, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 14, fontVariantNumeric: "tabular-nums", transition: "all 200ms ease" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowTransfer(false); }} style={{ flex: 1, height: 42, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={doTransfer} disabled={!transferAmount || !transferFrom || !transferTo || transferFrom === transferTo} style={{ flex: 1, height: 42, borderRadius: 10, background: transferAmount && transferFrom && transferTo && transferFrom !== transferTo ? "var(--green)" : "var(--card)", border: "none", color: transferAmount && transferFrom && transferTo && transferFrom !== transferTo ? "#fff" : "var(--faint)", fontSize: 13, fontWeight: 600, cursor: transferAmount && transferFrom && transferTo && transferFrom !== transferTo ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 200ms ease" }}>Transfer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}