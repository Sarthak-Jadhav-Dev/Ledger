import { Server } from 'socket.io'
import { socketAuth } from '../middleware/socketAuth.middleware.js'
import { handleSession } from './handlers/session.js'
import { handleClipboard } from './handlers/clipboard.js'
import { handleFastlane } from './handlers/fastlane.js'

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // JWT middleware — runs before every connection
  io.use(socketAuth)

  io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id} | Role: ${socket.isSender ? 'Sender' : 'Receiver'}`)

    handleSession(io, socket)
    handleClipboard(io, socket)
    handleFastlane(io, socket)

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.id}`)
    })
  })

  return io
}