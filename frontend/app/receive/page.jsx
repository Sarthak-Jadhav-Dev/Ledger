'use client'
import { useState, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ReceivePage() {
  const [sessionId, setSessionId] = useState('')
  const [joined, setJoined] = useState(false)
  const [phonePaired, setPhonePaired] = useState(false)
  const [feed, setFeed] = useState([])
  const [error, setError] = useState(null)

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
    if (!socketReady) return

    onSessionJoined((data) => {
      console.log('Session joined:', data)
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
      console.error('Session error:', err)
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const openUrl = (url) => {
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <Navbar />

      <div className="flex-1 p-8 pt-24 pb-16">
        <div className="max-w-xl mx-auto">

          <h1 className="text-2xl font-bold text-foreground mb-1">📥 Ledger Receive</h1>
          <p className="text-muted text-sm mb-8">
            Open on any device to receive data
          </p>

          {!connected && (
            <div className="p-3 mb-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl text-yellow-300 text-sm">
              ⏳ Connecting to server...
            </div>
          )}

          {error && (
            <div className="p-3 mb-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {!joined ? (
            <div className="space-y-3">
              <input
                placeholder="Enter Session ID — e.g. A3F8B2C1"
                value={sessionId}
                onChange={e => setSessionId(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl bg-[#12151b]/80 border border-depth/80 text-foreground font-mono text-lg tracking-widest placeholder:text-muted/40 focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/30 transition-all"
              />
              <button
                onClick={handleJoin}
                className="w-full py-3 rounded-xl font-semibold text-ground transition-all duration-300 hover:brightness-110 active:scale-[0.98] hover:shadow-[0_0_24px_rgba(192,160,80,0.35)]"
                style={{ background: "linear-gradient(160deg, #d4b464 0%, #c0a050 50%, #8a7038 100%)" }}
              >
                Connect
              </button>
            </div>

          ) : (
            <div>
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-[#12151b]/80 border border-depth/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    phonePaired ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400 animate-pulse'
                  }`} />
                  <span className="text-sm text-muted">
                    {phonePaired ? 'Phone Connected' : 'Waiting for phone...'}
                  </span>
                </div>
                <span className="text-xs font-mono text-muted/60">
                  {sessionId}
                </span>
              </div>

              {/* Feed */}
              {feed.length === 0 ? (
                <p className="text-center text-muted/50 py-16">
                  Nothing received yet
                </p>
              ) : (
                <div className="space-y-3">
                  {feed.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-[#12151b]/80 border border-depth/50"
                    >
                      {/* Item type badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase text-muted">
                          {item.type === 'url' ? '🔗 Link' :
                           item.type === 'code' ? '💻 Code' :
                           item.type === 'fastlane' ? '⚡ FastLane' :
                           '📋 Text'}
                        </span>
                        <span className="text-xs text-muted/50">{item.time}</span>
                      </div>

                      {/* Content */}
                      <p className="text-foreground text-sm font-mono break-all">
                        {item.content}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => copyToClipboard(item.content)}
                          className="px-3 py-1 rounded-lg bg-depth/40 text-muted text-xs hover:text-foreground transition"
                        >
                          Copy
                        </button>
                        {item.type === 'url' && (
                          <button
                            onClick={() => openUrl(item.content)}
                            className="px-3 py-1 rounded-lg bg-brass/10 text-brass text-xs hover:bg-brass/20 transition"
                          >
                            Open
                          </button>
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
  )
}