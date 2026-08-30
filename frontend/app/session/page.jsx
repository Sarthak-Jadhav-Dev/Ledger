'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useSocket } from '../hooks/useSocket'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProtectedRoute from '../ProtectRoute'

export default function SessionPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [status, setStatus] = useState('idle') // idle | waiting | paired
  const [textToSend, setTextToSend] = useState('')
  const [error, setError] = useState(null)
  
  const scannerRef = useRef(null)

  const { joinSession, killSession, sendClipboard, paired, onSessionJoined, onSessionKilled, onSessionError, connected, socketReady } = useSocket()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('action') === 'scan') {
        setShowScanner(true)
      }
    }
  }, [])

  // Listen for socket events
  useEffect(() => {
    if (!socketReady) return
    onSessionJoined((data) => {
      setStatus('paired')
      setError(null)
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => {})
        setShowScanner(false)
      }
    })
    
    onSessionKilled(() => {
      setStatus('idle')
      setSessionId('')
    })
    
    onSessionError((err) => {
      console.error('Session error:', err)
      setError(err.code === 'SESSION_EXPIRED' ? 'Session not found or expired' : err.message || 'Connection failed')
      setStatus('idle')
    })
  }, [socketReady])

  // Paired state from hook
  useEffect(() => {
    if (paired) setStatus('paired')
  }, [paired])

  // Initialize Scanner
  useEffect(() => {
    if (showScanner && status !== 'paired' && typeof document !== 'undefined') {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }, false)
      
      scannerRef.current = scanner
      
      scanner.render((decodedText) => {
         try {
           const data = JSON.parse(decodedText)
           if (data.session_id) {
             setSessionId(data.session_id)
             joinSession(data.session_id)
             setStatus('waiting')
             scanner.clear().catch(e => {})
             setShowScanner(false)
           }
         } catch(e) {
           console.error('Invalid QR code format')
           // Don't show error immediately as it might be a partial scan, just ignore until valid
         }
      }, (error) => {
         // ignore scanner errors (fires continuously while scanning)
      })
      
      return () => {
        scanner.clear().catch(e => {})
      }
    }
  }, [showScanner, status])

  const handleJoin = () => {
    if (!sessionId.trim()) return
    setError(null)
    setStatus('waiting')
    joinSession(sessionId.trim().toUpperCase())
  }

  const handleKill = () => {
    if (sessionId) {
      killSession(sessionId)
    }
    router.push('/dashboard')
  }

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
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #c0a050 0%, transparent 65%)" }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 pt-24 z-10 w-full max-w-xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Connect to Session</h1>
          <p className="text-muted text-sm">Scan a code or enter an ID to securely send data</p>
        </div>

        {!connected && (
          <div className="flex items-center justify-center gap-3 p-4 mb-8 bg-yellow-900/10 border border-yellow-500/20 rounded-2xl text-yellow-300/80 text-sm animate-pulse w-full">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Connecting to server...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 mb-8 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-300 text-sm animate-in fade-in slide-in-from-top-2 w-full">
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Main Interaction Area */}
        <div className="relative group w-full mb-8">
          <div className="absolute -inset-px rounded-3xl bg-linear-to-b from-brass/30 via-depth/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative w-full p-8 rounded-3xl bg-[#12151b]/95 border border-depth/60 backdrop-blur-xl shadow-2xl flex flex-col items-center min-h-[340px] justify-center overflow-hidden">
            {status === 'paired' ? (
              <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-foreground">Secure Connection Established</h3>
                     <p className="text-xs text-emerald-400">Ready to transmit data</p>
                   </div>
                </div>
                <textarea
                  value={textToSend}
                  onChange={(e) => setTextToSend(e.target.value)}
                  placeholder="Type or paste text to securely transmit..."
                  className="w-full h-36 p-5 rounded-2xl bg-ground/80 border border-depth/80 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/30 transition-all resize-none font-mono text-sm shadow-inner"
                />
                <button
                  onClick={() => {
                    if (textToSend.trim() && sessionId) {
                      sendClipboard(sessionId, textToSend)
                      setTextToSend('')
                    }
                  }}
                  disabled={!textToSend.trim()}
                  className="w-full h-12 rounded-xl font-bold text-ground transition-all duration-300 hover:brightness-110 active:scale-[0.98] hover:shadow-[0_0_24px_rgba(192,160,80,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(160deg, #d4b464 0%, #c0a050 50%, #8a7038 100%)" }}
                >
                  Encrypt & Send
                </button>
              </div>
            ) : status === 'waiting' ? (
              <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-32 h-32 flex items-center justify-center bg-zinc-50/5 rounded-xl border border-depth/50 mb-6">
                  <svg className="animate-spin text-brass" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </div>
                <h3 className="text-foreground font-semibold mb-2">Connecting...</h3>
                <p className="text-sm text-muted/60 text-center">Please wait while we establish a secure connection to the receiver.</p>
              </div>
            ) : showScanner ? (
              <div className="w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden border border-depth/80 shadow-2xl"></div>
                <button 
                  onClick={() => setShowScanner(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl border border-depth/80 text-muted hover:text-foreground hover:bg-white/5 transition-all text-xs font-bold tracking-wide uppercase"
                >
                  Cancel Scanning
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
                <button
                  onClick={() => setShowScanner(true)}
                  className="w-full h-16 flex items-center justify-center gap-3 rounded-2xl bg-brass/10 border border-brass/30 hover:bg-brass/20 hover:border-brass/50 text-brass text-lg font-bold transition-all shadow-[0_0_15px_rgba(192,160,80,0.1)] hover:shadow-[0_0_25px_rgba(192,160,80,0.25)] active:scale-[0.98]"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="1"></rect></svg>
                  Scan QR Code
                </button>
                
                <div className="flex items-center gap-4 text-depth/80">
                  <div className="h-px flex-1 bg-depth/60" />
                  <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Or Enter ID Manually</span>
                  <div className="h-px flex-1 bg-depth/60" />
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    placeholder="e.g. A3F8B2C1"
                    value={sessionId}
                    onChange={e => setSessionId(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    maxLength={8}
                    className="w-full px-5 py-4 rounded-2xl bg-ground/60 border border-depth/80 text-foreground font-mono text-xl tracking-[0.2em] text-center placeholder:text-muted/30 focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/30 transition-all shadow-inner"
                  />
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
            )}
          </div>
        </div>

        {/* Meta Info row */}
        {status === 'paired' && (
          <div className="w-full bg-[#12151b]/80 border border-depth/50 rounded-2xl p-4 flex flex-col gap-1 shadow-lg backdrop-blur-md mb-8">
             <span className="text-[10px] font-bold text-steel uppercase tracking-widest text-center">Session ID</span>
             <span className="text-lg font-mono font-bold text-foreground text-center">
                {sessionId}
             </span>
          </div>
        )}

        {/* Actions */}
        {status === 'paired' && (
          <div className="flex gap-4">
            <button
              onClick={handleKill}
              className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs font-bold tracking-wide uppercase"
            >
              Disconnect
            </button>
          </div>
        )}

      </div>

      <Footer />
      
      {/* Global styles for html5-qrcode overrides to fit theme */}
      <style dangerouslySetInnerHTML={{__html: `
        #reader { border: none !important; }
        #reader__dashboard_section_csr span { color: #828a9f !important; }
        #reader__dashboard_section_csr button { 
          background: #1e293b !important; 
          color: #f8fafc !important; 
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
          margin: 10px 0 !important;
          font-family: inherit !important;
        }
        #reader__camera_selection {
          background: #0f172a !important;
          color: #f8fafc !important;
          border: 1px solid #334155 !important;
          border-radius: 6px !important;
          padding: 4px !important;
        }
        #reader__scan_region { background: #000 !important; }
      `}} />
    </div>
    </ProtectedRoute>
  )
}