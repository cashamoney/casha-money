"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push("/dashboard/overview");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#FAFAFA" }}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl p-8"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #22C55E, #3B82F6)" }}
          >
            C
          </div>
          <span className="text-xl font-bold text-[#0C0D10]">
            Casha<span className="text-[#3B82F6]">.money</span>
          </span>
        </div>

        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: "#0C0D10" }}
        >
          Welcome back
        </h1>
        <p
          className="text-center text-sm mb-8"
          style={{ color: "#6B7280" }}
        >
          Sign in to your financial dashboard
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm"
            style={{
              background: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#374151" }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all"
              style={{
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                color: "#0C0D10",
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#374151" }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all"
              style={{
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                color: "#0C0D10",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: "#0C0D10", color: "#FFFFFF" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "#6B7280" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold"
            style={{ color: "#3B82F6" }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}