"use client"
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../ProtectRoute";

const BACKEND_URL = "http://localhost:8000";

// ─── Icons ───────────────────────────────────────────────────────────────────
const LockIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const KeyIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="M21 2l-9.6 9.6" />
    <path d="M15.5 7.5l3 3L22 7l-3-3" />
  </svg>
);
const TrashIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const CopyIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ClockIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`p-1.5 rounded-md transition-all duration-200 ${copied ? "text-emerald-400 bg-emerald-400/10" : "text-muted hover:text-brass hover:bg-brass/10"}`}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="relative group overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-brass/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      <div className="relative bg-[#12151b]/80 border border-depth/50 rounded-2xl p-5 flex flex-col gap-1.5 group-hover:border-brass/20 transition-colors duration-300">
        <span className="text-[10px] font-bold text-steel uppercase tracking-[0.18em]">{label}</span>
        <span className="text-3xl font-extrabold text-foreground tracking-tight">{value}</span>
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </div>
    </div>
  );
}

function SessionCard({ session, onDelete }: { session: any; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(session.session_id);
    setDeleting(false);
  };

  const createdAt = session.createdAt ? new Date(session.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now";

  return (
    <div className="relative group/card animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hover border glow */}
      <div className="absolute -inset-px rounded-2xl bg-linear-to-r from-brass/0 via-brass/20 to-brass/0 opacity-0 group-hover/card:opacity-100 transition-all duration-500" />
      <div className="relative bg-[#12151b]/90 backdrop-blur border border-depth/50 rounded-2xl p-5 group-hover/card:border-transparent transition-colors duration-500">
        
        {/* Top row: Session ID badge + meta */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            {/* Status dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <code className="font-mono text-brass text-base font-bold tracking-[0.15em]">
              {session.session_id}
            </code>
          </div>
          <div className="flex items-center gap-2 text-muted text-xs">
            <ClockIcon />
            <span>{session.time_limit} min</span>
            <span className="text-depth/80 mx-0.5">·</span>
            <span>{createdAt}</span>
          </div>
        </div>

        {/* Encryption Key row */}
        <div className="bg-ground/60 rounded-xl px-4 py-3 border border-depth/50 flex items-center justify-between gap-3 group-hover/card:border-depth transition-colors">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[9px] font-bold text-steel uppercase tracking-widest mb-1">Encryption Key</span>
            <code className="font-mono text-xs text-foreground/70 truncate leading-relaxed tracking-wide">
              {session.encryption_key}
            </code>
          </div>
          <CopyButton value={session.encryption_key} />
        </div>

        {/* Bottom: Actions */}
        <div className="flex items-center justify-end mt-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/0 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 disabled:opacity-50"
          >
            <TrashIcon size={14} />
            {deleting ? "Revoking…" : "Revoke"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [timeLimit, setTimeLimit] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/session/create`,
        { timeLimit: timeLimit ? Number(timeLimit) : 5 },
        { withCredentials: true }
      );
      if (response.status === 201 && response.data.success) {
        setSessions((prev) => [response.data.data, ...prev]);
        setTimeLimit("");
      } else {
        throw new Error(response.data.message || "Failed to create session");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/v1/session/delete`, {
        data: { session_Id: sessionId },
        withCredentials: true,
      });
      if (response.status === 200 && response.data.success) {
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to revoke session");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/auth/logout`, {}, { withCredentials: true });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen relative overflow-hidden px-6 pt-24 pb-16">
      <Navbar />

      {/* ── Ambient background ─────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage: `radial-gradient(circle, #c0a050 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Top-center glow */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-175 h-175 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #c0a050 0%, transparent 65%)" }}
        />
        {/* Bottom-right glow */}
        <div
          className="absolute bottom-0 right-0 w-100 h-100 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #94a3b8 0%, transparent 70%)" }}
        />
      </div>

      <div
        className={`relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
{/* ── Stats row ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Active Sessions" value={sessions.length} sub="This session" />
          <StatCard
            label="Avg. Time Limit"
            value={sessions.length > 0 ? `${Math.round(sessions.reduce((a, s) => a + s.time_limit, 0) / sessions.length)} min` : "—"}
            sub="Across all sessions"
          />
          <StatCard
            label="Last Generated"
            value={sessions.length > 0 ? sessions[0].session_id : "None"}
            sub="Most recent key"
          />
        </div>

        {/* ── Main grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

          {/* ── Create session panel ──────────────────────────── */}
          <div className="sticky top-6">
            <div className="relative group">
              {/* Glow border */}
              <div className="absolute -inset-px rounded-2xl bg-linear-to-b from-brass/20 via-depth/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-[#12151b]/95 backdrop-blur-xl border border-depth/60 rounded-2xl shadow-2xl overflow-hidden">
                
                {/* Panel header */}
                <div className="px-6 pt-6 pb-4 border-b border-depth/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brass/10 border border-brass/20 flex items-center justify-center text-brass">
                      <KeyIcon size={14} />
                    </div>
                    <h2 className="font-bold text-foreground text-sm">New Session</h2>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-5">
                  {error && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex gap-2 items-start animate-in fade-in duration-300">
                      <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span>{error}</span>
                    </div>
                  )}

                  <form className="flex flex-col gap-5" onSubmit={handleCreateSession}>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="timeLimit" className="text-[10px] font-bold text-steel uppercase tracking-[0.2em]">
                        Expiry Duration
                      </label>
                      <div className="relative">
                        <input
                          id="timeLimit"
                          type="number"
                          min="1"
                          max="1440"
                          placeholder="5"
                          className="w-full bg-ground/60 border border-depth/80 rounded-xl pl-4 pr-14 py-3 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/30 transition-all font-mono text-sm shadow-inner"
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted font-medium pointer-events-none">min</span>
                      </div>
                      <p className="text-[11px] text-muted/60 leading-relaxed">
                        Defaults to 5 minutes. Session will self-destruct from Redis after expiry.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-ground text-sm transition-all duration-300 hover:brightness-110 active:scale-[0.98] hover:shadow-[0_0_24px_rgba(192,160,80,0.35)] relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(160deg, #d4b464 0%, #c0a050 50%, #8a7038 100%)" }}
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/20 to-transparent" />
                      {loading ? (
                        <>
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          Initializing…
                        </>
                      ) : (
                        <>
                          <PlusIcon />
                          Generate Keys
                        </>
                      )}
                    </button>
                  </form>

                  {/* Separator */}
                  <div className="flex items-center gap-3 text-depth">
                    <div className="h-px flex-1 bg-depth/60" />
                    <span className="text-[10px] text-muted/40 uppercase tracking-widest font-medium">Info</span>
                    <div className="h-px flex-1 bg-depth/60" />
                  </div>

                  {/* Info bullets */}
                  <ul className="flex flex-col gap-3">
                    {[
                      "Each session gets a unique 8-char ID",
                      "64-byte AES encryption key generated per session",
                      "Sessions auto-expire via Redis TTL",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-muted leading-relaxed">
                        <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-brass/15 border border-brass/30 flex items-center justify-center shrink-0">
                          <span className="w-1 h-1 rounded-full bg-brass block" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sessions list ─────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-bold text-steel uppercase tracking-[0.2em]">
                Active Sessions
              </h2>
              {sessions.length > 0 && (
                <span className="text-[11px] text-muted bg-depth/40 border border-depth/50 px-2 py-0.5 rounded-full font-mono">
                  {sessions.length} active
                </span>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="bg-[#12151b]/50 border border-dashed border-depth/40 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                <div
                  className="w-14 h-14 rounded-2xl border border-depth/60 flex items-center justify-center mb-5 text-muted/50"
                  style={{ background: "radial-gradient(circle, #1e293b 0%, #0d0f14 100%)" }}
                >
                  <KeyIcon size={22} />
                </div>
                <h3 className="text-foreground/80 font-semibold mb-2">No sessions initialized</h3>
                <p className="text-muted text-sm max-w-xs leading-relaxed">
                  Click <span className="text-brass font-medium">Generate Keys</span> to create an encrypted session with a unique ID and encryption key.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sessions.map((session, index) => (
                  <SessionCard
                    key={session.session_id + index}
                    session={session}
                    onDelete={handleDeleteSession}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
