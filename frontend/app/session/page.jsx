'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useSocket } from '../hooks/useSocket'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProtectedRoute from '../ProtectRoute'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'

export default function SessionPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [status, setStatus] = useState('idle') // idle | waiting | paired
  const [textToSend, setTextToSend] = useState('')
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null)

  const { joinSession, killSession, sendClipboard, paired, onSessionJoined, onSessionKilled, onSessionError, connected, socketReady } = useSocket()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('action') === 'scan') {
        setShowScanner(true)
      }
    }
  }, [])

  useEffect(() => {
    if (!socketReady) return
    onSessionJoined((data) => {
      setStatus('paired')
      setError(null)
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => { })
        setShowScanner(false)
      }
    })
    onSessionKilled(() => {
      setStatus('idle')
      setSessionId('')
    })
    onSessionError((err) => {
      setError(err.code === 'SESSION_EXPIRED' ? 'Session not found or expired' : err.message || 'Connection failed')
      setStatus('idle')
    })
  }, [socketReady])

  useEffect(() => {
    if (paired) setStatus('paired')
  }, [paired])

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
            scanner.clear().catch(e => { })
            setShowScanner(false)
          }
        } catch (e) { }
      }, (error) => { })

      return () => {
        scanner.clear().catch(e => { })
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
    if (sessionId) killSession(sessionId)
    router.push('/dashboard')
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file || !session) return

    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Maximum 50MB.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('uploading')

    try {
      const result = await uploadFile(file, session.sessionId, (percent) => {
        setUploadProgress(percent)
      })

      // Notify PC via WebSocket
      socket.emit('fastlane-file', {
        sessionId: session.sessionId,
        fileUrl: result.downloadUrl,
        filename: result.filename,
        size: result.size,
        fileKey: result.fileKey,
      })

      setUploadStatus('sent')

    } catch (err) {
      setUploadStatus('failed')
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-parchment flex flex-col">
        <Navbar />
        <div className="absolute inset-0 grid-paper opacity-30 pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-20 relative z-10 w-full max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8 w-full">
            <h1 className="font-display text-3xl font-bold italic text-ink mb-1">Connect to Session</h1>
            <p className="text-ink-muted text-sm">Scan a code or enter an ID to securely send data.</p>
          </div>

          {/* Status banners */}
          {!connected && (
            <div className="flex items-center gap-3 px-4 py-3 mb-6 rounded-sm border border-amber-400/40 bg-amber-50 text-amber-800 text-sm w-full">
              <svg className="animate-spin shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Connecting to server…
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 mb-6 rounded-sm border border-red-300 bg-red-50 text-red-800 text-sm w-full">
              <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Main Card */}
          <div className="w-full border border-stone-dark bg-parchment rounded-sm p-8 flex flex-col items-center min-h-[320px] justify-center">
            {status === 'paired' ? (
              <div className="w-full flex flex-col gap-5 animate-in fade-in duration-400">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-dark">
                  <div className="w-7 h-7 rounded-sm bg-green-100 border border-green-300 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Secure Connection Established</p>
                    <p className="text-xs text-green-700">Ready to transmit data</p>
                  </div>
                </div>
                <Textarea
                  value={textToSend}
                  onChange={(e) => setTextToSend(e.target.value)}
                  placeholder="Type or paste text to securely transmit…"
                  className="h-36 font-mono text-sm"
                />
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (textToSend.trim() && sessionId) {
                      sendClipboard(sessionId, textToSend)
                      setTextToSend('')
                    }
                  }}
                  disabled={!textToSend.trim()}
                >
                  Encrypt & Send
                </Button>
              </div>
            ) : status === 'waiting' ? (
              <div className="flex flex-col items-center justify-center gap-5 animate-in fade-in duration-400">
                <div className="w-20 h-20 border border-stone-dark rounded-sm flex items-center justify-center bg-stone">
                  <svg className="animate-spin text-ink-muted" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-ink font-semibold mb-1">Connecting…</p>
                  <p className="text-sm text-ink-muted">Establishing a secure connection to the receiver.</p>
                </div>
              </div>
            ) : showScanner ? (
              <div className="w-full flex flex-col items-center gap-5 animate-in fade-in duration-400">
                <div id="reader" className="w-full max-w-sm rounded-sm overflow-hidden border border-stone-dark" />
                <Button variant="outline" size="sm" onClick={() => setShowScanner(false)}>
                  Cancel Scanning
                </Button>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-5 animate-in fade-in duration-400">
                <Button
                  size="xl"
                  className="w-full gap-3"
                  onClick={() => setShowScanner(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <rect x="7" y="7" width="10" height="10" rx="1" />
                  </svg>
                  Scan QR Code
                </Button>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-stone-dark" />
                  <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">Or Enter ID</span>
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
                    size="lg"
                    className="w-full"
                    onClick={handleJoin}
                    disabled={!connected || !sessionId.trim()}
                  >
                    Establish Connection
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Session Info + Disconnect */}
          {status === 'paired' && (
            <div className="w-full mt-4 flex flex-col gap-3">
              <div className="border border-stone-dark bg-parchment rounded-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest mb-0.5">Session ID</p>
                  <p className="font-mono font-bold text-lg text-ink tracking-[0.15em]">{sessionId}</p>
                </div>
                <Badge variant="success">connected</Badge>
              </div>
              <Button variant="destructive" size="sm" onClick={handleKill} className="self-start">
                Disconnect
              </Button>
            </div>
          )}

          <div className="mt-6 w-full max-w-xs">
            <label className={`flex items-center justify-center gap-3 px-5 py-3 rounded-xl border cursor-pointer transition w-full ${uploading
                ? 'border-zinc-700 text-zinc-600 cursor-not-allowed'
                : 'border-zinc-700 text-zinc-300 hover:border-blue-500'
              }`}>
              <span>📎</span>
              <span className="text-sm">
                {uploading ? `Uploading ${uploadProgress}%` : 'Send File'}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading || !session}
              />
            </label>

            {/* Progress bar */}
            {uploading && (
              <div className="mt-2 w-full bg-zinc-800 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {/* Status */}
            {uploadStatus === 'sent' && (
              <p className="mt-2 text-xs text-green-400">✅ File sent to PC</p>
            )}
            {uploadStatus === 'failed' && (
              <p className="mt-2 text-xs text-red-400">❌ Upload failed, try again</p>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}