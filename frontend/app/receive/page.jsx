'use client'
import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import axoisInstance from '../helpers/axios'
import { useSocket } from '../hooks/useSocket'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProtectedRoute from '../ProtectRoute'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Textarea } from '../components/ui/textarea'
import { Input } from '../components/ui/input'
import { APP_URL } from '@/lib/config'

// Prevent static prerendering - this page requires dynamic client-side rendering
export const dynamic = 'force-dynamic'

export default function ReceivePage() {
  const [sessionId, setSessionId] = useState('')
  const [session, setSession] = useState(null)
  const [joined, setJoined] = useState(false)
  const [phonePaired, setPhonePaired] = useState(false)
  const [feed, setFeed] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    joinSession,
    onSessionJoined,
    onReceiveClipboard,
    onSessionKilled,
    onFastlaneReceive,
    onSessionError,
    socket,
    socketReady,
    connected
  } = useSocket()

  useEffect(() => {
    handleCreateSession()
    socket?.on('fastlane-file-ready', ({ fileUrl, filename, size }) => {

      // Add to feed
      addToFeed('file', {
        url: fileUrl,
        filename,
        size: formatSize(size)
      })

      // Auto trigger browser download
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })

    // Format bytes helper
    const formatSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
  }, [])

  const handleCreateSession = async () => {
    setLoading(true)
    try {
      const res = await axoisInstance.post('/session/create', { mode: 'normal' })
      setSession(res.data.data)
      setSessionId(res.data.data.session_id)
      setError(null)
    } catch (err) {
      console.error('Session creation failed', err)
      setError("Failed to generate session.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.session_id && connected) {
      joinSession(session.session_id)
    }
  }, [session, connected])

  useEffect(() => {
    if (!socketReady) return

    onSessionJoined((data) => {
      setJoined(true)
      setError(null)
    })

    onReceiveClipboard(({ payload }) => {
      addToFeed(payload.type, payload.data)
    })

    onFastlaneReceive(({ payload }) => {
      addToFeed('fastlane', payload)
    })

    onSessionKilled(() => {
      setJoined(false)
      setPhonePaired(false)
      setFeed([])
    })

    onSessionError((err) => {
      setError(err.code === 'SESSION_EXPIRED' ? 'Session not found or expired' : err.message || 'Connection failed')
    })

    socket?.on('phone-connected', () => setPhonePaired(true))
    socket?.on('phone-disconnected', () => setPhonePaired(false))
  }, [socketReady])

  const addToFeed = (type, content) => {
    setFeed(prev => [{
      id: Date.now(),
      type,
      content,
      time: new Date().toLocaleTimeString()
    }, ...prev])
  }

  const handleJoin = () => {
    if (!sessionId.trim()) return
    setError(null)
    joinSession(sessionId.trim().toUpperCase())
  }

  const copyToClipboard = (text) => navigator.clipboard.writeText(text)
  const openUrl = (url) => window.open(url, '_blank')

  const qrValue = session
    ? JSON.stringify({ session_id: session.session_id, encryption_key: session.encryption_key })
    : ''

  const appLinkValue = `${APP_URL}/session?action=scan`

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-parchment flex flex-col">
        <Navbar />
        <div className="absolute inset-0 grid-paper opacity-30 pointer-events-none" />

        <div className="flex-1 px-6 pt-28 pb-20 z-10 relative">
          <div className="max-w-4xl mx-auto w-full">

            {/* Header */}
            <div className="mb-10">
              <h1 className="font-display text-3xl font-bold italic text-ink mb-1">Receive Data</h1>
              <p className="text-ink-muted text-sm">Connect a device to receive encrypted files and links.</p>
            </div>

            {/* Status banners */}
            {!connected && (
              <div className="flex items-center gap-3 px-4 py-3 mb-6 rounded-sm border border-amber-400/40 bg-amber-50 text-amber-800 text-sm">
                <svg className="animate-spin shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Establishing secure connection to server…
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 px-4 py-3 mb-6 rounded-sm border border-red-300 bg-red-50 text-red-800 text-sm">
                <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {!phonePaired ? (
              <div className="flex flex-col items-center animate-in fade-in duration-500">

                {/* QR Code cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
                  {/* QR 1 — App Link */}
                  <div className="border border-stone-dark bg-parchment rounded-sm p-8 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-ink mb-1 uppercase tracking-widest">1. Open the App</h3>
                    <p className="text-xs text-ink-muted text-center mb-6 leading-relaxed">
                      Scan with your phone's camera to open the Sender page.
                    </p>
                    <div className="relative overflow-hidden p-4 rounded-sm bg-white border border-stone-dark shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-ink/30 shadow-[0_0_10px_rgba(26,20,16,0.3)] animate-scan" />
                      <QRCodeSVG value={appLinkValue} size={180} level="Q" includeMargin={false} fgColor="#1a1410" />
                    </div>
                  </div>

                  {/* QR 2 — Session Connect */}
                  <div className="border border-stone-dark bg-parchment rounded-sm p-8 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-ink mb-1 uppercase tracking-widest">2. Connect to Session</h3>
                    <p className="text-xs text-ink-muted text-center mb-6 leading-relaxed">
                      Scan with the web app's scanner to securely pair devices.
                    </p>
                    <div className="relative overflow-hidden p-4 rounded-sm bg-white border border-stone-dark shadow-sm hover:shadow-md transition-shadow duration-300">
                      {!loading && session && (
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-ink/30 shadow-[0_0_10px_rgba(26,20,16,0.3)] animate-scan" style={{ animationDelay: '1s' }} />
                      )}
                      {loading || !session ? (
                        <div className="w-45 h-45 flex flex-col items-center justify-center gap-3 text-ink-faint">
                          <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          <span className="text-[10px] uppercase tracking-widest font-bold">Generating</span>
                        </div>
                      ) : (
                        <QRCodeSVG value={qrValue} size={180} level="Q" includeMargin={false} fgColor="#1a1410" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="w-full max-w-sm border border-stone-dark bg-parchment rounded-sm p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-px flex-1 bg-stone-dark" />
                    <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">Manual Entry</span>
                    <div className="h-px flex-1 bg-stone-dark" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Input
                      placeholder="e.g. A3F8B2C1"
                      value={sessionId}
                      onChange={e => setSessionId(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleJoin()}
                      maxLength={8}
                      className="h-12 text-center font-mono text-xl tracking-[0.2em]"
                    />
                    <Button
                      onClick={handleJoin}
                      disabled={!connected || !sessionId.trim()}
                      size="lg"
                      className="w-full"
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Status Bar */}
                <div className={`flex items-center justify-between mb-6 px-5 py-4 border rounded-sm transition-all duration-700 ${phonePaired ? 'border-green-300 bg-green-50' : 'border-stone-dark bg-parchment'}`}>
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping ${phonePaired ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${phonePaired ? 'bg-green-600' : 'bg-amber-500'}`} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{phonePaired ? 'Sender Connected' : 'Awaiting Sender'}</p>
                      <p className="text-[10px] text-ink-faint uppercase tracking-widest">Connection Status</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-lg tracking-[0.15em] text-ink">{sessionId}</p>
                    <p className="text-[10px] text-ink-faint uppercase tracking-widest">Session ID</p>
                  </div>
                </div>

                {/* Feed */}
                {feed.length === 0 ? (
                  <div className="border border-dashed border-stone-dark rounded-sm py-20 flex flex-col items-center justify-center text-center bg-parchment/60">
                    <div className="w-12 h-12 rounded-sm border border-stone-dark flex items-center justify-center mb-4 text-ink-faint bg-stone">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <h3 className="text-ink font-semibold mb-1">Awaiting Data</h3>
                    <p className="text-sm text-ink-muted max-w-sm leading-relaxed">
                      Once the sender transmits text, links, or files, they will appear here instantly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feed.map(item => (
                      <div
                        key={item.id}
                        className="border border-stone-dark bg-parchment rounded-sm p-5 hover:border-ink/20 hover:shadow-sm transition-all animate-in fade-in slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] fill-mode-both"
                      >
                        {/* Item header */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-dark">
                          <Badge variant="outline">
                            {item.type === 'url' ? 'Link' : item.type === 'code' ? 'Code' : item.type === 'fastlane' ? 'FastLane' : 'Text'}
                          </Badge>
                          <span className="text-[11px] text-ink-faint font-mono">{item.time}</span>
                        </div>

                        {/* Content */}
                        <div className="bg-stone/50 rounded-sm p-4 border border-stone-dark mb-4 max-h-70 overflow-y-auto">
                          <p className="text-ink text-sm font-mono wrap-break-word leading-relaxed whitespace-pre-wrap">
                            {item.content}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(item.content)} className="gap-1.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Copy
                          </Button>
                          {item.type === 'url' && (
                            <Button size="sm" onClick={() => openUrl(item.content)} className="gap-1.5">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                              Open Link
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}