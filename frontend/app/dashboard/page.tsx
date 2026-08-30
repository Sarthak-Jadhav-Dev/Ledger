"use client"
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../ProtectRoute";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? `http://${window.location.hostname}:8000`
  : "http://localhost:8000";

// ─── Icons ───────────────────────────────────────────────────────────────────
const LockIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const KeyIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6" /><path d="M15.5 7.5l3 3L22 7l-3-3" />
  </svg>
);
const TrashIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const CopyIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const CheckIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ClockIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const SendIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const ReceiveIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
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
      className={`p-1.5 rounded-sm border transition-all duration-150 ${
        copied
          ? "border-green-400 bg-green-50 text-green-700"
          : "border-stone-dark bg-stone hover:bg-parchment-dark text-ink-muted hover:text-ink"
      }`}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-stone-dark bg-parchment rounded-sm p-5 flex flex-col gap-1.5 hover:border-ink/20 transition-colors duration-200">
      <span className="text-[10px] font-bold text-ink-faint uppercase tracking-[0.2em]">{label}</span>
      <span className="text-3xl font-bold text-ink tracking-tight">{value}</span>
      {sub && <span className="text-xs text-ink-muted">{sub}</span>}
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

  const createdAt = session.createdAt
    ? new Date(session.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Just now";

  return (
    <div className="border border-stone-dark bg-parchment rounded-sm p-5 hover:border-ink/25 hover:shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
          </span>
          <code className="font-mono text-ink text-base font-bold tracking-[0.18em]">
            {session.session_id}
          </code>
          <Badge variant="success">active</Badge>
        </div>
        <div className="flex items-center gap-1.5 text-ink-faint text-xs">
          <ClockIcon />
          <span>{session.timeLimit || 5} min</span>
          <span className="mx-0.5 text-stone-dark">·</span>
          <span>{createdAt}</span>
        </div>
      </div>

      {/* Encryption Key */}
      <div className="bg-stone/60 rounded-sm px-4 py-3 border border-stone-dark flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9px] font-bold text-ink-faint uppercase tracking-widest mb-0.5">Encryption Key</span>
          <code className="font-mono text-xs text-ink-muted truncate leading-relaxed">
            {session.encryption_key}
          </code>
        </div>
        <CopyButton value={session.encryption_key} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-700 hover:bg-red-50 hover:text-red-800 gap-1.5"
        >
          <TrashIcon size={13} />
          {deleting ? "Revoking…" : "Revoke"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/session/active`, { withCredentials: true });
      if (response.data.success) setSessions(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch active sessions");
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-parchment">
        <Navbar />
        <div className="absolute inset-0 grid-paper opacity-30 pointer-events-none" />

        <div
          className={`relative z-10 w-full max-w-3xl mx-auto px-6 pt-28 pb-20 flex flex-col gap-8 transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {/* Page header */}
          <div>
            <h1 className="font-display text-3xl font-bold italic text-ink mb-1">Dashboard</h1>
            <p className="text-ink-muted text-sm">Manage your active encrypted sessions.</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button size="xl" onClick={() => router.push("/session")} className="gap-2">
              <SendIcon size={18} />
              Send
            </Button>
            <Button size="xl" variant="outline" onClick={() => router.push("/receive")} className="gap-2">
              <ReceiveIcon size={18} />
              Receive
            </Button>
          </div>

          {/* Divider */}
          <div className="h-px bg-stone-dark" />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Active Sessions" value={sessions.length} sub="This account" />
            <StatCard
              label="Avg. Time Limit"
              value={sessions.length > 0 ? `${Math.round(sessions.reduce((a, s) => a + (s.timeLimit || 5), 0) / sessions.length)} min` : "—"}
              sub="Across all sessions"
            />
            <StatCard
              label="Last Generated"
              value={sessions.length > 0 ? sessions[0].session_id : "None"}
              sub="Most recent key"
            />
          </div>

          {/* Sessions list */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-ink-muted uppercase tracking-[0.2em]">
                Active Sessions
              </h2>
              {sessions.length > 0 && (
                <Badge variant="outline">{sessions.length} active</Badge>
              )}
            </div>

            {loading ? (
              <div className="py-16 flex items-center justify-center text-ink-muted text-sm">
                <svg className="animate-spin mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Loading sessions…
              </div>
            ) : error ? (
              <div className="px-4 py-3 rounded-sm border border-red-300 bg-red-50 text-red-800 text-sm">
                {error}
              </div>
            ) : sessions.length === 0 ? (
              <div className="border border-dashed border-stone-dark rounded-sm py-16 flex flex-col items-center justify-center text-center bg-parchment/60">
                <div className="w-12 h-12 rounded-sm border border-stone-dark flex items-center justify-center mb-4 text-ink-faint bg-stone">
                  <KeyIcon size={20} />
                </div>
                <h3 className="text-ink font-semibold mb-1.5">No active sessions</h3>
                <p className="text-ink-muted text-sm max-w-xs leading-relaxed">
                  Click <span className="font-semibold text-ink">Receive</span> to generate a new session and display your secure QR code.
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
    </ProtectedRoute>
  );
}
