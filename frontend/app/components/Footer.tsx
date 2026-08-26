import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-depth/40 bg-surface/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link
            href="/"
            className="text-foreground font-bold text-xl tracking-tight flex items-center gap-2 mb-4"
          >
            <div className="w-6 h-6 rounded bg-surface border border-depth flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brass"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            Ledger
          </Link>
          <p className="text-muted text-sm max-w-sm leading-relaxed">
            Move clipboard content, links, and files between any devices instantly. 
            No accounts required. End-to-end encrypted by design.
          </p>
        </div>

        {/* Links: Product */}
        <div>
          <h4 className="text-foreground font-semibold mb-4 text-sm">Product</h4>
          <ul className="space-y-3 text-sm text-muted">
            <li>
              <Link href="#how-it-works" className="hover:text-brass transition-colors">
                How it works
              </Link>
            </li>
            <li>
              <Link href="#features" className="hover:text-brass transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link href="#architecture" className="hover:text-brass transition-colors">
                Security Architecture
              </Link>
            </li>
          </ul>
        </div>

        {/* Links: Project */}
        <div>
          <h4 className="text-foreground font-semibold mb-4 text-sm">Project</h4>
          <ul className="space-y-3 text-sm text-muted">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brass transition-colors flex items-center gap-2"
              >
                GitHub Repository
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </li>
            <li>
              <Link href="#" className="hover:text-brass transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-brass transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 border-t border-depth/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <span>
          © {new Date().getFullYear()} Ledger. Open source and independent.
        </span>
        <div className="flex items-center gap-2">
          <span>Engineered with precision.</span>
        </div>
      </div>
    </footer>
  );
}
