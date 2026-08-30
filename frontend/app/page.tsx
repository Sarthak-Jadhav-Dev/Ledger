"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { linkButtonVariants } from "./components/ui/button";

/* ═══════════════════════════════════════════════════════════════════
   HERO SVG — Data Beam Mechanism (adapted for parchment theme)
   ═══════════════════════════════════════════════════════════════════ */

const SESSION_CODE = "A3F8B2C1";

function DataBeamMechanism() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setAnimated(true); }, []);

  const generateWave = (startX: number, endX: number, amplitude: number) => {
    const steps = (endX - startX) / 20;
    return (
      `M ${startX} 0 ` +
      Array.from({ length: steps }).map((_, i) =>
        i === 0
          ? `Q ${startX + 10} ${amplitude} ${startX + 20} 0`
          : `T ${startX + (i + 1) * 20} 0`
      ).join(" ")
    );
  };

  return (
    <svg
      viewBox="0 0 800 400"
      className="w-full max-w-4xl h-auto overflow-visible"
      aria-label="Animated data flow mechanism showing device pairing"
      role="img"
    >
      <defs>
        <filter id="glow-ink" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="beam-fade-ink" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1a1410" stopOpacity="0" />
          <stop offset="25%"  stopColor="#1a1410" stopOpacity="0.18" />
          <stop offset="75%"  stopColor="#1a1410" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1a1410" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Secondary beam */}
      <g transform="translate(400, 200) rotate(20) scale(1, 1.4)" opacity="0.12">
        <rect x="-350" y="-12" width="700" height="24" fill="url(#beam-fade-ink)" />
        <rect x="-350" y="-1" width="700" height="2" fill="#1a1410" opacity="0.4" />
        <path d={generateWave(-350, 350, -15)} fill="none" stroke="#1a1410" strokeWidth="1" opacity="0.3" />
        <path d={generateWave(-350, 350, 15)}  fill="none" stroke="#1a1410" strokeWidth="1" opacity="0.3" />
      </g>

      {/* Main data beam */}
      <g transform="translate(400, 200) rotate(-15) scale(1, 1.4)">
        <rect x="-270" y="-16" width="540" height="32" fill="url(#beam-fade-ink)" />
        <rect x="-270" y="-2" width="540" height="4" fill="#1a1410" opacity="0.5" filter="url(#glow-ink)" />
        <path d={generateWave(-270, 270, -20)} fill="none" stroke="#1a1410" strokeWidth="1.5" opacity="0.2" />
        <path d={generateWave(-270, 270, 20)}  fill="none" stroke="#1a1410" strokeWidth="1.5" opacity="0.2" />

        {/* Data packets Phone → Relay */}
        {animated && [0, 1, 2].map((i) => (
          <g key={`p1-${i}`}>
            <rect x="-260" y="-6" width="12" height="12" rx="2" fill="#1a1410" filter="url(#glow-ink)">
              <animate attributeName="x" values="-260; -60" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.2; 0.8; 1" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}

        {/* Data packets Relay → Desktop */}
        {animated && [0, 1, 2].map((i) => (
          <g key={`p2-${i}`}>
            <rect x="60" y="-6" width="12" height="12" rx="2" fill="#1a1410" filter="url(#glow-ink)">
              <animate attributeName="x" values="60; 260" dur="1.5s" begin={`${i * 0.5 + 0.25}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.2; 0.8; 1" dur="1.5s" begin={`${i * 0.5 + 0.25}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}
      </g>

      {/* Relay node */}
      <g transform="translate(400, 200) scale(1.4)">
        <rect x="-60" y="-20" width="120" height="40" rx="4" fill="#e6dfd2" stroke="#c4bbb0" strokeWidth="1.5" />
        <text x="0" y="6" textAnchor="middle" fill="#1a1410" fontFamily="var(--font-geist-mono), monospace" fontSize="16" fontWeight="bold">
          {SESSION_CODE}
        </text>
        <rect x="-28" y="28" width="56" height="18" rx="3" fill="#f0ebe0" stroke="#c4bbb0" strokeWidth="1" />
        <text x="0" y="41" textAnchor="middle" fill="#6b6257" fontSize="10" fontWeight="500">Relay</text>
      </g>

      {/* Phone node (bottom left) */}
      <g transform="translate(130, 272) scale(1.4)">
        {animated && (
          <>
            <circle cx="0" cy="0" r="40" fill="none" stroke="#1a1410" strokeWidth="1.5" opacity="0.3">
              <animate attributeName="r" from="20" to="80" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="40" fill="none" stroke="#1a1410" strokeWidth="1.5" opacity="0.3">
              <animate attributeName="r" from="20" to="80" dur="2s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="2s" begin="1s" repeatCount="indefinite" />
            </circle>
          </>
        )}
        <rect x="-24" y="-48" width="48" height="96" rx="8" fill="#e6dfd2" stroke="#c4bbb0" strokeWidth="2" />
        <rect x="-18" y="-40" width="36" height="80" rx="4" fill="#f0ebe0" />
        <circle cx="0" cy="0" r="8" fill="#1a1410" filter="url(#glow-ink)" />
        <rect x="-34" y="56" width="68" height="22" rx="3" fill="#f0ebe0" stroke="#c4bbb0" strokeWidth="1" />
        <text x="0" y="71" textAnchor="middle" fill="#6b6257" fontSize="11" fontWeight="500">Phone</text>
      </g>

      {/* Desktop node (top right) */}
      <g transform="translate(670, 128) scale(1.4)">
        {animated && (
          <>
            <circle cx="0" cy="0" r="50" fill="none" stroke="#1a1410" strokeWidth="1.5" opacity="0.3">
              <animate attributeName="r" from="30" to="100" dur="2s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="50" fill="none" stroke="#1a1410" strokeWidth="1.5" opacity="0.3">
              <animate attributeName="r" from="30" to="100" dur="2s" begin="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="2s" begin="1.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}
        <rect x="-44" y="-34" width="88" height="56" rx="4" fill="#e6dfd2" stroke="#c4bbb0" strokeWidth="2" />
        <rect x="-38" y="-28" width="76" height="44" rx="2" fill="#f0ebe0" />
        <path d="M-12,22 L12,22 L16,34 L-16,34 Z" fill="#c4bbb0" />
        <circle cx="0" cy="0" r="8" fill="#1a1410" filter="url(#glow-ink)" />
        <rect x="-50" y="44" width="100" height="22" rx="3" fill="#f0ebe0" stroke="#c4bbb0" strokeWidth="1" />
        <text x="0" y="59" textAnchor="middle" fill="#6b6257" fontSize="11" fontWeight="500">Desktop</text>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ARCHITECTURE DIAGRAM — parchment theme
   ═══════════════════════════════════════════════════════════════════ */
function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 700 200"
      className="w-full max-w-2xl h-auto"
      aria-label="Architecture diagram showing encrypted data flowing through a zero-knowledge relay server"
      role="img"
    >
      {/* Phone */}
      <g>
        <rect x="20" y="50" width="50" height="80" rx="8" fill="#e6dfd2" stroke="#c4bbb0" strokeWidth="1.5" />
        <text x="45" y="145" textAnchor="middle" fill="#6b6257" fontSize="11" fontFamily="var(--font-inter), sans-serif">Your Phone</text>
        <rect x="35" y="78" width="20" height="16" rx="2" fill="none" stroke="#1a1410" strokeWidth="1.2" />
        <path d="M39 78V74a6 6 0 0 1 12 0v4" fill="none" stroke="#1a1410" strokeWidth="1.2" />
      </g>

      {/* Encrypted flow → */}
      <g>
        <line x1="80" y1="90" x2="260" y2="90" stroke="#1a1410" strokeWidth="1" strokeDasharray="8 4" opacity="0.4" />
        <text x="170" y="80" textAnchor="middle" fill="#1a1410" fontSize="10" fontFamily="var(--font-geist-mono), monospace" opacity="0.6">ENCRYPTED</text>
      </g>

      {/* Relay server */}
      <g>
        <rect x="270" y="40" width="160" height="100" rx="6" fill="#e6dfd2" stroke="#c4bbb0" strokeWidth="1.5" />
        <text x="350" y="68" textAnchor="middle" fill="#1a1410" fontSize="13" fontFamily="var(--font-inter), sans-serif" fontWeight="600">Relay Server</text>
        <text x="350" y="87" textAnchor="middle" fill="#7a6f62" fontSize="10" fontFamily="var(--font-geist-mono), monospace">✕ Cannot read data</text>
        <text x="350" y="103" textAnchor="middle" fill="#7a6f62" fontSize="10" fontFamily="var(--font-geist-mono), monospace">✕ No encryption keys</text>
        <text x="350" y="119" textAnchor="middle" fill="#7a6f62" fontSize="10" fontFamily="var(--font-geist-mono), monospace">✕ No stored content</text>
        <text x="350" y="152" textAnchor="middle" fill="#6b6257" fontSize="11" fontFamily="var(--font-inter), sans-serif">Pure Relay</text>
      </g>

      {/* Encrypted flow → */}
      <g>
        <line x1="440" y1="90" x2="610" y2="90" stroke="#1a1410" strokeWidth="1" strokeDasharray="8 4" opacity="0.4" />
        <text x="525" y="80" textAnchor="middle" fill="#1a1410" fontSize="10" fontFamily="var(--font-geist-mono), monospace" opacity="0.6">ENCRYPTED</text>
      </g>

      {/* Desktop */}
      <g>
        <rect x="620" y="50" width="60" height="44" rx="4" fill="#e6dfd2" stroke="#c4bbb0" strokeWidth="1.5" />
        <line x1="638" y1="94" x2="662" y2="94" stroke="#c4bbb0" strokeWidth="1.5" />
        <line x1="650" y1="94" x2="650" y2="104" stroke="#c4bbb0" strokeWidth="1.5" />
        <line x1="636" y1="104" x2="664" y2="104" stroke="#c4bbb0" strokeWidth="1.5" />
        <text x="650" y="145" textAnchor="middle" fill="#6b6257" fontSize="11" fontFamily="var(--font-inter), sans-serif">Your PC</text>
        <rect x="640" y="66" width="20" height="16" rx="2" fill="none" stroke="#1a1410" strokeWidth="1.2" />
        <path d="M644 66V62a6 6 0 0 1 11.5-1" fill="none" stroke="#1a1410" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-4 px-6">
      <div className="h-px flex-1 max-w-xs bg-stone-dark" />
      <svg width="14" height="14" viewBox="0 0 14 14" className="mx-4 text-stone-dark">
        <rect x="2" y="2" width="10" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(45 7 7)" />
      </svg>
      <div className="h-px flex-1 max-w-xs bg-stone-dark" />
    </div>
  );
}

function Step({ number, statusText, title, description, footerLeft, footerRight }: {
  number: number; statusText: string; title: string;
  description: string; footerLeft: string; footerRight: string;
}) {
  return (
    <div className="reveal flex flex-col justify-between border border-stone-dark bg-parchment p-8 sm:p-10 rounded-sm text-left group hover:border-ink/30 hover:shadow-md transition-all duration-300">
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-stone-dark mb-7">
          <span className="text-ink font-bold text-[10px] tracking-[0.25em] uppercase">STEP / 0{number}</span>
          <span className="flex items-center gap-2 text-ink-muted text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-ink rounded-sm group-hover:bg-ink/60 transition-colors" />
            {statusText}
          </span>
        </div>
        <h3 className="font-display text-3xl sm:text-4xl font-bold italic text-ink mb-3 leading-tight">
          {title}
        </h3>
        <p className="text-ink-muted text-base leading-relaxed mb-10">{description}</p>
      </div>
      <div>
        <div className="relative w-full h-px bg-stone-dark mb-3 overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-ink w-0 group-hover:w-2/3 transition-all duration-700 ease-out" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-faint text-xs">{footerLeft}</span>
          <span className="text-ink text-xs font-bold group-hover:translate-x-1 transition-transform duration-200">{footerRight}</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: {
  title: string; description: string; icon: React.ReactNode;
}) {
  return (
    <div className="reveal relative group p-6 border border-stone-dark bg-parchment hover:border-ink/25 hover:shadow-md transition-all duration-300 rounded-sm">
      {/* Corner accents */}
      <svg className="absolute top-0 left-0 w-3 h-3 text-stone-dark group-hover:text-ink/20 transition-colors" viewBox="0 0 12 12">
        <path d="M0 0 L12 0 L12 1.5 L1.5 1.5 L1.5 12 L0 12 Z" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-3 h-3 text-stone-dark group-hover:text-ink/20 transition-colors rotate-180" viewBox="0 0 12 12">
        <path d="M0 0 L12 0 L12 1.5 L1.5 1.5 L1.5 12 L0 12 Z" fill="currentColor" />
      </svg>

      <div className="text-ink mb-5 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-ink text-lg font-bold mb-2">{title}</h3>
      <p className="text-ink-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════════════════════════════ */
const icons = {
  shield: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 7v5c0 5.25 3.75 10.13 9 11.25C17.25 22.13 21 17.25 21 12V7L12 2z" /><polyline points="9 12 11 14 15 10" /></svg>,
  globe:  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" /><line x1="2" y1="12" x2="22" y2="12" /></svg>,
  devices:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="11" rx="1" /><line x1="5" y1="14" x2="12" y2="14" /><line x1="8.5" y1="14" x2="8.5" y2="17" /><line x1="5" y1="17" x2="12" y2="17" /><rect x="17" y="6" width="6" height="12" rx="1" /><line x1="19" y1="15" x2="21" y2="15" /></svg>,
  clock:  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  code:   <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="14" y1="4" x2="10" y2="20" /></svg>,
  github: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>,
};

/* ═══════════════════════════════════════════════════════════════════
   SCROLL REVEAL HOOK
   ═══════════════════════════════════════════════════════════════════ */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (CSS.supports("animation-timeline", "view()")) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    const elements = ref.current?.querySelectorAll(".reveal");
    elements?.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(24px)";
      (el as HTMLElement).style.transition = "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)";
      observer.observe(el);
    });
    const style = document.createElement("style");
    style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);
    return () => { observer.disconnect(); style.remove(); };
  }, []);
  return ref;
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const scrollRef = useScrollReveal();

  return (
    <div ref={scrollRef} className="flex flex-col bg-parchment">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section id="hero" className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Grid paper texture */}
        <div className="absolute inset-0 grid-paper opacity-40 pointer-events-none" />

        {/* Left content + Right SVG two-column layout (editorial) */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto w-full px-6 pt-32 pb-20">

          {/* ─ Left: Text column ─ */}
          <div className="flex-1 flex flex-col gap-8 max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-sm bg-ink flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-parchment">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink-muted">Ledger · Open Source</span>
            </div>

            {/* Headline — editorial, serif */}
            <div>
              <h1 className="font-display text-6xl sm:text-7xl md:text-[5.5rem] font-bold text-ink leading-[0.92] tracking-tight">
                Encrypted
                <br />
                <em className="italic">device transfer.</em>
              </h1>
            </div>

            {/* Body copy */}
            <p className="text-ink-muted text-lg leading-relaxed max-w-md">
              Move clipboard content, links, and files between your phone and PC in seconds.
              End-to-end encrypted. No install required. Open source.
            </p>

            {/* Spec table (Fig Mint editorial style) */}
            <div className="grid grid-cols-2 gap-0 border border-stone-dark divide-x divide-y divide-stone-dark">
              {[
                { label: "ENCRYPTION",  value: "256-bit AES" },
                { label: "STORED DATA", value: "0 bytes" },
                { label: "INSTALL",     value: "None required" },
                { label: "SOURCE",      value: "100% Open" },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-3 bg-parchment">
                  <p className="text-[9px] font-bold text-ink-faint uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-ink font-mono">{value}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link href="/signup" id="cta-hero-get-started" className={linkButtonVariants('default', 'xl')}>Get Started</Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" id="cta-hero-github" className={linkButtonVariants('outline', 'xl') + ' gap-2'}>
                {icons.github} View on GitHub
              </a>
            </div>
          </div>

          {/* ─ Right: SVG animation ─ */}
          <div className="flex-1 flex items-center justify-center w-full animate-in fade-in zoom-in-95 duration-1000 ease-out">
            <DataBeamMechanism />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-ink-faint pb-10">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <svg width="14" height="22" viewBox="0 0 14 22" className="animate-bounce">
            <path d="M7 3 L7 17 M2 13 L7 18 L12 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 bg-parchment-dark border-t border-stone-dark">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-bold text-ink-faint uppercase tracking-[0.25em] mb-3">How it works</p>
            <h2 className="reveal font-display text-4xl sm:text-5xl font-bold italic text-ink mb-4 leading-tight">
              Three steps.<br />Five seconds.
            </h2>
            <p className="reveal text-ink-muted text-lg max-w-xl leading-relaxed">
              No accounts on the sending device. No apps to install. Just a browser and a session code.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Step number={1} statusText="Device 1" title="Cut a new key." description="Open Ledger on your PC. A unique session code is generated — your one-time encryption key, valid for minutes." footerLeft="256-bit AES generation" footerRight="Initialize →" />
            <Step number={2} statusText="Device 2" title="Insert the key." description="On your phone, open Ledger in any browser. Enter the session code. Devices pair instantly over an encrypted channel." footerLeft="Direct P2P channel established" footerRight="Connect →" />
            <Step number={3} statusText="Ready" title="Turn the lock." description="Transfer clipboard text, links, or files. Everything flows encrypted in real time. The server never sees your data." footerLeft="Zero-knowledge transfer" footerRight="Transfer →" />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-bold text-ink-faint uppercase tracking-[0.25em] mb-3">Features</p>
            <h2 className="reveal font-display text-4xl sm:text-5xl font-bold italic text-ink mb-4 leading-tight">
              Engineered for privacy.
            </h2>
            <p className="reveal text-ink-muted text-lg max-w-xl leading-relaxed">
              Every design decision puts your data under your control. No compromises.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard title="End-to-end encrypted" description="256-bit AES keys generated per session. The relay server forwards sealed payloads it structurally cannot open." icon={icons.shield} />
            <FeatureCard title="No install required" description="Works in any modern browser on any device. Open the URL, enter a code, start transferring. Nothing to download." icon={icons.globe} />
            <FeatureCard title="Cross-platform" description="Phone to PC, PC to phone, any OS. If it runs a browser, it runs Ledger. No platform lock-in." icon={icons.devices} />
            <FeatureCard title="Ephemeral sessions" description="Sessions auto-expire. Nothing persists on the server. When the session ends, the data path ceases to exist." icon={icons.clock} />
            <FeatureCard title="Open source" description="Every line of code is public. Don't trust our claims — read the implementation, audit it yourself." icon={icons.code} />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── ARCHITECTURE ─────────────────────────────────────── */}
      <section id="architecture" className="py-28 px-6 bg-parchment-dark border-t border-stone-dark">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-bold text-ink-faint uppercase tracking-[0.25em] mb-3">Architecture</p>
            <h2 className="reveal font-display text-4xl sm:text-5xl font-bold italic text-ink mb-4 leading-tight">
              Zero-knowledge by design.
            </h2>
            <p className="reveal text-ink-muted text-lg max-w-xl leading-relaxed">
              The server never holds encryption keys — it relays sealed payloads between paired devices, structurally unable to read what passes through.
            </p>
          </div>

          <div className="reveal flex justify-center mb-12 overflow-x-auto pb-4">
            <div className="min-w-[560px] flex justify-center w-full">
              <ArchitectureDiagram />
            </div>
          </div>

          <div className="reveal grid grid-cols-1 sm:grid-cols-3 gap-0 border border-stone-dark divide-x divide-y divide-stone-dark">
            {[
              { value: "256-bit", label: "AES encryption per session" },
              { value: "0 bytes", label: "Stored on server after session" },
              { value: "100%",    label: "Open-source codebase" },
            ].map(({ value, label }) => (
              <div key={label} className="p-6 text-center bg-parchment">
                <div className="font-mono text-2xl font-bold text-ink mb-1.5">{value}</div>
                <div className="text-ink-muted text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section id="final-cta" className="py-36 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="reveal border border-stone-dark bg-parchment-dark p-12 sm:p-20 text-center">
            <p className="text-[10px] font-bold text-ink-faint uppercase tracking-[0.25em] mb-6">Start now</p>
            <h2 className="font-display text-5xl sm:text-6xl font-bold italic text-ink mb-5 leading-tight">
              Your data.
              <br />Your devices.
            </h2>
            <p className="text-ink-muted text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Start transferring files and clipboard content between your devices in seconds. Free, encrypted, open source.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" id="cta-final-get-started" className={linkButtonVariants('default', 'xl')}>Get Started — It&apos;s Free</Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" id="cta-final-github" className={linkButtonVariants('outline', 'xl') + ' gap-2'}>
                {icons.github} View Source
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
