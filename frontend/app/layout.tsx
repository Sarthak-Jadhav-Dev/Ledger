import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./AuthContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledger — Encrypted Cross-Device Transfer",
  description:
    "Move clipboard, text, links, and files between your phone and PC in seconds. End-to-end encrypted, browser-based, no install required. Open source.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/*
        DIRECTION CONTRACT — Locksmith's Workbench (seed 84810650)
        THESIS: The session code is a precision-cut key; encryption is physical
        security engineering. This surface refuses the gradient-mesh SaaS hero
        and the glass-card device mockup.
        OWN-WORLD: Dark machined-metal ground (#0d0f14), brushed steel (#94a3b8)
        and warm brass (#c0a050) accents. Tumbler mechanisms, cross-section
        cutaways, precision-cut key blanks. Geist as the machinist display face.
        STORY: The visitor sees the mechanism at work — a session code being cut
        into a key, tumblers aligning — understands that Ledger encrypts without
        reading, believes it because the architecture is transparent and open
        source, and signs up to try it.
        FIRST VIEWPORT: Dark workbench. Center: SVG cross-section cutaway of a
        lock mechanism with brass key sliding in, hex digits mapping to pin
        heights. Phone silhouette left, desktop right. "Ledger" display headline
        above, brass "Get Started" CTA below.
        FORM: Locksmith's Workbench, position 3 of grounded list, seed 84810650.
        FINISH: unreviewed and undocumented is unfinished; this build ends with
        the finish review, the verdict, DESIGN.md, and every shipping raster
        carrying its provenance.
      */}
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
