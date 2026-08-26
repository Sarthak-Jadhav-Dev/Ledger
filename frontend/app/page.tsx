"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* ═══════════════════════════════════════════════════════════════════
   HERO SVG — Locksmith tumbler mechanism
   Each hex digit of the session code maps to a tumbler pin height.
   The key slides in and pins animate into alignment.
   ═══════════════════════════════════════════════════════════════════ */

const SESSION_CODE = "A3F8B2C1";

function DataBeamMechanism() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  const generateWave = (startX: number, endX: number, amplitude: number) => {
    const steps = (endX - startX) / 20;
    return (
      `M ${startX} 0 ` +
      Array.from({ length: steps })
        .map((_, i) =>
          i === 0
            ? `Q ${startX + 10} ${amplitude} ${startX + 20} 0`
            : `T ${startX + (i + 1) * 20} 0`
        )
        .join(" ")
    );
  };

  return (
    <svg
      viewBox="0 0 800 400"
      className="w-full max-w-5xl h-auto overflow-visible"
      aria-label="Animated data flow mechanism showing device pairing"
      role="img"
    >
      <defs>
        <filter id="glow-brass" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="beam-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c0a050" stopOpacity="0" />
          <stop offset="25%" stopColor="#c0a050" stopOpacity="0.4" />
          <stop offset="75%" stopColor="#c0a050" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c0a050" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Secondary Intersecting Beam (The 'X' shape from the model pick) */}
      <g transform="translate(400, 200) rotate(20) scale(1, 1.4)" opacity="0.25">
        <rect x="-350" y="-12" width="700" height="24" fill="url(#beam-fade)" />
        <rect x="-350" y="-1" width="700" height="2" fill="#c0a050" opacity="0.6" />
        <path d={generateWave(-350, 350, -15)} fill="none" stroke="#c0a050" strokeWidth="1" opacity="0.5" />
        <path d={generateWave(-350, 350, 15)} fill="none" stroke="#c0a050" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Main Data Beam */}
      <g transform="translate(400, 200) rotate(-15) scale(1, 1.4)">
        <rect x="-270" y="-16" width="540" height="32" fill="url(#beam-fade)" />
        <rect x="-270" y="-2" width="540" height="4" fill="#c0a050" opacity="0.8" filter="url(#glow-brass)" />

        <path d={generateWave(-270, 270, -20)} fill="none" stroke="#c0a050" strokeWidth="1.5" opacity="0.4" />
        <path d={generateWave(-270, 270, 20)} fill="none" stroke="#c0a050" strokeWidth="1.5" opacity="0.4" />

        {/* Data packets Phone -> Relay */}
        {animated &&
          [0, 1, 2].map((i) => (
            <g key={`p1-${i}`}>
              <rect x="-260" y="-6" width="12" height="12" rx="2" fill="#d4b464" filter="url(#glow-brass)">
                <animate attributeName="x" values="-260; -60" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.2; 0.8; 1" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
              </rect>
            </g>
          ))}

        {/* Data packets Relay -> Desktop */}
        {animated &&
          [0, 1, 2].map((i) => (
            <g key={`p2-${i}`}>
              <rect x="60" y="-6" width="12" height="12" rx="2" fill="#d4b464" filter="url(#glow-brass)">
                <animate attributeName="x" values="60; 260" dur="1.5s" begin={`${i * 0.5 + 0.25}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.2; 0.8; 1" dur="1.5s" begin={`${i * 0.5 + 0.25}s`} repeatCount="indefinite" />
              </rect>
            </g>
          ))}
      </g>

      {/* Relay Node */}
      <g transform="translate(400, 200) scale(1.4)">
        <rect x="-60" y="-20" width="120" height="40" rx="6" fill="#141820" stroke="#94a3b8" strokeWidth="1.5" />
        <text x="0" y="6" textAnchor="middle" fill="#e2e8f0" fontFamily="var(--font-geist-mono), monospace" fontSize="18" fontWeight="bold">
          {SESSION_CODE}
        </text>
        <rect x="-24" y="28" width="48" height="20" rx="4" fill="#0d0f14" stroke="#2a3444" strokeWidth="1" />
        <text x="0" y="42" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="500">Relay</text>
      </g>

      {/* Phone Node (Bottom Left) */}
      <g transform="translate(130, 272) scale(1.4)">
        {animated && (
          <>
            <circle cx="0" cy="0" r="40" fill="none" stroke="#c0a050" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" from="20" to="80" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="40" fill="none" stroke="#c0a050" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" from="20" to="80" dur="2s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.8" to="0" dur="2s" begin="1s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        <rect x="-24" y="-48" width="48" height="96" rx="8" fill="#141820" stroke="#94a3b8" strokeWidth="2" />
        <rect x="-18" y="-40" width="36" height="80" rx="4" fill="#0d0f14" />
        <circle cx="0" cy="0" r="8" fill="#c0a050" filter="url(#glow-brass)" />

        <rect x="-30" y="56" width="60" height="24" rx="4" fill="#0d0f14" stroke="#2a3444" strokeWidth="1" />
        <text x="0" y="72" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="500">Phone</text>
      </g>

      {/* Desktop Node (Top Right) */}
      <g transform="translate(670, 128) scale(1.4)">
        {animated && (
          <>
            <circle cx="0" cy="0" r="50" fill="none" stroke="#c0a050" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" from="30" to="100" dur="2s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.8" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="50" fill="none" stroke="#c0a050" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" from="30" to="100" dur="2s" begin="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.8" to="0" dur="2s" begin="1.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        <rect x="-44" y="-34" width="88" height="56" rx="4" fill="#141820" stroke="#94a3b8" strokeWidth="2" />
        <rect x="-38" y="-28" width="76" height="44" rx="2" fill="#0d0f14" />
        <path d="M-12,22 L12,22 L16,34 L-16,34 Z" fill="#94a3b8" />
        <circle cx="0" cy="0" r="8" fill="#c0a050" filter="url(#glow-brass)" />

        <rect x="-45" y="44" width="90" height="24" rx="4" fill="#0d0f14" stroke="#2a3444" strokeWidth="1" />
        <text x="0" y="60" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="500">Desktop node</text>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="h-px w-16 bg-brass/20" />
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        className="mx-3 text-brass/30"
      >
        <rect
          x="3"
          y="3"
          width="10"
          height="10"
          rx="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          transform="rotate(45 8 8)"
        />
      </svg>
      <div className="h-px w-16 bg-brass/20" />
    </div>
  );
}

/* ─── How It Works step (Animated Card) ─── */
function Step({
  number,
  statusText,
  title,
  description,
  footerLeft,
  footerRight,
}: {
  number: number;
  statusText: string;
  title: string;
  description: string;
  footerLeft: string;
  footerRight: string;
}) {
  return (
    <div className="reveal flex flex-col justify-between border border-depth/40 bg-[#12151b] p-8 sm:p-10 rounded-xl text-left group hover:border-brass/40 transition-colors duration-500 hover:shadow-2xl hover:shadow-brass/5">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-depth/40 mb-8">
          <span className="text-brass font-bold text-xs tracking-[0.2em] uppercase">
            STEP / 0{number}
          </span>
          <span className="flex items-center gap-2 text-foreground text-sm font-medium">
            <span className="w-2 h-2 bg-brass-bright rounded-sm group-hover:animate-pulse shadow-[0_0_8px_rgba(212,180,100,0.6)]"></span>
            {statusText}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tighter leading-[1.1] group-hover:text-brass-bright transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted text-base sm:text-lg leading-relaxed mb-12 font-medium">
          {description}
        </p>
      </div>

      {/* Footer Area with animated progress bar */}
      <div>
        <div className="relative w-full h-0.5 bg-depth mb-4 overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 h-full bg-brass w-0 group-hover:w-2/3 transition-all duration-700 ease-out"></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs sm:text-sm font-medium">
            {footerLeft}
          </span>
          <span className="text-foreground text-xs font-bold flex items-center gap-1 group-hover:text-brass transition-colors">
            {footerRight}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="reveal group relative p-6 rounded-lg bg-surface border border-depth/60 hover:border-brass/30 transition-colors duration-300">
      {/* Machined corner accents */}
      <svg
        className="absolute top-0 left-0 w-4 h-4 text-brass/20 group-hover:text-brass/40 transition-colors"
        viewBox="0 0 16 16"
      >
        <path d="M0 0 L16 0 L16 2 L2 2 L2 16 L0 16 Z" fill="currentColor" />
      </svg>
      <svg
        className="absolute bottom-0 right-0 w-4 h-4 text-brass/20 group-hover:text-brass/40 transition-colors rotate-180"
        viewBox="0 0 16 16"
      >
        <path d="M0 0 L16 0 L16 2 L2 2 L2 16 L0 16 Z" fill="currentColor" />
      </svg>

      <div className="text-brass-bright mb-6 transform group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h3 className="text-foreground text-xl font-bold tracking-tight mb-3">{title}</h3>
      <p className="text-muted text-base font-medium leading-relaxed">{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SVG ICONS (authored, consistent 24×24 stroke)
   ═══════════════════════════════════════════════════════════════════ */

const icons = {
  key: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="15" r="5" />
      <path d="M11.5 11.5L22 1" />
      <path d="M18 5L22 1" />
      <path d="M22 1L22 5" />
    </svg>
  ),
  pair: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="8" height="14" rx="2" />
      <rect x="14" y="3" width="8" height="10" rx="1" />
      <line x1="17" y1="13" x2="19" y2="13" />
      <line x1="18" y1="13" x2="18" y2="16" />
      <line x1="16" y1="16" x2="20" y2="16" />
      <path d="M10 11L14 8" strokeDasharray="2 2" />
    </svg>
  ),
  unlock: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      <line x1="12" y1="15" x2="12" y2="18" />
    </svg>
  ),
  shield: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L3 7v5c0 5.25 3.75 10.13 9 11.25C17.25 22.13 21 17.25 21 12V7L12 2z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  globe: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="4" ry="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),
  devices: (
    <svg
      width="45"
      height="45"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="11" rx="1" />
      <line x1="5" y1="14" x2="12" y2="14" />
      <line x1="8.5" y1="14" x2="8.5" y2="17" />
      <line x1="5" y1="17" x2="12" y2="17" />
      <rect x="17" y="6" width="6" height="12" rx="1" />
      <line x1="19" y1="15" x2="21" y2="15" />
    </svg>
  ),
  clock: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  code: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  ),
  server: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
      <path d="M12 10L12 14" strokeDasharray="2 2" />
    </svg>
  ),
  github: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════════
   ARCHITECTURE DIAGRAM — Zero-knowledge relay
   ═══════════════════════════════════════════════════════════════════ */

function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 700 200"
      className="w-full max-w-175 h-auto"
      aria-label="Architecture diagram showing encrypted data flowing through a zero-knowledge relay server"
      role="img"
    >
      {/* Phone */}
      <g>
        <rect
          x="20"
          y="50"
          width="50"
          height="80"
          rx="8"
          fill="#141820"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        <text
          x="45"
          y="145"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
          fontFamily="var(--font-geist-sans)"
        >
          Your Phone
        </text>
        {/* Lock icon */}
        <rect
          x="35"
          y="78"
          width="20"
          height="16"
          rx="2"
          fill="none"
          stroke="#c0a050"
          strokeWidth="1.2"
        />
        <path
          d="M39 78V74a6 6 0 0 1 12 0v4"
          fill="none"
          stroke="#c0a050"
          strokeWidth="1.2"
        />
      </g>

      {/* Encrypted data flow → */}
      <g>
        <line
          x1="80"
          y1="90"
          x2="260"
          y2="90"
          stroke="#c0a050"
          strokeWidth="1"
          strokeDasharray="8 4"
          opacity="0.5"
        />
        <text
          x="170"
          y="80"
          textAnchor="middle"
          fill="#c0a050"
          fontSize="10"
          fontFamily="var(--font-geist-mono)"
          opacity="0.7"
        >
          ENCRYPTED
        </text>
      </g>

      {/* Relay server */}
      <g>
        <rect
          x="270"
          y="40"
          width="160"
          height="100"
          rx="6"
          fill="#141820"
          stroke="#2a3444"
          strokeWidth="1.5"
        />
        <text
          x="350"
          y="70"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="13"
          fontFamily="var(--font-geist-sans)"
          fontWeight="600"
        >
          Relay Server
        </text>
        <text
          x="350"
          y="90"
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-geist-mono)"
        >
          ✕ Cannot read data
        </text>
        <text
          x="350"
          y="105"
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-geist-mono)"
        >
          ✕ No encryption keys
        </text>
        <text
          x="350"
          y="120"
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-geist-mono)"
        >
          ✕ No stored content
        </text>
        <text
          x="350"
          y="155"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
          fontFamily="var(--font-geist-sans)"
        >
          Pure Relay
        </text>
      </g>

      {/* Encrypted data flow → */}
      <g>
        <line
          x1="440"
          y1="90"
          x2="610"
          y2="90"
          stroke="#c0a050"
          strokeWidth="1"
          strokeDasharray="8 4"
          opacity="0.5"
        />
        <text
          x="525"
          y="80"
          textAnchor="middle"
          fill="#c0a050"
          fontSize="10"
          fontFamily="var(--font-geist-mono)"
          opacity="0.7"
        >
          ENCRYPTED
        </text>
      </g>

      {/* Desktop */}
      <g>
        <rect
          x="620"
          y="50"
          width="60"
          height="44"
          rx="4"
          fill="#141820"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        <line
          x1="638"
          y1="94"
          x2="662"
          y2="94"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        <line
          x1="650"
          y1="94"
          x2="650"
          y2="104"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        <line
          x1="636"
          y1="104"
          x2="664"
          y2="104"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        <text
          x="650"
          y="145"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
          fontFamily="var(--font-geist-sans)"
        >
          Your PC
        </text>
        {/* Unlock icon */}
        <rect
          x="640"
          y="66"
          width="20"
          height="16"
          rx="2"
          fill="none"
          stroke="#c0a050"
          strokeWidth="1.2"
        />
        <path
          d="M644 66V62a6 6 0 0 1 11.5-1"
          fill="none"
          stroke="#c0a050"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCROLL REVEAL HOOK
   Uses IntersectionObserver for browsers without scroll-timeline
   ═══════════════════════════════════════════════════════════════════ */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if scroll-driven animations are supported
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
      (el as HTMLElement).style.transform = "translateY(32px)";
      (el as HTMLElement).style.filter = "blur(4px)";
      (el as HTMLElement).style.transition =
        "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
      observer.observe(el);
    });

    // Style for .revealed
    const style = document.createElement("style");
    style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; filter: blur(0) !important; }`;
    document.head.appendChild(style);

    return () => {
      observer.disconnect();
      style.remove();
    };
  }, []);

  return ref;
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function Home() {
  const scrollRef = useScrollReveal();

  return (
    <div ref={scrollRef} className="flex flex-col">
      <Navbar />
      {/* ────────────────── HERO ────────────────── */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center min-h-screen px-6 py-20 overflow-hidden"
      >
        {/* Ambient workbench texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #c0a050 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, #94a3b8 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Warm brass ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(ellipse, #c0a050 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          {/* Product name */}
          <h1 
            className="text-7xl sm:text-8xl md:text-[10rem] font-extrabold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-foreground to-steel leading-[0.85] pb-2 select-none animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-backwards"
            style={{ animationDelay: "150ms" }}
          >
            Ledger
          </h1>

          {/* Tagline */}
          <p 
            className="text-lg sm:text-xl md:text-2xl text-muted font-medium max-w-2xl leading-relaxed tracking-tight mt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-backwards"
            style={{ animationDelay: "300ms" }}
          >
            Move anything between devices.
            <br className="hidden sm:block" />
            <span className="text-brass-bright font-semibold">Encrypted.</span>{" "}
            <span className="text-brass font-semibold">Instant.</span>{" "}
            <span className="text-brass-dim font-semibold">No install.</span>
          </p>

          {/* Tumbler mechanism */}
          <div 
            className="flex justify-center mb-12 relative z-0 animate-in fade-in zoom-in-[0.95] duration-1000 ease-out fill-mode-backwards"
            style={{ animationDelay: "450ms" }}
          >
            <DataBeamMechanism />
          </div>

          {/* CTAs */}
          <div 
            className="flex flex-col sm:flex-row items-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out fill-mode-backwards"
            style={{ animationDelay: "600ms" }}
          >
            <a
              id="cta-hero-get-started"
              href="/signup"
              className="relative overflow-hidden inline-flex items-center justify-center h-14 px-8 rounded-lg font-bold text-lg text-ground transition-all duration-300 hover:brightness-110 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(212,180,100,0.3)] group/btn"
              style={{
                background:
                  "linear-gradient(180deg, #d4b464 0%, #c0a050 50%, #8a7038 100%)",
              }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative z-10">Get Started</span>
            </a>
            <a
              id="cta-hero-github"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group/github inline-flex items-center gap-3 h-14 px-8 rounded-lg font-semibold text-steel border border-depth bg-surface/50 hover:bg-surface hover:border-brass/40 hover:text-brass-bright hover:shadow-[0_0_15px_rgba(192,160,80,0.1)] transition-all duration-300"
            >
              <span className="group-hover/github:scale-110 transition-transform duration-300">{icons.github}</span>
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" className="animate-bounce">
            <path
              d="M8 4 L8 18 M3 14 L8 19 L13 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ────────────────── HOW IT WORKS ────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="reveal text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 leading-tight">
              Three steps. <span className="text-transparent bg-clip-text bg-linear-to-r from-brass-bright to-brass-dim">Five seconds.</span>
            </h2>
            <p className="reveal text-muted text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
              No accounts on the sending device. No apps to install. Just a
              browser and a session code.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Step
              number={1}
              statusText="Device 1"
              title="Cut a new key."
              description="Open Ledger on your PC. A unique session code is generated — your one-time encryption key, valid for minutes."
              footerLeft="256-bit AES generation"
              footerRight="Initialize →"
            />
            <Step
              number={2}
              statusText="Device 2"
              title="Insert the key."
              description="On your phone, open Ledger in any browser. Enter the session code. Devices pair instantly over an encrypted channel."
              footerLeft="Direct P2P channel established"
              footerRight="Connect →"
            />
            <Step
              number={3}
              statusText="Ready"
              title="Turn the lock."
              description="Transfer clipboard text, links, or files. Everything flows encrypted in real time. The server never sees your data."
              footerLeft="Zero-knowledge transfer"
              footerRight="Transfer →"
            />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ────────────────── FEATURES ────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="reveal text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 leading-tight">
              Engineered for <span className="text-transparent bg-clip-text bg-linear-to-r from-brass-bright to-brass-dim">privacy.</span>
            </h2>
            <p className="reveal text-muted text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
              Every design decision puts your data under your control. No
              compromises, no exceptions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="End-to-end encrypted"
              description="256-bit encryption keys generated per session. The server is a relay — it forwards sealed payloads it cannot open."
              icon={icons.shield}
            />
            <FeatureCard
              title="No install required"
              description="Works in any modern browser on any device. Open the URL, enter a code, start transferring. Nothing to download."
              icon={icons.globe}
            />
            <FeatureCard
              title="Cross-platform"
              description="Phone to PC, PC to phone, any OS. If it runs a browser, it runs Ledger. No platform lock-in."
              icon={icons.devices}
            />
            <FeatureCard
              title="Ephemeral sessions"
              description="Sessions auto-expire. Nothing persists on the server. When the session ends, the data path ceases to exist."
              icon={icons.clock}
            />
            <FeatureCard
              title="Open source"
              description="Every line of code is public. Don't trust our claims — read the implementation, audit the architecture, verify it yourself."
              icon={icons.code}
            />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ────────────────── ARCHITECTURE ────────────────── */}
      <section id="architecture" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="reveal text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 leading-tight">
              Zero-knowledge <span className="text-transparent bg-clip-text bg-linear-to-r from-brass-bright to-brass-dim">by design.</span>
            </h2>
            <p className="reveal text-muted text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
              The server never holds encryption keys. It relays sealed
              payloads between paired devices — structurally unable to read
              what passes through.
            </p>
          </div>

          <div className="reveal flex justify-center mb-12 w-full overflow-x-auto pb-6 -mx-6 px-6 sm:mx-0 sm:px-0">
            <div className="min-w-175 flex justify-center w-full">
              <ArchitectureDiagram />
            </div>
          </div>

          <div className="reveal grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-5 rounded-lg bg-surface border border-depth/60">
              <div className="text-brass font-mono text-2xl font-bold mb-2">
                256-bit
              </div>
              <div className="text-muted text-sm">AES encryption per session</div>
            </div>
            <div className="p-5 rounded-lg bg-surface border border-depth/60">
              <div className="text-brass font-mono text-2xl font-bold mb-2">
                0 bytes
              </div>
              <div className="text-muted text-sm">
                Stored on server after session
              </div>
            </div>
            <div className="p-5 rounded-lg bg-surface border border-depth/60">
              <div className="text-brass font-mono text-2xl font-bold mb-2">
                100%
              </div>
              <div className="text-muted text-sm">Open-source codebase</div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ────────────────── FINAL CTA ────────────────── */}
      <section id="final-cta" className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="reveal text-5xl sm:text-6xl md:text-[5rem] font-bold tracking-tighter text-foreground mb-8 leading-none">
            Your data. Your devices.
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brass-bright to-brass-dim">No one in between.</span>
          </h2>
          <p className="reveal text-muted text-lg sm:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed tracking-tight">
            Start transferring files and clipboard content between your
            devices in seconds. Free, encrypted, open source.
          </p>
          <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              id="cta-final-get-started"
              href="/signup"
              className="relative overflow-hidden inline-flex items-center justify-center h-14 px-10 rounded-lg font-bold text-lg text-ground transition-all duration-300 hover:brightness-110 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(212,180,100,0.3)] group/btn"
              style={{
                background:
                  "linear-gradient(180deg, #d4b464 0%, #c0a050 50%, #8a7038 100%)",
              }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative z-10">Get Started — It&apos;s Free</span>
            </a>
            <a
              id="cta-final-github"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group/github inline-flex items-center gap-3 h-14 px-10 rounded-lg font-semibold text-steel border border-depth bg-surface/50 hover:bg-surface hover:border-brass/40 hover:text-brass-bright hover:shadow-[0_0_15px_rgba(192,160,80,0.1)] transition-all duration-300"
            >
              <span className="group-hover/github:scale-110 transition-transform duration-300">{icons.github}</span>
              <span>View Source</span>
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <Footer />
    </div>
  );
}
