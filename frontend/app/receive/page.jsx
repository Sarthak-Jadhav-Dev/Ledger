'use client'
import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import axoisInstance from '../helpers/axios'
import { useSocket } from '../hooks/useSocket'
import { uploadFile } from '../../lib/upload'
import { safeDownload } from '../../lib/download'
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

export default function DisplayPage() {
  const [sessionId, setSessionId] = useState('')
  const [session, setSession] = useState(null)
  const [joined, setJoined] = useState(false)
  const [phonePaired, setPhonePaired] = useState(false)
  const [feed, setFeed] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Bidirectional: sending state
  const [textToSend, setTextToSend] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [activeTab, setActiveTab] = useState('receive') // 'receive' | 'send'

  const {
    joinSession,
    sendClipboard,
    sendFastlaneFile,
    onSessionJoined,
    onReceiveClipboard,
    onSessionKilled,
    onFastlaneReceive,
    onFastlaneFileReady,
    onSessionError,
    socket,
    socketReady,
    connected
  } = useSocket()

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

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

  useEffect(() => {
    if (session?.session_id && connected) {
      joinSession(session.session_id, 'receiver')
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

    onFastlaneFileReady(({ fileUrl, filename, size }) => {
      addToFeed('file', {
        url: fileUrl,
        filename,
        size: formatSize(size)
      })
      // Auto trigger browser download (blob-based to avoid cross-origin page navigation)
      safeDownload(fileUrl, filename)
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
    joinSession(sessionId.trim().toUpperCase(), 'receiver')
  }

  const copyToClipboard = (text) => navigator.clipboard.writeText(text)
  const openUrl = (url) => window.open(url, '_blank')

  const qrValue = session
    ? JSON.stringify({ session_id: session.session_id, encryption_key: session.encryption_key })
    : ''

  const appLinkValue = `${APP_URL}/session?action=scan`

  // Bidirectional: file upload handler
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

      sendFastlaneFile(sessionId, data.downloadUrl, data.filename, data.size)
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

        <div className="flex-1 px-6 pt-28 pb-20 z-10 relative">
          <div className="max-w-4xl mx-auto w-full">

            {/* Header */}
            <div className="mb-10">
              <h1 className="font-display text-3xl font-bold italic text-ink mb-1">Display QR</h1>
              <p className="text-ink-muted text-sm">Show your QR code for the other device to scan and pair.</p>
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
                      Scan with your phone's camera to open the Scan page.
                    </p>
                    <div className="relative overflow-hidden p-4 rounded-sm bg-white border border-stone-dark shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-ink/30 shadow-[0_0_10px_rgba(26,20,16,0.3)] animate-scan" />
                      <QRCodeSVG value={appLinkValue} size={180} level="Q" includeMargin={false} fgColor="#1a1410" />
                    </div>
                  </div>

                  {/* QR 2 — Session Connect */}
                  <div className="border border-stone-dark bg-parchment rounded-sm p-8 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-ink mb-1 uppercase tracking-widest">2. Pair Devices</h3>
                    <p className="text-xs text-ink-muted text-center mb-6 leading-relaxed">
                      Scan this code with the app's scanner to securely pair.
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
                      <p className="text-sm font-bold text-ink">{phonePaired ? 'Device Paired' : 'Awaiting Device'}</p>
                      <p className="text-[10px] text-ink-faint uppercase tracking-widest">Connection Status</p>
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
                    onClick={() => setActiveTab('receive')}
                    className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'receive'
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
                  <button
                    onClick={() => setActiveTab('send')}
                    className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'send'
                        ? 'bg-ink text-parchment'
                        : 'bg-parchment text-ink-muted hover:bg-stone'
                      }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Send
                  </button>
                </div>

                {/* Receive Tab */}
                {activeTab === 'receive' && (
                  <>
                    {feed.length === 0 ? (
                      <div className="border border-dashed border-stone-dark rounded-sm py-20 flex flex-col items-center justify-center text-center bg-parchment/60 animate-in fade-in duration-500">
                        <div className="w-12 h-12 rounded-sm border border-stone-dark flex items-center justify-center mb-4 text-ink-faint bg-stone">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <h3 className="text-ink font-semibold mb-1">Awaiting Data</h3>
                        <p className="text-sm text-ink-muted max-w-sm leading-relaxed">
                          Once the other device transmits text, links, or files, they will appear here instantly.
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
                  </>
                )}

                {/* Send Tab */}
                {activeTab === 'send' && (
                  <div className="flex flex-col gap-5 animate-in fade-in duration-400">
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
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}