"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const KNOWN_SUBSCRIPTIONS = [
  { name: "Netflix", category: "Streaming", emoji: "🎬", color: "#E50914" },
  { name: "Hotstar", category: "Streaming", emoji: "🎬", color: "#1F80E0" },
  { name: "Amazon Prime", category: "Streaming", emoji: "📦", color: "#FF9900" },
  { name: "Spotify", category: "Music", emoji: "🎵", color: "#1DB954" },
  { name: "Apple Music", category: "Music", emoji: "🎵", color: "#FC3C44" },
  { name: "YouTube Premium", category: "Streaming", emoji: "▶️", color: "#FF0000" },
  { name: "Zee5", category: "Streaming", emoji: "🎬", color: "#8B5CF6" },
  { name: "SonyLiv", category: "Streaming", emoji: "🎬", color: "#0057FF" },
  { name: "JioCinema", category: "Streaming", emoji: "🎬", color: "#0066FF" },
  { name: "Gym", category: "Fitness", emoji: "🏋️", color: "#F59E0B" },
  { name: "Cult.fit", category: "Fitness", emoji: "🏋️", color: "#FF6B35" },
  { name: "GPT", category: "AI Tools", emoji: "🤖", color: "#10A37F" },
  { name: "ChatGPT", category: "AI Tools", emoji: "🤖", color: "#10A37F" },
  { name: "Duolingo", category: "Education", emoji: "📚", color: "#58CC02" },
  { name: "Coursera", category: "Education", emoji: "📚", color: "#0056D2" },
  { name: "LinkedIn", category: "Professional", emoji: "💼", color: "#0A66C2" },
  { name: "Adobe", category: "Software", emoji: "💻", color: "#FF0000" },
  { name: "Microsoft", category: "Software", emoji: "💻", color: "#00A4EF" },
  { name: "Google", category: "Software", emoji: "💻", color: "#4285F4" },
  { name: "iCloud", category: "Storage", emoji: "☁️", color: "#3B82F6" },
  { name: "Dropbox", category: "Storage", emoji: "☁️", color: "#0061FF" },
  { name: "Swiggy One", category: "Food", emoji: "🍔", color: "#FC8019" },
  { name: "Zomato Pro", category: "Food", emoji: "🍔", color: "#E23744" },
  { name: "Insurance", category: "Insurance", emoji: "🛡️", color: "#6366F1" },
  { name: "Times Prime", category: "Entertainment", emoji: "🎭", color: "#E53E3E" },
];

const getSubscriptionInfo = (merchantName: string) => {
  const name = merchantName?.toLowerCase() || "";
  return KNOWN_SUBSCRIPTIONS.find(s =>
    name.includes(s.name.toLowerCase())
  ) || { name: merchantName, category: "Other", emoji: "🔄", color: "#6B7280" };
};

const RECOMMENDATIONS: Record<string, string> = {
  "Streaming": "Consider sharing a family plan to cut cost by 50%",
  "Music": "Most streaming services include music — check if you need both",
  "Fitness": "Track your visits — less than 8/month? Cancel and try free YouTube workouts",
  "AI Tools": "Check if your employer provides access for free",
  "Education": "Many libraries provide free access to learning platforms",
  "Software": "Check if annual plan saves 20-30% vs monthly",
  "Storage": "Clean up files first — you may not need the upgrade",
  "Food": "Calculate if you actually save more than the membership cost",
  "Other": "Review if you actively use this service every month",
};

export default function SubscriptionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [manualForm, setManualForm] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", frequency: "monthly" });
  const [manualSubs, setManualSubs] = useState<any[]>([]);

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", authData.user.id)
      .eq("transaction_type", "expense")
      .order("transaction_date", { ascending: false });

    setTransactions(data || []);
    detectSubscriptions(data || []);
    setLoading(false);
  };

  const detectSubscriptions = (txns: any[]) => {
    // Group by merchant name
    const merchantMap: Record<string, any[]> = {};

    txns.forEach(t => {
      const key = t.merchant_name?.toLowerCase().trim() || "unknown";
      if (!merchantMap[key]) merchantMap[key] = [];
      merchantMap[key].push(t);
    });

    const detected: any[] = [];

    Object.entries(merchantMap).forEach(([merchant, txnList]) => {
      if (merchant === "unknown" || !merchant) return;

      // Sort by date
      const sorted = txnList.sort((a, b) =>
        new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
      );

      // Check for recurring pattern (2+ transactions same merchant)
      if (sorted.length >= 1) {
        const amounts = sorted.map(t => Math.abs(Number(t.amount)));
        const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const isConsistent = amounts.every(a => Math.abs(a - avgAmount) < avgAmount * 0.1);

        // Known subscription OR recurring payment
        const info = getSubscriptionInfo(merchant);
        const isKnown = KNOWN_SUBSCRIPTIONS.some(s =>
          merchant.toLowerCase().includes(s.name.toLowerCase())
        );

        if (isKnown || (sorted.length >= 2 && isConsistent)) {
          detected.push({
            id: merchant,
            name: sorted[sorted.length - 1]?.merchant_name || merchant,
            amount: avgAmount,
            frequency: "monthly",
            annualCost: avgAmount * 12,
            lastCharged: sorted[sorted.length - 1]?.transaction_date,
            timesCharged: sorted.length,
            info,
            category: info.category,
            recommendation: RECOMMENDATIONS[info.category] || RECOMMENDATIONS["Other"],
            status: "active",
          });
        }
      }
    });

    setSubscriptions(detected);
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(n);

  const allSubs = [...subscriptions, ...manualSubs].filter(s => !dismissed.includes(s.id));
  const totalMonthly = allSubs.reduce((s, sub) => s + sub.amount, 0);
  const totalAnnual = totalMonthly * 12;

  const addManual = () => {
    if (!form.name || !form.amount) return;
    const info = getSubscriptionInfo(form.name);
    setManualSubs(prev => [...prev, {
      id: `manual-${Date.now()}`,
      name: form.name,
      amount: parseFloat(form.amount),
      frequency: form.frequency,
      annualCost: form.frequency === "monthly"
        ? parseFloat(form.amount) * 12
        : form.frequency === "quarterly"
          ? parseFloat(form.amount) * 4
          : parseFloat(form.amount),
      lastCharged: new Date().toISOString(),
      timesCharged: 1,
      info,
      category: info.category,
      recommendation: RECOMMENDATIONS[info.category] || RECOMMENDATIONS["Other"],
      status: "active",
    }]);
    setForm({ name: "", amount: "", frequency: "monthly" });
    setManualForm(false);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Scanning your transactions...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>
            🔄 Subscription Tracker
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            Auto-detected from your transactions · Find and cancel what you don't use
          </p>
        </div>
        <button
          onClick={() => setManualForm(!manualForm)}
          style={{
            padding: "10px 20px", borderRadius: "12px", border: "none",
            background: "#0C0D10", color: "#fff", fontSize: "13px",
            fontWeight: "600", cursor: "pointer"
          }}
        >
          + Add Manual
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#0C0D10", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", margin: "0 0 8px 0", textTransform: "uppercase" }}>
            Monthly Cost
          </p>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: "0 0 4px 0" }}>
            {fmt(totalMonthly)}
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            {allSubs.length} active subscriptions
          </p>
        </div>
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#991B1B", margin: "0 0 8px 0", textTransform: "uppercase" }}>
            Annual Cost
          </p>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#DC2626", margin: "0 0 4px 0" }}>
            {fmt(totalAnnual)}
          </p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
            You pay this every year
          </p>
        </div>
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#166534", margin: "0 0 8px 0", textTransform: "uppercase" }}>
            Potential Savings
          </p>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#16A34A", margin: "0 0 4px 0" }}>
            {fmt(totalAnnual * 0.3)}
          </p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
            If you cancel unused ones
          </p>
        </div>
      </div>

      {/* Manual Add Form */}
      {manualForm && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: "0 0 16px 0" }}>
            Add Subscription Manually
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Service Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Netflix, Gym..."
                style={{
                  width: "100%", height: "42px", borderRadius: "10px",
                  padding: "0 12px", fontSize: "13px", border: "1px solid #E5E7EB",
                  background: "#F9FAFB", color: "#0C0D10", outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Amount (₹)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="499"
                style={{
                  width: "100%", height: "42px", borderRadius: "10px",
                  padding: "0 12px", fontSize: "13px", border: "1px solid #E5E7EB",
                  background: "#F9FAFB", color: "#0C0D10", outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Frequency
              </label>
              <select
                value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value })}
                style={{
                  width: "100%", height: "42px", borderRadius: "10px",
                  padding: "0 12px", fontSize: "13px", border: "1px solid #E5E7EB",
                  background: "#F9FAFB", color: "#0C0D10", outline: "none",
                  boxSizing: "border-box"
                }}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>
          <button
            onClick={addManual}
            style={{
              padding: "10px 24px", borderRadius: "10px", border: "none",
              background: "#0C0D10", color: "#fff", fontSize: "13px",
              fontWeight: "600", cursor: "pointer"
            }}
          >
            Add Subscription
          </button>
        </div>
      )}

      {/* Subscriptions List */}
      {allSubs.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "48px", textAlign: "center" }}>
          <p style={{ fontSize: "40px", margin: "0 0 12px 0" }}>🔄</p>
          <p style={{ fontSize: "16px", fontWeight: "700", color: "#0C0D10", margin: "0 0 8px 0" }}>
            No subscriptions detected yet
          </p>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px 0" }}>
            Add transactions like Netflix, Spotify, Gym to auto-detect subscriptions
          </p>
          <button
            onClick={() => setManualForm(true)}
            style={{
              padding: "10px 24px", borderRadius: "10px", border: "none",
              background: "#0C0D10", color: "#fff", fontSize: "13px",
              fontWeight: "600", cursor: "pointer"
            }}
          >
            Add Manually
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {allSubs.map((sub) => (
            <div
              key={sub.id}
              style={{
                background: "#fff", border: "1px solid #E5E7EB",
                borderRadius: "16px", padding: "20px",
                borderLeft: `4px solid ${sub.info.color}`
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>

                {/* Left: Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    background: `${sub.info.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px", flexShrink: 0
                  }}>
                    {sub.info.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0C0D10", margin: 0 }}>
                        {sub.name}
                      </p>
                      <span style={{
                        fontSize: "10px", fontWeight: "600", padding: "2px 8px",
                        borderRadius: "999px", background: "#F3F4F6", color: "#6B7280"
                      }}>
                        {sub.category}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 8px 0" }}>
                      {sub.timesCharged}x charged · Last: {sub.lastCharged
                        ? new Date(sub.lastCharged).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "Unknown"
                      } · {sub.frequency}
                    </p>
                    {/* Recommendation */}
                    <div style={{
                      background: "#FFFBEB", border: "1px solid #FDE68A",
                      borderRadius: "8px", padding: "8px 12px"
                    }}>
                      <p style={{ fontSize: "11px", color: "#92400E", margin: 0 }}>
                        💡 {sub.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Amount */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: "#0C0D10", margin: "0 0 2px 0" }}>
                    {fmt(sub.amount)}
                    <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "400" }}>/mo</span>
                  </p>
                  <p style={{ fontSize: "12px", color: "#DC2626", fontWeight: "600", margin: "0 0 12px 0" }}>
                    {fmt(sub.annualCost)}/year
                  </p>
                  <button
                    onClick={() => setDismissed(prev => [...prev, sub.id])}
                    style={{
                      padding: "6px 14px", borderRadius: "8px",
                      border: "1px solid #FECACA", background: "#FEF2F2",
                      color: "#DC2626", fontSize: "11px", fontWeight: "600",
                      cursor: "pointer", display: "block", width: "100%"
                    }}
                  >
                    Mark Cancelled
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dismissed */}
      {dismissed.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#9CA3AF", margin: "0 0 12px 0" }}>
            ✅ Cancelled ({dismissed.length})
          </p>
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontSize: "13px", color: "#166534", fontWeight: "600", margin: 0 }}>
              🎉 You cancelled {dismissed.length} subscription{dismissed.length > 1 ? "s" : ""}!
              Saving approximately {fmt(dismissed.length * 500 * 12)}/year
            </p>
          </div>
        </div>
      )}
    </div>
  );
}