"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "How can I save more money this month?",
  "Analyze my spending patterns",
  "Create a debt payoff plan for me",
  "What tax deductions am I missing?",
  "Can I afford a ₹50,000 purchase?",
  "How much should my emergency fund be?",
  "Review my financial health",
  "Suggest investments for beginners",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadUserData = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    setUser(authData.user);

    const uid = authData.user.id;
    const [txnRes, debtRes, goalRes] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", uid).order("transaction_date", { ascending: false }).limit(50),
      supabase.from("debts").select("*").eq("user_id", uid).eq("status", "active"),
      supabase.from("goals").select("*").eq("user_id", uid).eq("status", "active"),
    ]);

    setTransactions(txnRes.data || []);
    setDebts(debtRes.data || []);
    setGoals(goalRes.data || []);
  };

  const buildContext = () => {
    const totalIncome = transactions
      .filter((t) => t.transaction_type === "income")
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const totalExpense = transactions
      .filter((t) => t.transaction_type === "expense")
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const totalDebt = debts.reduce((s, d) => s + Number(d.current_balance), 0);
    const totalGoalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
    const totalGoalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);

    const categories: Record<string, number> = {};
    transactions
      .filter((t) => t.transaction_type === "expense")
      .forEach((t) => {
        const cat = t.category || "Other";
        categories[cat] = (categories[cat] || 0) + Math.abs(Number(t.amount));
      });

    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => `${name}: ₹${amount.toLocaleString("en-IN")}`)
      .join(", ");

    return `You are CASHA AI — a world-class financial advisor powered by AI.
You have access to the user's REAL financial data:

USER: ${user?.user_metadata?.full_name || "User"}
COUNTRY: India (default, adapt if user mentions another)
CURRENCY: INR (₹)

FINANCIAL DATA:
- Total Income (recent): ₹${totalIncome.toLocaleString("en-IN")}
- Total Expenses (recent): ₹${totalExpense.toLocaleString("en-IN")}
- Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(0) : 0}%
- Active Debts: ${debts.length} totaling ₹${totalDebt.toLocaleString("en-IN")}
- Active Goals: ${goals.length} (₹${totalGoalSaved.toLocaleString("en-IN")} saved of ₹${totalGoalTarget.toLocaleString("en-IN")} target)
- Top Spending: ${topCategories || "No data yet"}
- Transaction Count: ${transactions.length}

DEBT DETAILS:
${debts.map((d) => `- ${d.name}: ₹${Number(d.current_balance).toLocaleString("en-IN")} at ${d.interest_rate}% (${d.debt_type})`).join("\n") || "No debts"}

GOAL DETAILS:
${goals.map((g) => `- ${g.emoji} ${g.name}: ₹${Number(g.current_amount).toLocaleString("en-IN")} / ₹${Number(g.target_amount).toLocaleString("en-IN")}`).join("\n") || "No goals set"}

RULES:
1. Use the user's REAL data above to give personalized advice
2. Always use ₹ (INR) unless user specifies another currency
3. Be specific with numbers — not vague
4. Give actionable steps, not generic tips
5. For India: mention Section 80C, 80D, HRA, NPS, PPF, ELSS when relevant
6. For tax: compare Old vs New regime when applicable
7. Be encouraging but honest
8. If user has no data yet, help them get started
9. Keep responses concise but comprehensive
10. End with a specific next step or question`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: buildContext() },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "I couldn't process that. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      if (user) {
        await supabase.from("chat_messages").insert([
          { user_id: user.id, conversation_id: getConvoId(), role: "user", content: text, model_used: "llama-3.3-70b" },
          { user_id: user.id, conversation_id: getConvoId(), role: "assistant", content: reply, model_used: "llama-3.3-70b", tokens_used: data.usage?.total_tokens || 0 },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    }

    setLoading(false);
  };

  const getConvoId = () => {
    const today = new Date().toISOString().split("T")[0];
    return `${user?.id}-${today}`;
  };

  return (
    <div className="max-w-[800px] mx-auto flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0C0D10" }}>🧠 AI Financial Advisor</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Ask anything about your money — powered by your real data
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#F0FDF4", color: "#166534" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          Online
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl p-4 mb-4 space-y-4" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: "#F3F4F6" }}>
              🧠
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: "#0C0D10" }}>
              Hi! I'm your AI financial advisor
            </h2>
            <p className="text-sm text-center mb-6" style={{ color: "#6B7280", maxWidth: 400 }}>
              I can see your transactions, debts, and goals. Ask me anything about your finances — I'll give advice based on YOUR real data.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs px-4 py-3 rounded-xl transition-all hover:shadow-sm"
                  style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#374151" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: "#0C0D10", color: "#FFFFFF", borderBottomRightRadius: 4 }
                      : { background: "#F3F4F6", color: "#0C0D10", borderBottomLeftRadius: 4 }
                  }
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Ask about your finances..."
          disabled={loading}
          className="flex-1 h-12 rounded-xl px-4 text-sm outline-none transition-all disabled:opacity-50"
          style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", color: "#0C0D10" }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="h-12 px-6 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: "#0C0D10", color: "#FFFFFF" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}