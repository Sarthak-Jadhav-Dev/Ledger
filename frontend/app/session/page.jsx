'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useSocket } from '../hooks/useSocket'
import { uploadFile } from '../../lib/upload'
import { safeDownload } from '../../lib/download'
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

  const { joinSession, killSession, sendClipboard, sendFastlaneFile, paired, onSessionJoined, onSessionKilled, onSessionError, onReceiveClipboard, onFastlaneReceive, onFastlaneFileReady, connected, socketReady, socket } = useSocket()

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

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
    onFastlaneFileReady(({ fileUrl, filename, size }) => {
      addToFeed('file', { url: fileUrl, filename, size: formatSize(size) })
      // Auto trigger browser download (blob-based to avoid cross-origin page navigation)
      safeDownload(fileUrl, filename)
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
        videoConstraints: {
          facingMode: { ideal: "environment" }
        },
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
          <div className="text-center mb-10 w-full animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="font-display text-4xl md:text-5xl font-bold italic text-ink mb-3 tracking-tight">Scan QR</h1>
            <p className="text-ink-muted text-base max-w-md mx-auto">Scan a QR code or enter a session ID to establish a secure, encrypted link.</p>
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
          <div className="w-full glass-card glass-card-float rounded-2xl p-6 md:p-10 relative overflow-hidden shadow-2xl z-20 mx-auto max-w-3xl">
            {status === 'paired' ? (
              <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-8 px-6 py-5 border border-green-800/20 bg-green-900/5 rounded-xl backdrop-blur-sm shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-green-500/10 to-transparent opacity-50" />
                  <div className="flex items-center gap-4 relative z-10">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60 animate-ping" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600 shadow-[0_0_10px_rgba(22,163,74,0.6)]" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink tracking-wide">Secure Connection Active</p>
                      <p className="text-[10px] text-ink-faint uppercase tracking-widest mt-0.5">End-to-End Encrypted</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="font-mono font-bold text-xl tracking-[0.2em] text-ink">{sessionId}</p>
                    <p className="text-[10px] text-ink-faint uppercase tracking-widest mt-0.5">Session ID</p>
                  </div>
                </div>

                {/* Tab Switcher - Pill Style */}
                <div className="flex p-1 bg-stone/50 backdrop-blur-md border border-stone-dark/50 rounded-full mb-8 shadow-inner relative z-10">
                  <button
                    onClick={() => setActiveTab('send')}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 rounded-full flex items-center justify-center gap-2 ${
                      activeTab === 'send'
                        ? 'bg-ink text-parchment shadow-md scale-[1.02]'
                        : 'text-ink-muted hover:text-ink hover:bg-stone-dark/20'
                    }`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Send Data
                  </button>
                  <button
                    onClick={() => setActiveTab('receive')}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 rounded-full flex items-center justify-center gap-2 ${
                      activeTab === 'receive'
                        ? 'bg-ink text-parchment shadow-md scale-[1.02]'
                        : 'text-ink-muted hover:text-ink hover:bg-stone-dark/20'
                    }`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Incoming
                    {feed.length > 0 && (
                      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-parchment text-ink text-[10px] font-bold">
                        {feed.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Send Tab */}
                {activeTab === 'send' && (
                  <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative group">
                      <Textarea
                        value={textToSend}
                        onChange={(e) => setTextToSend(e.target.value)}
                        placeholder="Type or paste text to securely transmit…"
                        className="h-40 font-mono text-sm resize-none bg-parchment-dark/50 border-stone-dark/60 focus:bg-parchment transition-all duration-300 shadow-inner rounded-xl p-4"
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <Button
                          size="sm"
                          className="rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                          onClick={() => {
                            if (textToSend.trim() && sessionId) {
                              sendClipboard(sessionId, textToSend)
                              setTextToSend('')
                            }
                          }}
                          disabled={!textToSend.trim()}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                          Transmit
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px flex-1 bg-linear-to-r from-transparent via-stone-dark to-transparent opacity-50" />
                      <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">Or Send a File</span>
                      <div className="h-px flex-1 bg-linear-to-r from-transparent via-stone-dark to-transparent opacity-50" />
                    </div>

                    {/* File Upload Dropzone */}
                    <label className={`relative flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                      uploading
                        ? 'border-ink/20 bg-stone/40 cursor-wait'
                        : 'border-stone-dark bg-stone/20 hover:bg-stone/40 hover:border-ink/40 group'
                    }`}>
                      {uploading && (
                        <div 
                          className="absolute bottom-0 left-0 h-1 bg-ink transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      )}
                      
                      <div className={`p-4 rounded-full ${uploading ? 'bg-ink/5 text-ink' : 'bg-parchment text-ink-muted group-hover:text-ink group-hover:scale-110'} transition-all duration-300 shadow-sm`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={uploading ? "animate-pulse" : ""}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-bold text-ink tracking-wide mb-1">
                          {uploading ? `Encrypting & Sending ${uploadProgress}%` : 'Click to select a file'}
                        </p>
                        <p className="text-xs text-ink-faint">
                          {uploading ? 'Please wait, do not close this page.' : 'Maximum file size: 50MB. Sent via secure FastLane.'}
                        </p>
                      </div>
                      
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading || !sessionId}
                      />
                    </label>

                    {/* Status */}
                    {uploadStatus === 'sent' && (
                      <div className="flex items-center justify-center gap-2 text-sm text-green-700 font-bold bg-green-50/50 border border-green-200 py-3 rounded-lg animate-in zoom-in-95">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Transmission Complete
                      </div>
                    )}
                    {uploadStatus === 'failed' && (
                      <div className="flex items-center justify-center gap-2 text-sm text-red-700 font-bold bg-red-50/50 border border-red-200 py-3 rounded-lg animate-in zoom-in-95">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Transmission Failed
                      </div>
                    )}
                  </div>
                )}

                {/* Receive Tab */}
                {activeTab === 'receive' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {feed.length === 0 ? (
                      <div className="border-2 border-dashed border-stone-dark/50 rounded-xl py-24 flex flex-col items-center justify-center text-center bg-stone/10">
                        <div className="relative">
                          <div className="absolute inset-0 bg-ink rounded-full blur-xl opacity-5 animate-pulse" />
                          <div className="w-16 h-16 rounded-full border border-stone-dark flex items-center justify-center mb-6 text-ink-muted bg-parchment relative z-10 shadow-sm">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                          </div>
                        </div>
                        <h3 className="text-ink font-display text-xl font-bold italic mb-2">Secure Line Open</h3>
                        <p className="text-sm text-ink-muted max-w-sm leading-relaxed px-4">
                          Waiting for incoming transmissions. Text, links, and files will appear here instantly.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {feed.map(item => (
                          <div
                            key={item.id}
                            className="glass-card hover-spotlight rounded-xl p-5 hover:border-ink/30 transition-all animate-in fade-in slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] fill-mode-both group relative overflow-hidden"
                          >
                            <div className={`absolute top-0 left-0 w-1 h-full opacity-70 ${
                              item.type === 'url' ? 'bg-blue-600' : 
                              item.type === 'file' || item.type === 'fastlane' ? 'bg-green-600' : 
                              item.type === 'code' ? 'bg-amber-600' : 'bg-ink'
                            }`} />
                            
                            <div className="flex items-center justify-between mb-4 pl-3">
                              <Badge variant="outline" className="font-mono text-[10px] tracking-wider uppercase bg-parchment/80 border-stone-dark/50">
                                {item.type === 'url' ? 'Link' : item.type === 'code' ? 'Code snippet' : item.type === 'fastlane' ? 'File Metadata' : 'Text message'}
                              </Badge>
                              <span className="text-[11px] text-ink-faint font-mono">{item.time}</span>
                            </div>
                            
                            <div className="bg-stone/30 rounded-lg p-4 border border-stone-dark/40 mb-4 max-h-75 overflow-y-auto pl-4 ml-2 shadow-inner">
                              <p className="text-ink text-sm font-mono wrap-break-word leading-relaxed whitespace-pre-wrap">
                                {item.content}
                              </p>
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(item.content)} className="gap-2 rounded-full border-stone-dark/50 hover:bg-stone/50">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Copy
                              </Button>
                              {item.type === 'url' && (
                                <Button size="sm" onClick={() => openUrl(item.content)} className="gap-2 rounded-full shadow-sm hover:shadow-md transition-all">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                  Open
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Disconnect */}
                <div className="mt-8 flex justify-center border-t border-stone-dark/30 pt-6">
                  <Button variant="ghost" size="sm" onClick={handleKill} className="text-red-700 hover:text-red-800 hover:bg-red-50/50">
                    Close Secure Connection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center min-h-87.5">
                {status === 'waiting' ? (
                  <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500 relative">
                    <div className="absolute inset-0 bg-ink rounded-full animate-radar-pulse" />
                    <div className="w-24 h-24 border border-stone-dark rounded-full flex items-center justify-center bg-parchment relative z-10 shadow-lg">
                      <svg className="animate-spin text-ink" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                    <div className="text-center relative z-10">
                      <p className="text-ink font-display text-xl font-bold italic mb-2">Establishing Link…</p>
                      <p className="text-sm text-ink-muted px-4">Negotiating end-to-end encryption with the target device.</p>
                    </div>
                  </div>
                ) : showScanner ? (
                  <div className="w-full flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-2">
                      <h3 className="font-bold text-ink mb-1 uppercase tracking-widest text-sm">Align QR Code</h3>
                      <p className="text-xs text-ink-muted">Hold your camera steady over the code.</p>
                    </div>
                    
                    <div className="scanner-reticle p-1">
                      <div className="scanner-reticle-inner p-1">
                        <div id="reader" className="w-full max-w-70 md:max-w-sm rounded-lg overflow-hidden border border-stone-dark/30 shadow-inner bg-black" />
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={() => setShowScanner(false)} className="rounded-full mt-4">
                      Cancel Scanning
                    </Button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500 max-w-sm mx-auto">
                    <Button
                      size="xl"
                      className="w-full gap-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                      onClick={() => setShowScanner(true)}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:rotate-12 transition-transform duration-300">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <rect x="7" y="7" width="10" height="10" rx="1" />
                      </svg>
                      <span className="relative z-10 font-bold tracking-wide">Launch Scanner</span>
                    </Button>

                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px flex-1 bg-linear-to-r from-transparent via-stone-dark to-transparent opacity-50" />
                      <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">Manual Entry</span>
                      <div className="h-px flex-1 bg-linear-to-r from-transparent via-stone-dark to-transparent opacity-50" />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="relative group">
                        <Input
                          placeholder="e.g. A3F8B2"
                          value={sessionId}
                          onChange={e => setSessionId(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && handleJoin()}
                          maxLength={8}
                          className="h-14 text-center font-mono text-xl tracking-[0.2em] bg-stone/20 border-stone-dark/50 focus:bg-parchment focus:border-ink focus:ring-1 focus:ring-ink transition-all rounded-xl"
                        />
                        <div className="absolute inset-0 rounded-xl ring-2 ring-ink/5 pointer-events-none group-hover:ring-ink/10 transition-all" />
                      </div>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full rounded-xl border-stone-dark/50 hover:bg-stone/50 transition-all duration-300"
                        onClick={handleJoin}
                        disabled={!connected || !sessionId.trim()}
                      >
                        Connect via ID
                      </Button>
                    </div>
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