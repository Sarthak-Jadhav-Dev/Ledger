"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all animate-in slide-in-from-top-full fade-in duration-500 ease-out ${
        scrolled
          ? "bg-[#0d0f14]/80 backdrop-blur-xl border-b border-depth/40 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-foreground font-extrabold text-2xl tracking-tighter flex items-center gap-3 group"
        >
          {/* Subtle lock icon suggestion in the logo */}
          <div className="w-9 h-9 rounded-xl bg-surface border border-depth flex items-center justify-center group-hover:border-brass/60 group-hover:shadow-[0_0_15px_rgba(192,160,80,0.15)] transition-all duration-500">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brass group-hover:text-brass-bright group-hover:scale-110 transition-all duration-500"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-foreground">Ledger</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
          <Link
            href="/#how-it-works"
            className="relative text-muted hover:text-foreground transition-colors duration-300 group/link"
          >
            How it works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brass transition-all duration-300 group-hover/link:w-full"></span>
          </Link>
          <Link
            href="/#features"
            className="relative text-muted hover:text-foreground transition-colors duration-300 group/link"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brass transition-all duration-300 group-hover/link:w-full"></span>
          </Link>
          <Link
            href="/#architecture"
            className="relative text-muted hover:text-foreground transition-colors duration-300 group/link"
          >
            Architecture
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brass transition-all duration-300 group-hover/link:w-full"></span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-muted hover:text-foreground hover:scale-110 transition-all duration-300"
            aria-label="GitHub"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </Link>
          <Link
            href="/signup"
            className="relative overflow-hidden h-10 px-6 inline-flex items-center justify-center rounded-lg text-sm font-bold text-ground transition-all duration-300 hover:brightness-110 active:scale-[0.98] hover:shadow-[0_0_15px_rgba(212,180,100,0.3)] group/btn"
            style={{
              background:
                "linear-gradient(180deg, #d4b464 0%, #c0a050 50%, #8a7038 100%)",
            }}
          >
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative z-10">Get Started</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
