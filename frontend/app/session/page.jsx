'use client'
import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useRouter } from 'next/navigation'
import axoisInstance from '../helpers/axios'
import { useSocket } from '../hooks/useSocket'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function SessionPage() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [mode, setMode] = useState('normal')
  const [timeLeft, setTimeLeft] = useState(900)
  const [status, setStatus] = useState('idle') // idle | waiting | paired
  const [loading, setLoading] = useState(false)
  const [textToSend, setTextToSend] = useState('')

  const { joinSession, killSession, sendClipboard, paired, onSessionJoined, onSessionKilled } = useSocket()

  // Create session on load
  useEffect(() => {
    handleCreateSession()
  }, [])

  // Listen for socket events
  useEffect(() => {
    onSessionJoined(() => setStatus('waiting'))
    onSessionKilled(() => {
      setStatus('idle')
      router.push('/dashboard')
    })
  }, [])

  // Paired state from hook
  useEffect(() => {
    if (paired) setStatus('paired')
  }, [paired])

  // Auto join socket room when session created
  useEffect(() => {
    if (session?.session_id) {
      joinSession(session.session_id)
    }
  }, [session])

  // Countdown timer
  useEffect(() => {
    if (status === 'idle') return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status])

  const handleCreateSession = async () => {
    setLoading(true)
    try {
      const res = await axoisInstance.post('/session/create', { mode })
      setSession(res.data.data)
      setStatus('waiting')
      setTimeLeft(900)
    } catch (err) {
      console.error('Session creation failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKill = async () => {
    if (session) {
      killSession(session.session_id)
      await axoisInstance.delete(`/session/${session.session_id}`)
    }
    router.push('/dashboard')
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Build the QR payload from session data
  const qrValue = session
    ? JSON.stringify({
        session_id: session.session_id,
        encryption_key: session.encryption_key,
      })
    : ''

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-8 pt-24">

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-10 p-1 rounded-xl bg-[#12151b]/80 border border-depth/50">
          {['normal', 'fastlane'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${mode === m
                  ? 'bg-brass/20 text-brass border border-brass/30'
                  : 'text-muted hover:text-foreground'
                }`}
            >
              {m === 'fastlane' ? '⚡ FastLane' : 'Normal'}
            </button>
          ))}
        </div>

        {/* Main Interaction Area */}
        <div className="w-full max-w-md p-6 rounded-2xl bg-[#12151b]/80 border border-depth/50 mb-6 shadow-2xl flex flex-col items-center">
          {status === 'paired' ? (
            <div className="w-full flex flex-col gap-4">
              <textarea
                value={textToSend}
                onChange={(e) => setTextToSend(e.target.value)}
                placeholder="Type or paste text to send..."
                className="w-full h-32 p-4 rounded-xl bg-ground/60 border border-depth/80 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/30 transition-all resize-none font-mono text-sm"
              />
              <button
                onClick={() => {
                  if (textToSend.trim() && session?.session_id) {
                    sendClipboard(session.session_id, textToSend)
                    setTextToSend('')
                  }
                }}
                disabled={!textToSend.trim()}
                className="w-full py-3 rounded-xl font-bold text-ground transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(160deg, #d4b464 0%, #c0a050 50%, #8a7038 100%)" }}
              >
                Send to Receiver
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white shadow-inner">
              {loading || !session ? (
                <div className="w-52 h-52 flex items-center justify-center">
                  <span className="text-black text-sm animate-pulse">
                    Generating...
                  </span>
                </div>
              ) : (
                <QRCodeSVG
                  value={qrValue}
                  size={208}
                />
              )}
            </div>
          )}
        </div>

        {/* Session ID — manual fallback */}
        {session && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted text-sm">Session ID:</span>
            <span className="text-foreground font-mono font-bold tracking-widest">
              {session.session_id}
            </span>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${status === 'paired' ? 'bg-emerald-400 animate-pulse' :
              status === 'waiting' ? 'bg-yellow-400 animate-pulse' :
                'bg-zinc-600'
            }`} />
          <span className="text-sm text-muted">
            {status === 'paired' ? 'Device Connected' :
              status === 'waiting' ? 'Waiting for device...' :
                'Starting...'}
          </span>
        </div>

        {/* Timer */}
        <div className="text-muted text-sm mb-10">
          Expires in{' '}
          <span className="text-foreground font-mono">{formatTime(timeLeft)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCreateSession}
            className="px-5 py-2.5 rounded-xl border border-depth/80 text-muted hover:text-foreground hover:border-brass/50 transition text-sm"
          >
            Refresh QR
          </button>
          <button
            onClick={handleKill}
            className="px-5 py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition text-sm"
          >
            Kill Session
          </button>
        </div>

      </div>

      <Footer />
    </div>
  )
}