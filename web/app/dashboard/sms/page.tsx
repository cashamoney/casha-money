"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";

const SMS_PATTERNS = [
  {
    bank: "HDFC Bank",
    pattern: /(?:Rs\.?|INR\.?|₹)\s*([\d,]+\.?\d*)\s+(?:debited|credited)\s+(?:from|to)\s+(?:A\/c|Acct|account)\s*(?:XX|x{2})?(\d+)/i,
    amountGroup: 1,
    type: (sms: string) => sms.toLowerCase().includes("debited") ? "expense" : "income",
  },
  {
    bank: "SBI",
    pattern: /(?:Rs\.?|INR\.?|₹)\s*([\d,]+\.?\d*)\s+(?:debited|credited)/i,
    amountGroup: 1,
    type: (sms: string) => sms.toLowerCase().includes("debited") ? "expense" : "income",
  },
  {
    bank: "ICICI Bank",
    pattern: /(?:INR|Rs\.?|₹)\s*([\d,]+\.?\d*)\s+(?:debited|credited|spent|received)/i,
    amountGroup: 1,
    type: (sms: string) => {
      const lower = sms.toLowerCase();
      return (lower.includes("debited") || lower.includes("spent")) ? "expense" : "income";
    },
  },
  {
    bank: "Axis Bank",
    pattern: /(?:INR|Rs\.?|₹)\s*([\d,]+\.?\d*)\s+(?:debited|credited|transferred)/i,
    amountGroup: 1,
    type: (sms: string) => sms.toLowerCase().includes("debited") ? "expense" : "income",
  },
  {
    bank: "Kotak",
    pattern: /(?:INR|Rs\.?|₹)\s*([\d,]+\.?\d*)\s+(?:debited|credited|paid|received)/i,
    amountGroup: 1,
    type: (sms: string) => {
      const lower = sms.toLowerCase();
      return (lower.includes("debited") || lower.includes("paid")) ? "expense" : "income";
    },
  },
  {
    bank: "UPI",
    pattern: /(?:INR|Rs\.?|₹)\s*([\d,]+\.?\d*)\s+(?:debited|credited|paid|received|sent)/i,
    amountGroup: 1,
    type: (sms: string) => {
      const lower = sms.toLowerCase();
      return (lower.includes("debited") || lower.includes("paid") || lower.includes("sent")) ? "expense" : "income";
    },
  },
  {
    bank: "Credit Card",
    pattern: /(?:INR|Rs\.?|₹)\s*([\d,]+\.?\d*)\s+(?:spent|used|charged|debited)/i,
    amountGroup: 1,
    type: () => "expense",
  },
  {
    bank: "Bank",
    pattern: /([\d,]+\.?\d*)\s+(?:debited|credited|paid|received|sent|transferred)/i,
    amountGroup: 1,
    type: (sms: string) => {
      const lower = sms.toLowerCase();
      return (lower.includes("debited") || lower.includes("paid") || lower.includes("sent")) ? "expense" : "income";
    },
  },
];

const extractMerchant = (sms: string): string => {
  const patterns = [
    /(?:at|to|from|@)\s+([A-Za-z0-9\s]+?)(?:\s+on|\s+via|\s+Ref|\s+UPI|\.|,|$)/i,
    /(?:Info:|Info -|trf to|transfer to)\s*([A-Za-z0-9\s]+?)(?:\s+on|\s+Ref|\.|,|$)/i,
    /(?:paid to|sent to|transferred to)\s+([A-Za-z0-9\s]+?)(?:\s+on|\s+Ref|\.|,|$)/i,
    /VPA\s+([A-Za-z0-9@.]+)/i,
  ];
  for (const pattern of patterns) {
    const match = sms.match(pattern);
    if (match && match[1]?.trim().length > 2) {
      return match[1].trim().substring(0, 50);
    }
  }
  return "Bank Transaction";
};

const autoCategory = (sms: string, merchant: string, type: string): string => {
  if (type === "income") return "Salary";
  const text = (sms + " " + merchant).toLowerCase();
  if (text.match(/swiggy|zomato|uber eat|food|restaurant|pizza|burger|cafe/)) return "Food Delivery";
  if (text.match(/grocery|bigbasket|grofer|blinkit|jiomart|supermarket/)) return "Groceries";
  if (text.match(/uber|ola|rapido|metro|bus|train|cab|taxi|petrol|fuel/)) return "Transportation";
  if (text.match(/netflix|hotstar|prime|spotify|zee5|sonyliv|youtube/)) return "Streaming/OTT";
  if (text.match(/amazon|flipkart|myntra|ajio|meesho|nykaa/)) return "Shopping";
  if (text.match(/hospital|clinic|pharmacy|medicine|apollo|medplus/)) return "Healthcare";
  if (text.match(/electricity|water|gas|bill|bsnl|airtel|jio|vodafone/)) return "Electricity";
  if (text.match(/emi|loan|hdfc|icici|sbi|bank|bajaj|finance/)) return "EMI Payment";
  if (text.match(/school|college|university|coaching|course|education/)) return "Education";
  if (text.match(/gym|fitness|cult|yoga/)) return "Healthcare";
  if (text.match(/insurance|lic|policy/)) return "Insurance";
  if (text.match(/rent|landlord|housing/)) return "Housing/Rent";
  return "Other Expense";
};

const parseSMS = (sms: string) => {
  const trimmed = sms.trim();
  if (!trimmed) return null;
  for (const pattern of SMS_PATTERNS) {
    const match = trimmed.match(pattern.pattern);
    if (match) {
      const amountStr = match[pattern.amountGroup]?.replace(/,/g, "") || "0";
      const amount = parseFloat(amountStr);
      if (amount <= 0 || amount > 10000000) continue;
      const type = pattern.type(trimmed);
      const merchant = extractMerchant(trimmed);
      const category = autoCategory(trimmed, merchant, type);
      const dateMatch = trimmed.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);
      let date = new Date().toISOString().split("T")[0];
      if (dateMatch) {
        try {
          const parsed = new Date(dateMatch[1]);
          if (!isNaN(parsed.getTime())) {
            date = parsed.toISOString().split("T")[0];
          }
        } catch { }
      }
      return { amount, type, merchant, category, date, bank: pattern.bank, raw: trimmed };
    }
  }
  return null;
};

const EXAMPLE_SMS = [
  "Rs.2500.00 debited from A/c XX1234 on 19-04-26. Info: Swiggy. Avl Bal:Rs.47500.00 -HDFC Bank",
  "INR 15000.00 debited from your HDFC Bank A/c XX5678 towards EMI. Ref No 123456789",
  "Your A/c XX1234 is credited with INR 75000.00 on 19-Apr-26 by NEFT. Avl Bal: INR 1,25,000",
  "Rs 499.00 spent on HDFC Bank Credit Card XX9012 at Netflix on 2026-04-19.",
  "UPI: Rs.1200.00 debited from A/c XX3456 to Amazon@upi on 19/04/2026.",
];

const ALL_CATEGORIES = [
  "Salary", "Food Delivery", "Groceries", "Transportation", "EMI Payment",
  "Entertainment", "Shopping", "Healthcare", "Education", "Subscription",
  "Streaming/OTT", "Insurance", "Housing/Rent", "Electricity",
  "Other Expense", "Other Income",
];

export default function SMSParserPage() {
  const [smsText, setSmsText] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const [parseError, setParseError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [bulkSMS, setBulkSMS] = useState("");
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSavedCount, setBulkSavedCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  const handleParse = () => {
    setParseError("");
    setParsed(null);
    setSaveStatus("idle");

    if (!smsText.trim()) {
      setParseError("Please paste an SMS message first.");
      return;
    }

    const result = parseSMS(smsText);
    if (result) {
      setParsed(result);
    } else {
      setParseError("Could not parse this SMS. Please try a different SMS or add the transaction manually.");
    }
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaveStatus("saving");

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setSaveStatus("error");
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      user_id: authData.user.id,
      transaction_date: parsed.date,
      amount: parsed.amount,
      transaction_type: parsed.type,
      merchant_name: parsed.merchant,
      category: parsed.category,
      description: `Parsed from SMS · ${parsed.bank}`,
      source: "sms",
      currency: "INR",
    });

    if (!error) {
      setSaveStatus("success");
      // Reset after 3 seconds
      setTimeout(() => {
        setSmsText("");
        setParsed(null);
        setSaveStatus("idle");
      }, 3000);
    } else {
      console.error("Save error:", error);
      setSaveStatus("error");
    }
  };

  const handleBulkParse = () => {
    const lines = bulkSMS.split("\n").filter(l => l.trim().length > 10);
    const results = lines
      .map(line => ({ raw: line, parsed: parseSMS(line) }))
      .filter(r => r.parsed !== null);
    setBulkResults(results);
    setBulkSavedCount(0);
  };

  const handleBulkSave = async () => {
    setBulkSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) { setBulkSaving(false); return; }

    let count = 0;
    for (const result of bulkResults) {
      if (!result.parsed) continue;
      const { error } = await supabase.from("transactions").insert({
        user_id: authData.user.id,
        transaction_date: result.parsed.date,
        amount: result.parsed.amount,
        transaction_type: result.parsed.type,
        merchant_name: result.parsed.merchant,
        category: result.parsed.category,
        description: `Parsed from SMS · ${result.parsed.bank}`,
        source: "sms",
        currency: "INR",
      });
      if (!error) count++;
    }

    setBulkSavedCount(count);
    setBulkSaving(false);
    setBulkResults([]);
    setBulkSMS("");
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(n);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>
          📱 SMS Parser — India
        </h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          Paste any bank SMS → auto-creates transaction · Works for all Indian banks
        </p>
      </div>

      {/* Supported Banks */}
      <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px" }}>
        <p style={{ fontSize: "12px", fontWeight: "600", color: "#166534", margin: "0 0 8px 0" }}>
          ✅ Works with all Indian banks and payment apps
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "BOB", "Canara", "IndusInd", "Yes Bank", "UPI", "GPay", "PhonePe", "Paytm", "Credit Cards"].map(bank => (
            <span key={bank} style={{
              fontSize: "11px", fontWeight: "500", padding: "3px 10px",
              borderRadius: "999px", background: "#DCFCE7", color: "#166534"
            }}>
              {bank}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[
          { key: "single", label: "📱 Single SMS" },
          { key: "bulk", label: "📋 Bulk Import" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "8px 20px", borderRadius: "10px", border: "none",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
              background: activeTab === tab.key ? "#0C0D10" : "#F3F4F6",
              color: activeTab === tab.key ? "#fff" : "#6B7280",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SINGLE SMS TAB ── */}
      {activeTab === "single" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Input Box */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
              Paste your bank SMS here
            </label>
            <textarea
              value={smsText}
              onChange={e => {
                setSmsText(e.target.value);
                setParsed(null);
                setParseError("");
                setSaveStatus("idle");
              }}
              placeholder="Example: Rs.2500.00 debited from A/c XX1234 on 19-04-26. Info: Swiggy. Avl Bal:Rs.47500.00 -HDFC Bank"
              rows={4}
              style={{
                width: "100%", borderRadius: "12px", padding: "14px",
                fontSize: "13px", border: "1px solid #E5E7EB",
                background: "#F9FAFB", color: "#0C0D10", outline: "none",
                resize: "vertical", fontFamily: "system-ui, sans-serif",
                boxSizing: "border-box", lineHeight: "1.5"
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                onClick={handleParse}
                style={{
                  padding: "10px 24px", borderRadius: "10px", border: "none",
                  background: "#0C0D10", color: "#fff", fontSize: "13px",
                  fontWeight: "600", cursor: "pointer"
                }}
              >
                🔍 Parse SMS
              </button>
              <button
                onClick={() => { setSmsText(""); setParsed(null); setParseError(""); setSaveStatus("idle"); }}
                style={{
                  padding: "10px 16px", borderRadius: "10px",
                  border: "1px solid #E5E7EB", background: "#fff",
                  color: "#6B7280", fontSize: "13px", fontWeight: "600", cursor: "pointer"
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Error Message */}
          {parseError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626", margin: 0 }}>
                ❌ {parseError}
              </p>
            </div>
          )}

          {/* ── SUCCESS: Saved ── */}
          {saveStatus === "success" && (
            <div style={{
              background: "#F0FDF4", border: "2px solid #22C55E",
              borderRadius: "16px", padding: "28px", textAlign: "center"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
              <p style={{ fontSize: "20px", fontWeight: "700", color: "#166534", margin: "0 0 8px 0" }}>
                Transaction Saved Successfully!
              </p>
              <p style={{ fontSize: "13px", color: "#16A34A", margin: "0 0 16px 0" }}>
                Your transaction has been added. Paste another SMS to continue.
              </p>
              <div style={{ background: "#DCFCE7", borderRadius: "10px", padding: "12px", display: "inline-block" }}>
                <p style={{ fontSize: "13px", color: "#166534", margin: 0, fontWeight: "500" }}>
                  ✅ Check your Transactions page to see it
                </p>
              </div>
            </div>
          )}

          {/* ── ERROR: Save failed ── */}
          {saveStatus === "error" && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626", margin: 0 }}>
                ❌ Could not save transaction. Please try again or add manually in Transactions.
              </p>
            </div>
          )}

          {/* ── Parsed Result ── */}
          {parsed && saveStatus !== "success" && (
            <div style={{ background: "#fff", border: "2px solid #22C55E", borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <span style={{ fontSize: "20px" }}>✅</span>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#166534", margin: 0 }}>
                  SMS Parsed Successfully! Review and save below.
                </p>
              </div>

              {/* Parsed data cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                <div style={{ background: "#F0FDF4", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 4px 0", fontWeight: "600", textTransform: "uppercase" }}>
                    Amount
                  </p>
                  <p style={{ fontSize: "22px", fontWeight: "700", color: "#16A34A", margin: 0 }}>
                    {fmt(parsed.amount)}
                  </p>
                </div>
                <div style={{ background: parsed.type === "income" ? "#F0FDF4" : "#FEF2F2", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 4px 0", fontWeight: "600", textTransform: "uppercase" }}>
                    Type
                  </p>
                  <p style={{ fontSize: "18px", fontWeight: "700", color: parsed.type === "income" ? "#16A34A" : "#DC2626", margin: 0 }}>
                    {parsed.type === "income" ? "💵 Income" : "💸 Expense"}
                  </p>
                </div>
                <div style={{ background: "#F9FAFB", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 4px 0", fontWeight: "600", textTransform: "uppercase" }}>
                    Date
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#0C0D10", margin: 0 }}>
                    {new Date(parsed.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div style={{ background: "#F9FAFB", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 4px 0", fontWeight: "600", textTransform: "uppercase" }}>
                    Bank
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#0C0D10", margin: 0 }}>
                    {parsed.bank}
                  </p>
                </div>
              </div>

              {/* Edit merchant and category */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Merchant / Payee
                  </label>
                  <input
                    type="text"
                    value={parsed.merchant}
                    onChange={e => setParsed({ ...parsed, merchant: e.target.value })}
                    style={{
                      width: "100%", height: "40px", borderRadius: "10px",
                      padding: "0 12px", fontSize: "13px", border: "1px solid #E5E7EB",
                      background: "#F9FAFB", color: "#0C0D10", outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={parsed.category}
                    onChange={e => setParsed({ ...parsed, category: e.target.value })}
                    style={{
                      width: "100%", height: "40px", borderRadius: "10px",
                      padding: "0 12px", fontSize: "13px", border: "1px solid #E5E7EB",
                      background: "#F9FAFB", color: "#0C0D10", outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    {ALL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                style={{
                  width: "100%", height: "50px", borderRadius: "12px", border: "none",
                  background: saveStatus === "saving" ? "#9CA3AF" : "#22C55E",
                  color: "#fff", fontSize: "15px", fontWeight: "700",
                  cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                {saveStatus === "saving" ? "⏳ Saving transaction..." : "✅ Save Transaction"}
              </button>
            </div>
          )}

          {/* Example SMS */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#0C0D10", margin: "0 0 12px 0" }}>
              💡 Try these example SMS messages (click to fill):
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {EXAMPLE_SMS.map((sms, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSmsText(sms);
                    setParsed(null);
                    setParseError("");
                    setSaveStatus("idle");
                  }}
                  style={{
                    padding: "10px 14px", borderRadius: "10px",
                    border: "1px solid #E5E7EB", background: "#F9FAFB",
                    color: "#374151", fontSize: "11px", cursor: "pointer",
                    textAlign: "left", lineHeight: "1.5", fontFamily: "monospace"
                  }}
                >
                  {sms}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BULK IMPORT TAB ── */}
      {activeTab === "bulk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Paste multiple SMS messages (one per line)
            </label>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 10px 0" }}>
              Copy all your bank SMS messages and paste them here. Each line = one SMS.
            </p>
            <textarea
              value={bulkSMS}
              onChange={e => { setBulkSMS(e.target.value); setBulkResults([]); setBulkSavedCount(0); }}
              placeholder={`Rs.2500.00 debited from A/c XX1234. Info: Swiggy -HDFC Bank\nINR 75000.00 credited to your account by NEFT\nRs 1200.00 spent at Netflix on HDFC Credit Card`}
              rows={8}
              style={{
                width: "100%", borderRadius: "12px", padding: "14px",
                fontSize: "12px", border: "1px solid #E5E7EB",
                background: "#F9FAFB", color: "#0C0D10", outline: "none",
                resize: "vertical", fontFamily: "monospace",
                boxSizing: "border-box", lineHeight: "1.6"
              }}
            />
            <button
              onClick={handleBulkParse}
              disabled={!bulkSMS.trim()}
              style={{
                marginTop: "12px", padding: "10px 24px", borderRadius: "10px", border: "none",
                background: "#0C0D10", color: "#fff", fontSize: "13px",
                fontWeight: "600", cursor: !bulkSMS.trim() ? "not-allowed" : "pointer",
                opacity: !bulkSMS.trim() ? 0.5 : 1
              }}
            >
              🔍 Parse All SMS
            </button>
          </div>

          {/* Bulk Results */}
          {bulkResults.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#0C0D10", margin: "0 0 2px 0" }}>
                    ✅ {bulkResults.length} transactions detected
                  </p>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                    Review below then save all at once
                  </p>
                </div>
                <button
                  onClick={handleBulkSave}
                  disabled={bulkSaving}
                  style={{
                    padding: "10px 20px", borderRadius: "10px", border: "none",
                    background: "#22C55E", color: "#fff", fontSize: "13px",
                    fontWeight: "600", cursor: "pointer", opacity: bulkSaving ? 0.7 : 1
                  }}
                >
                  {bulkSaving ? "Saving..." : `💾 Save All ${bulkResults.length} Transactions`}
                </button>
              </div>

              {bulkSavedCount > 0 && (
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "14px", marginBottom: "16px", textAlign: "center" }}>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#166534", margin: 0 }}>
                    🎉 {bulkSavedCount} transactions saved successfully!
                  </p>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {bulkResults.map((result, i) => (
                  <div key={i} style={{
                    padding: "12px 16px", borderRadius: "10px",
                    border: "1px solid #E5E7EB", background: "#F9FAFB",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px"
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#0C0D10", margin: "0 0 2px 0" }}>
                        {result.parsed.merchant} · {result.parsed.category}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {result.raw.substring(0, 70)}...
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: result.parsed.type === "income" ? "#16A34A" : "#DC2626" }}>
                        {result.parsed.type === "income" ? "+" : "-"}{fmt(result.parsed.amount)}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                        {new Date(result.parsed.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}