'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

export const useSocket = () => {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [paired, setPaired] = useState(false)
  const [socketReady, setSocketReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')

    const getBackendUrl = () => {
      return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    }

    socketRef.current = io(getBackendUrl(), {
      auth: { token: token || null },
      reconnection: true,
      reconnectionAttempts: 5,
    })

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id)
      setConnected(true)
      setSocketReady(true)
    })

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
      setPaired(false)
    })

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })

    socketRef.current.on('phone-connected', () => setPaired(true))
    socketRef.current.on('phone-disconnected', () => setPaired(false))

    // Mark socket as ready even before connect (for registering listeners)
    setSocketReady(true)

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const joinSession = useCallback((sessionId, role) => {
    console.log('Joining session:', sessionId, 'Socket exists:', !!socketRef.current)
    socketRef.current?.emit('join-session', { sessionId, role })
  }, [])

  const killSession = useCallback((sessionId) => {
    socketRef.current?.emit('kill-session', { sessionId })
  }, [])

  const sendClipboard = useCallback((sessionId, text) => {
    socketRef.current?.emit('send-clipboard', {
      sessionId,
      payload: { data: text, type: detectType(text) }
    })
  }, [])

  const sendFastlaneFile = useCallback((sessionId, fileUrl, filename, size) => {
    socketRef.current?.emit('fastlane-file', { sessionId, fileUrl, filename, size })
  }, [])

  const onSessionJoined = useCallback((cb) => {
    socketRef.current?.on('session-joined', cb)
  }, [])

  const onReceiveClipboard = useCallback((cb) => {
    socketRef.current?.on('receive-clipboard', cb)
  }, [])

  const onSessionKilled = useCallback((cb) => {
    socketRef.current?.on('session-killed', cb)
  }, [])

  const onFastlaneReceive = useCallback((cb) => {
    socketRef.current?.on('fastlane-receive', cb)
  }, [])

  const onSessionError = useCallback((cb) => {
    socketRef.current?.on('session-error', cb)
  }, [])

  const onFastlaneFileReady = useCallback((cb) => {
    socketRef.current?.on('fastlane-file-ready', cb)
  }, [])

  const detectType = (text) => {
    if (text.startsWith('http')) return 'url'
    if (text.includes('  ') || text.includes('\n')) return 'code'
    return 'text'
  }

  return {
    socket: socketRef.current,
    socketReady,
    connected,
    paired,
    joinSession,
    killSession,
    sendClipboard,
    sendFastlaneFile,
    onSessionJoined,
    onReceiveClipboard,
    onSessionKilled,
    onFastlaneReceive,
    onFastlaneFileReady,
    onSessionError,
  }
}