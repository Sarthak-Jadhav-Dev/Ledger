'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useSocket } from '../hooks/useSocket'
import { uploadFile } from '../../lib/upload'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProtectedRoute from '../ProtectRoute'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'

// Prevent static prerendering - this page requires dynamic client-side rendering
export const dynamic = 'force-dynamic'

export default function ScanPage() {
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

  // Bidirectional: receiving state
  const [feed, setFeed] = useState([])
  const [activeTab, setActiveTab] = useState('send') // 'send' | 'receive'

  const { joinSession, killSession, sendClipboard, sendFastlaneFile, paired, onSessionJoined, onSessionKilled, onSessionError, onReceiveClipboard, onFastlaneReceive, connected, socketReady, socket } = useSocket()

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
      setFeed([])
    })
    onSessionError((err) => {
      setError(err.code === 'SESSION_EXPIRED' ? 'Session not found or expired' : err.message || 'Connection failed')
      setStatus('idle')
    })

    // Bidirectional: listen for incoming data
    onReceiveClipboard(({ payload }) => {
      addToFeed(payload.type, payload.data)
    })
    onFastlaneReceive(({ payload }) => {
      addToFeed('fastlane', payload)
    })

    // Listen for file downloads
    socket?.on('fastlane-file-ready', ({ fileUrl, filename, size }) => {
      const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      }
      addToFeed('file', { url: fileUrl, filename, size: formatSize(size) })
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
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
            joinSession(data.session_id, 'sender')
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
    joinSession(sessionId.trim().toUpperCase(), 'sender')
  }

  const handleKill = () => {
    if (sessionId) killSession(sessionId)
    router.push('/dashboard')
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file || !sessionId) return

    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Maximum 50MB.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('uploading')

    try {
      const data = await uploadFile(file, sessionId, (progress) => {
        setUploadProgress(progress)
      })
      
      // Notify receiver about the uploaded file
      sendFastlaneFile(sessionId, data.downloadUrl, data.filename, data.size)

      setUploadStatus('sent')

    } catch (err) {
      setUploadStatus('failed')
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  const addToFeed = (type, content) => {
    setFeed(prev => [{
      id: Date.now(),
      type,
      content,
      time: new Date().toLocaleTimeString()
    }, ...prev])
  }

  const copyToClipboard = (text) => navigator.clipboard.writeText(text)
  const openUrl = (url) => window.open(url, '_blank')

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-parchment flex flex-col">
        <Navbar />
        <div className="absolute inset-0 grid-paper opacity-30 pointer-events-none" />

        <div className="flex-1 flex flex-col items-center px-6 pt-24 pb-20 relative z-10 w-full max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8 w-full">
            <h1 className="font-display text-3xl font-bold italic text-ink mb-1">Scan QR</h1>
            <p className="text-ink-muted text-sm">Scan a QR code or enter a session ID to pair and transfer data.</p>
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
          {status === 'paired' ? (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-6 px-5 py-4 border border-green-300 bg-green-50 rounded-sm">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-50 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">Secure Connection Active</p>
                    <p className="text-[10px] text-ink-faint uppercase tracking-widest">Ready to transfer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-lg tracking-[0.15em] text-ink">{sessionId}</p>
                  <p className="text-[10px] text-ink-faint uppercase tracking-widest">Session ID</p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex border border-stone-dark rounded-sm mb-6 overflow-hidden">
                <button
                  onClick={() => setActiveTab('send')}
                  className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'send'
                      ? 'bg-ink text-parchment'
                      : 'bg-parchment text-ink-muted hover:bg-stone'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Send
                </button>
                <button
                  onClick={() => setActiveTab('receive')}
                  className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'receive'
                      ? 'bg-ink text-parchment'
                      : 'bg-parchment text-ink-muted hover:bg-stone'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Incoming
                  {feed.length > 0 && <Badge variant="success">{feed.length}</Badge>}
                </button>
              </div>

              {/* Send Tab */}
              {activeTab === 'send' && (
                <div className="w-full flex flex-col gap-5 animate-in fade-in duration-400">
                  <Textarea
                    value={textToSend}
                    onChange={(e) => setTextToSend(e.target.value)}
                    placeholder="Type or paste text to securely transmit…"
                    className="h-36 font-mono text-sm"
                  />
                  <Button
                    size="lg"
                    className="w-full relative transition-all duration-300"
                    onClick={() => {
                      if (textToSend.trim() && sessionId) {
                        sendClipboard(sessionId, textToSend)
                        setTextToSend('')
                      }
                    }}
                    disabled={!textToSend.trim()}
                    id="send-btn"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Encrypt & Send
                    </span>
                  </Button>

                  {/* File upload */}
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-stone-dark" />
                    <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">Or Send a File</span>
                    <div className="h-px flex-1 bg-stone-dark" />
                  </div>

                  <label className={`flex items-center justify-center gap-3 px-5 py-3 rounded-sm border cursor-pointer transition-all duration-300 w-full ${uploading
                      ? 'border-stone-dark bg-stone text-ink-muted cursor-not-allowed'
                      : 'border-stone-dark bg-parchment hover:bg-stone hover:border-ink/40 text-ink'
                    }`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={uploading ? "animate-pulse" : ""}>
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    <span className="text-sm font-semibold tracking-wide">
                      {uploading ? `Encrypting ${uploadProgress}%...` : 'Choose File'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={uploading || !sessionId}
                    />
                  </label>

                  {/* Progress bar */}
                  {uploading && (
                    <div className="w-full bg-stone rounded-full h-1.5 border border-stone-dark">
                      <div
                        className="bg-ink h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  {/* Status */}
                  {uploadStatus === 'sent' && (
                    <p className="text-xs text-green-700 font-medium">✅ File sent successfully</p>
                  )}
                  {uploadStatus === 'failed' && (
                    <p className="text-xs text-red-700 font-medium">❌ Upload failed, try again</p>
                  )}
                </div>
              )}

              {/* Receive Tab */}
              {activeTab === 'receive' && (
                <>
                  {feed.length === 0 ? (
                    <div className="border border-dashed border-stone-dark rounded-sm py-20 flex flex-col items-center justify-center text-center bg-parchment/60 animate-in fade-in duration-500">
                      <div className="w-12 h-12 rounded-sm border border-stone-dark flex items-center justify-center mb-4 text-ink-faint bg-stone">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </div>
                      <h3 className="text-ink font-semibold mb-1">Awaiting Data</h3>
                      <p className="text-sm text-ink-muted max-w-sm leading-relaxed">
                        Once the other device sends text, links, or files, they will appear here instantly.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {feed.map(item => (
                        <div
                          key={item.id}
                          className="border border-stone-dark bg-parchment rounded-sm p-5 hover:border-ink/20 hover:shadow-sm transition-all animate-in fade-in slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] fill-mode-both"
                        >
                          <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-dark">
                            <Badge variant="outline">
                              {item.type === 'url' ? 'Link' : item.type === 'code' ? 'Code' : item.type === 'fastlane' ? 'FastLane' : 'Text'}
                            </Badge>
                            <span className="text-[11px] text-ink-faint font-mono">{item.time}</span>
                          </div>
                          <div className="bg-stone/50 rounded-sm p-4 border border-stone-dark mb-4 max-h-70 overflow-y-auto">
                            <p className="text-ink text-sm font-mono wrap-break-word leading-relaxed whitespace-pre-wrap">
                              {item.content}
                            </p>
                          </div>
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
                </>
              )}

              {/* Disconnect */}
              <div className="mt-6">
                <Button variant="destructive" size="sm" onClick={handleKill}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full border border-stone-dark bg-parchment rounded-sm p-8 flex flex-col items-center min-h-80 justify-center">
              {status === 'waiting' ? (
                <div className="flex flex-col items-center justify-center gap-5 animate-in fade-in duration-400">
                  <div className="w-20 h-20 border border-stone-dark rounded-sm flex items-center justify-center bg-stone">
                    <svg className="animate-spin text-ink-muted" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-ink font-semibold mb-1">Pairing…</p>
                    <p className="text-sm text-ink-muted">Establishing a secure connection to the other device.</p>
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
                    <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">No Camera? Enter Code</span>
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
                      Pair Devices
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}