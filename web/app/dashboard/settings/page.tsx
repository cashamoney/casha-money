"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const COUNTRIES = [
  { code: "IN", name: "India", currency: "INR", symbol: "₹" },
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "₦" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$" },
  { code: "ID", name: "Indonesia", currency: "IDR", symbol: "Rp" },
  { code: "PH", name: "Philippines", currency: "PHP", symbol: "₱" },
  { code: "KE", name: "Kenya", currency: "KES", symbol: "KSh" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "$" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "€" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R" },
  { code: "AE", name: "UAE", currency: "AED", symbol: "د.إ" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "﷼" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$" },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "es", name: "Español (Spanish)" },
  { code: "pt", name: "Português (Portuguese)" },
  { code: "fr", name: "Français (French)" },
  { code: "ar", name: "العربية (Arabic)" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "de", name: "Deutsch (German)" },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    country: "IN",
    currency: "INR",
    language: "en",
    user_type: "individual",
    employment_type: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (data) {
      setProfile(data);
      setForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        country: data.country || "IN",
        currency: data.currency || "INR",
        language: data.language || "en",
        user_type: data.user_type || "individual",
        employment_type: data.employment_type || "",
      });
    }

    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    await supabase
      .from("user_profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone || null,
        country: form.country,
        currency: form.currency,
        language: form.language,
        user_type: form.user_type,
        employment_type: form.employment_type || null,
      })
      .eq("id", authData.user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (country) {
      setForm({ ...form, country: country.code, currency: country.currency });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: "#9CA3AF" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#0C0D10" }}>⚙️ Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          Manage your profile and preferences
        </p>
      </div>

      {saved && (
        <div className="mb-6 p-3 rounded-xl text-sm font-medium" style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>
          ✅ Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Section */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>👤 Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Full Name</label>
              <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Email</label>
              <input type="email" disabled value={profile?.email || ""} className="w-full h-11 rounded-xl px-4 text-sm" style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", color: "#9CA3AF" }} />
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }} />
            </div>
          </div>
        </div>

        {/* Region Section */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>🌍 Region & Language</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Country</label>
              <select value={form.country} onChange={(e) => handleCountryChange(e.target.value)} className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                This adapts tax rules, currency, and features for your region
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}>
                  {COUNTRIES.map((c) => (
                    <option key={c.currency} value={c.currency}>{c.symbol} {c.currency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Language</label>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* User Type Section */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>💼 Account Type</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#374151" }}>I am a...</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: "individual", label: "Individual", emoji: "👤" },
                  { value: "freelancer", label: "Freelancer", emoji: "💻" },
                  { value: "creator", label: "Creator", emoji: "🎥" },
                  { value: "startup", label: "Startup Founder", emoji: "🚀" },
                  { value: "smb", label: "Business Owner", emoji: "🏢" },
                  { value: "enterprise", label: "Enterprise", emoji: "🏛️" },
                ].map((type) => (
                  <button key={type.value} type="button" onClick={() => setForm({ ...form, user_type: type.value })}
                    className="flex items-center gap-2 p-3 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: form.user_type === type.value ? "#0C0D10" : "#F9FAFB",
                      color: form.user_type === type.value ? "#FFFFFF" : "#6B7280",
                      border: `1px solid ${form.user_type === type.value ? "#0C0D10" : "#E5E7EB"}`,
                    }}>
                    <span>{type.emoji}</span>{type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Employment</label>
              <select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}>
                <option value="">Select...</option>
                <option value="salaried">Salaried Employee</option>
                <option value="self_employed">Self Employed</option>
                <option value="freelancer">Freelancer</option>
                <option value="gig">Gig Worker</option>
                <option value="business_owner">Business Owner</option>
                <option value="student">Student</option>
                <option value="retired">Retired</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>💎 Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "#0C0D10" }}>
                {profile?.subscription_tier === "free" ? "Free Plan" : profile?.subscription_tier}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                Basic features · Upgrade for AI advisor, tax optimizer & more
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#F3F4F6", color: "#6B7280" }}>
              Current Plan
            </span>
          </div>
        </div>

        {/* Save */}
        <button type="submit" disabled={saving} className="w-full h-12 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: "#0C0D10", color: "#FFFFFF" }}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="mt-8 rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #FECACA" }}>
        <h2 className="text-sm font-bold mb-2" style={{ color: "#DC2626" }}>⚠️ Danger Zone</h2>
        <p className="text-xs mb-4" style={{ color: "#6B7280" }}>
          Once you delete your account, all your data will be permanently removed.
        </p>
        <button className="text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
          Delete Account
        </button>
      </div>

      {/* Legal */}
      <div className="mt-6 text-center">
        <p className="text-xs" style={{ color: "#9CA3AF" }}>
          CASHA.MONEY is a financial education platform, not a licensed advisor.
          <br />
          Consult professionals for investment, tax, and legal decisions.
        </p>
      </div>
    </div>
  );
}