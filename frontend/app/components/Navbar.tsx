"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/AuthContext";
import axios from "axios";
import { Button, linkButtonVariants } from "@/app/components/ui/button";
import { BACKEND_URL } from "@/lib/config";

export default function Navbar() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/auth/logout`, {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("token");
    setUser(null);
    setMenuOpen(false);
    router.push("/login");
  };

  const displayName = user?.username || user?.email?.split("@")[0] || "User";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-parchment/95 backdrop-blur-md border-b border-stone-dark shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-sm bg-ink flex items-center justify-center group-hover:bg-ink/80 transition-colors duration-200">
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="text-parchment"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className="font-display text-xl font-bold text-ink italic tracking-tight">
            Ledger
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/#how-it-works" className="text-ink-muted hover:text-ink transition-colors duration-200 relative group/link">
            How it works
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-ink transition-all duration-200 group-hover/link:w-full" />
          </Link>
          <Link href="/#features" className="text-ink-muted hover:text-ink transition-colors duration-200 relative group/link">
            Features
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-ink transition-all duration-200 group-hover/link:w-full" />
          </Link>
          <Link href="/#architecture" className="text-ink-muted hover:text-ink transition-colors duration-200 relative group/link">
            Architecture
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-ink transition-all duration-200 group-hover/link:w-full" />
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* GitHub */}
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-ink-muted hover:text-ink transition-colors duration-200"
            aria-label="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </Link>

          {/* Auth area */}
          {!loading && (
            user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 h-9 pl-2.5 pr-3.5 rounded-sm border border-stone-dark bg-parchment hover:bg-stone hover:border-ink/30 transition-all duration-200"
                >
                  <div className="w-5 h-5 rounded-sm bg-ink text-parchment text-[10px] font-bold uppercase flex items-center justify-center">
                    {displayName[0]}
                  </div>
                  <span className="text-sm font-semibold text-ink">{displayName}</span>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    className={`text-ink-muted transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] w-48 bg-parchment border border-stone-dark rounded-sm shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-stone-dark">
                      <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-semibold text-ink truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-1 flex flex-col gap-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium text-ink hover:bg-stone transition-colors duration-150"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium text-ink-muted hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signup" className={linkButtonVariants()}>Get Started</Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
