import Link from "next/link";
import React from "react";
import Navbar from "../components/Navbar";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden px-6">
      <Navbar />
      {/* Background textures */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, #c0a050 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, #94a3b8 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, #c0a050 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md my-12">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <Link
            href="/"
            className="w-14 h-14 rounded-2xl bg-[#141820]/80 backdrop-blur-md border border-depth flex items-center justify-center group hover:border-brass/60 hover:shadow-[0_0_20px_rgba(192,160,80,0.15)] transition-all animate-in fade-in zoom-in-90 duration-500 ease-out fill-mode-backwards mb-8"
            style={{ animationDelay: "100ms" }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brass group-hover:text-brass-bright group-hover:scale-110 transition-all duration-500"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </Link>
          <h1 
            className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-foreground to-steel leading-tight mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-backwards"
            style={{ animationDelay: "200ms" }}
          >
            Initialize Access
          </h1>
          <p 
            className="text-muted text-base font-medium max-w-xs leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-backwards"
            style={{ animationDelay: "300ms" }}
          >
            Create an account to manage your encrypted sessions.
          </p>
        </div>

        {/* Form Card */}
        <div 
          className="relative group animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-backwards"
          style={{ animationDelay: "450ms" }}
        >
          {/* Subtle glowing border effect */}
          <div className="absolute -inset-px bg-linear-to-b from-depth via-transparent to-transparent rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-[#12151b]/95 backdrop-blur-xl border border-depth/50 rounded-2xl p-8 shadow-2xl">
            <form className="flex flex-col gap-6" action="#" method="POST">
              <div className="flex flex-col gap-2.5">
                <label
                  htmlFor="email"
                  className="text-[11px] font-bold text-steel uppercase tracking-[0.2em]"
                >
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within/input:text-brass transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                      <path d="M2 4l10 8 10-8"></path>
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="operator@ledger.local"
                    className="w-full bg-ground/50 border border-depth/80 rounded-lg pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-brass/60 focus:ring-1 focus:ring-brass/60 focus:bg-ground transition-all font-mono text-sm shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label
                  htmlFor="password"
                  className="text-[11px] font-bold text-steel uppercase tracking-[0.2em]"
                >
                  Master Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within/input:text-brass transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full bg-ground/50 border border-depth/80 rounded-lg pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-brass/60 focus:ring-1 focus:ring-brass/60 focus:bg-ground transition-all font-mono text-sm tracking-widest shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label
                  htmlFor="confirm-password"
                  className="text-[11px] font-bold text-steel uppercase tracking-[0.2em]"
                >
                  Confirm Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within/input:text-brass transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full bg-ground/50 border border-depth/80 rounded-lg pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-brass/60 focus:ring-1 focus:ring-brass/60 focus:bg-ground transition-all font-mono text-sm tracking-widest shadow-inner"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full h-14 flex items-center justify-center rounded-lg font-bold text-ground text-base transition-all duration-300 hover:brightness-110 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(212,180,100,0.3)] relative overflow-hidden group/btn"
                style={{
                  background:
                    "linear-gradient(180deg, #d4b464 0%, #c0a050 50%, #8a7038 100%)",
                }}
              >
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/20 to-transparent" />
                Generate Keys
              </button>
              
              <p className="text-[11px] text-muted text-center mt-2 font-medium">
                By initializing, you agree to our{" "}
                <Link href="#" className="text-brass hover:text-brass-bright transition-colors hover:underline">
                  Terms of Service
                </Link>
                .
              </p>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p 
          className="text-center text-muted text-sm font-medium mt-10 animate-in fade-in duration-1000 ease-out fill-mode-backwards"
          style={{ animationDelay: "700ms" }}
        >
          Already authorized?{" "}
          <Link
            href="/login"
            className="text-foreground hover:text-brass-bright transition-colors font-semibold"
          >
            Authenticate
          </Link>
        </p>
      </div>
    </div>
  );
}
