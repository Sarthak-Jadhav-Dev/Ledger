'use client'
import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import axoisInstance from '../helpers/axios'
import { useSocket } from '../hooks/useSocket'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProtectedRoute from '../ProtectRoute'

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

  // Create session on load
  useEffect(() => {
    handleCreateSession()
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

  // Auto join socket room when session created
  useEffect(() => {
    if (session?.session_id && connected) {
      joinSession(session.session_id)
    }
  }, [session, connected])

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

  // Build the QR payload from session data
  const qrValue = session
    ? JSON.stringify({
        session_id: session.session_id,
        encryption_key: session.encryption_key,
      })
    : ''
    
  const appLinkValue = typeof window !== 'undefined' 
    ? `http://192.168.1.3:3000/session?action=scan` 
    : ''

  return (
    <ProtectedRoute>
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #c0a050 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #94a3b8 0%, transparent 70%)" }}
        />
      </div>

      <div className="flex-1 p-8 pt-24 pb-16 z-10">
        <div className="max-w-4xl mx-auto w-full">

          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Receive Data</h1>
            <p className="text-muted text-sm">Connect a device to receive encrypted files and links</p>
          </div>

          {!connected && (
            <div className="max-w-xl mx-auto flex items-center justify-center gap-3 p-4 mb-8 bg-yellow-900/10 border border-yellow-500/20 rounded-2xl text-yellow-300/80 text-sm animate-pulse">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Establishing secure connection to server...
            </div>
          )}

          {error && (
            <div className="max-w-xl mx-auto flex items-start gap-3 p-4 mb-8 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-300 text-sm animate-in fade-in slide-in-from-top-2">
              <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {!phonePaired ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 {/* QR 1: App Link */}
                 <div className="p-8 rounded-3xl bg-[#12151b]/95 border border-depth/60 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                    <h3 className="text-lg font-bold text-foreground mb-1">1. Open the App</h3>
                    <p className="text-xs text-muted/80 text-center mb-6">Scan with your phone's normal camera to open the Sender page.</p>
                    <div className="p-4 rounded-2xl bg-white shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform duration-500 hover:scale-105">
                       <QRCodeSVG value={appLinkValue} size={180} level="Q" includeMargin={false} />
                    </div>
                 </div>

                 {/* QR 2: Session Connect */}
                 <div className="p-8 rounded-3xl bg-[#12151b]/95 border border-depth/60 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                    <h3 className="text-lg font-bold text-foreground mb-1">2. Connect to Session</h3>
                    <p className="text-xs text-muted/80 text-center mb-6">Scan with the web app's scanner to securely pair devices.</p>
                    <div className="p-4 rounded-2xl bg-white shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform duration-500 hover:scale-105">
                      {loading || !session ? (
                        <div className="w-[180px] h-[180px] flex items-center justify-center bg-zinc-50 rounded-xl">
                          <div className="flex flex-col items-center gap-3">
                            <svg className="animate-spin text-zinc-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Generating</span>
                          </div>
                        </div>
                      ) : (
                        <QRCodeSVG value={qrValue} size={180} level="Q" includeMargin={false} />
                      )}
                    </div>
                 </div>
               </div>

              {/* Manual Entry Fallback */}
              <div className="relative group max-w-md w-full">
                <div className="absolute -inset-px rounded-3xl bg-linear-to-b from-brass/30 via-depth/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative p-6 rounded-3xl bg-[#12151b]/95 border border-depth/60 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-bold text-steel uppercase tracking-[0.2em] ml-1">Or connect manually</label>
                     <input
                       placeholder="e.g. A3F8B2C1"
                       value={sessionId}
                       onChange={e => setSessionId(e.target.value.toUpperCase())}
                       onKeyDown={e => e.key === 'Enter' && handleJoin()}
                       maxLength={8}
                       className="w-full px-5 py-4 rounded-2xl bg-ground/60 border border-depth/80 text-foreground font-mono text-xl tracking-[0.2em] text-center placeholder:text-muted/30 focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/30 transition-all shadow-inner"
                     />
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={!connected || !sessionId.trim()}
                    className="w-full h-14 rounded-xl font-bold text-ground text-lg transition-all duration-300 hover:brightness-110 active:scale-[0.98] hover:shadow-[0_0_24px_rgba(192,160,80,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    style={{ background: "linear-gradient(160deg, #d4b464 0%, #c0a050 50%, #8a7038 100%)" }}
                  >
                    Establish Connection
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-8 p-4 rounded-2xl bg-[#12151b]/90 border border-depth/60 backdrop-blur-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping ${phonePaired ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${phonePaired ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {phonePaired ? 'Sender Connected' : 'Awaiting Sender'}
                    </span>
                    <span className="text-[10px] text-muted tracking-wide uppercase">Connection Status</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-lg font-mono font-bold tracking-[0.15em] text-brass">
                     {sessionId}
                   </span>
                   <span className="text-[10px] text-muted tracking-wide uppercase">Session ID</span>
                </div>
              </div>

              {/* Feed */}
              {feed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 border border-dashed border-depth/40 rounded-3xl bg-[#12151b]/40">
                  <div className="w-16 h-16 rounded-full bg-depth/30 flex items-center justify-center mb-4 border border-depth/50 text-muted">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <h3 className="text-foreground font-semibold mb-1">Awaiting Data</h3>
                  <p className="text-sm text-muted/60 text-center max-w-sm leading-relaxed">
                    Once the sender securely transmits text, links, or files, they will appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feed.map(item => (
                    <div
                      key={item.id}
                      className="group p-5 rounded-2xl bg-[#12151b]/80 border border-depth/50 hover:border-depth transition-colors backdrop-blur-xl shadow-lg relative overflow-hidden"
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-linear-to-r from-brass/0 via-brass/5 to-brass/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        {/* Item header */}
                        <div className="flex items-center justify-between mb-3 border-b border-depth/30 pb-3">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded bg-surface border border-depth/80 flex items-center justify-center text-muted">
                               {item.type === 'url' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> :
                                item.type === 'code' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> :
                                item.type === 'fastlane' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> :
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
                             </div>
                             <span className="text-[10px] font-bold uppercase tracking-widest text-steel">
                              {item.type === 'url' ? 'Link' :
                               item.type === 'code' ? 'Code Snippet' :
                               item.type === 'fastlane' ? 'FastLane Transfer' :
                               'Text Data'}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted/60 font-mono">{item.time}</span>
                        </div>
  
                        {/* Content */}
                        <div className="bg-ground/40 rounded-xl p-4 border border-depth/40 mb-4 max-h-[300px] overflow-y-auto">
                          <p className="text-foreground text-sm font-mono break-words leading-relaxed whitespace-pre-wrap selection:bg-brass/30">
                            {item.content}
                          </p>
                        </div>
  
                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => copyToClipboard(item.content)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-depth/60 text-muted hover:text-foreground hover:border-brass/40 transition-all text-xs font-bold"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy to Clipboard
                          </button>
                          {item.type === 'url' && (
                            <button
                              onClick={() => openUrl(item.content)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brass/10 border border-brass/20 text-brass hover:bg-brass/20 hover:text-brass transition-all text-xs font-bold"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                              Open Link
                            </button>
                          )}
                        </div>
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