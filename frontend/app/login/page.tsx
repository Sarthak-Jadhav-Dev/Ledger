"use client"
import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useAuth } from "../AuthContext";
import { Button, linkButtonVariants } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { BACKEND_URL } from "@/lib/config";

export default function LoginPage() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
        email,
        password,
      }, { withCredentials: true })

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
        setLoading(false)
        router.push("/dashboard")
      } else {
        throw new Error("Invalid Credentials")
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navbar />

      {/* Grid paper background */}
      <div className="absolute inset-0 grid-paper opacity-40 pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center items-center px-6 pt-20 pb-16 relative z-10">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <Link
              href="/"
              className="w-12 h-12 rounded-sm bg-ink flex items-center justify-center mb-7 hover:bg-ink/80 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-parchment">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </Link>
            <h1 className="font-display text-4xl font-bold italic text-ink mb-2">
              Welcome back.
            </h1>
            <p className="text-ink-muted text-sm leading-relaxed max-w-xs">
              Sign in to manage your encrypted sessions.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-sm border border-red-300 bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-bold text-ink-muted uppercase tracking-[0.18em]">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] font-bold text-ink-muted uppercase tracking-[0.18em]">
                  Password
                </label>
                <Link href="#" className="text-[11px] text-ink-muted hover:text-ink underline-offset-2 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-stone-dark" />
            <span className="text-[11px] text-ink-faint uppercase tracking-widest font-medium">or</span>
            <div className="h-px flex-1 bg-stone-dark" />
          </div>

          <p className="text-center text-sm text-ink-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-ink font-semibold hover:underline underline-offset-2 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
