import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-stone-dark bg-parchment-dark">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">

        {/* Brand */}
        <div className="md:col-span-2">
          <Link
            href="/"
            className="font-display text-ink font-bold text-xl italic tracking-tight flex items-center gap-2 mb-4"
          >
            <div className="w-6 h-6 rounded-sm bg-ink flex items-center justify-center">
              <svg
                width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="text-parchment"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            Ledger
          </Link>
          <p className="text-ink-muted text-sm max-w-sm leading-relaxed">
            Move clipboard content, links, and files between any devices instantly.
            End-to-end encrypted by design. Open source.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-ink font-semibold mb-4 text-sm uppercase tracking-widest text-[11px]">Product</h4>
          <ul className="space-y-3 text-sm text-ink-muted">
            <li><Link href="/#how-it-works" className="hover:text-ink transition-colors duration-150">How it works</Link></li>
            <li><Link href="/#features" className="hover:text-ink transition-colors duration-150">Features</Link></li>
            <li><Link href="/#architecture" className="hover:text-ink transition-colors duration-150">Security Architecture</Link></li>
          </ul>
        </div>

        {/* Project */}
        <div>
          <h4 className="text-ink font-semibold mb-4 text-sm uppercase tracking-widest text-[11px]">Project</h4>
          <ul className="space-y-3 text-sm text-ink-muted">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors duration-150 flex items-center gap-1.5"
              >
                GitHub Repository
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </li>
            <li><Link href="#" className="hover:text-ink transition-colors duration-150">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-ink transition-colors duration-150">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 border-t border-stone-dark flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-faint">
        <span>© {new Date().getFullYear()} Ledger. Open source and independent.</span>
        <div className="flex items-center gap-2">
          <span>Engineered with precision.</span>
        </div>
      </div>
    </footer>
  );
}
