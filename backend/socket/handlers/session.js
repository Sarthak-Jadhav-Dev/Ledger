import { redisClient } from '../../db/redis.js'
import Session from '../../models/Session.js'

export const handleSession = (io, socket) => {

  socket.on('join-session', async ({ sessionId }) => {
    try {
      // Check Redis session is active
      const raw = await redis.get(`session:${sessionId}`)
      if (!raw) {
        socket.emit('session-error', { code: 'SESSION_EXPIRED' })
        return
      }

      const session = JSON.parse(raw)

      // Join the room
      socket.join(sessionId)
      socket.sessionId = sessionId

      if (socket.isSender) {
        socket.role = 'sender'

        // Update status to paired
        session.status = 'paired'
        const ttl = await redis.ttl(`session:${sessionId}`)
        await redis.setex(`session:${sessionId}`, ttl, JSON.stringify(session))
        await Session.findOneAndUpdate({ sessionId }, { status: 'paired' })

        socket.emit('session-joined', { role: 'sender', mode: session.mode })

        // Notify PC that phone connected
        socket.to(sessionId).emit('phone-connected', { mode: session.mode })

      } else {
        socket.role = 'receiver'
        socket.emit('session-joined', { role: 'receiver', status: session.status })
      }

    } catch (err) {
      socket.emit('session-error', { code: 'SERVER_ERROR', message: err.message })
    }
  })

  socket.on('kill-session', async ({ sessionId }) => {
    await redis.del(`session:${sessionId}`)
    await Session.findOneAndUpdate({ sessionId }, { status: 'ended' })
    io.to(sessionId).emit('session-killed', { reason: 'manual' })
    io.socketsLeave(sessionId)
  })

  socket.on('disconnect', async () => {
    if (!socket.sessionId) return

    if (socket.role === 'sender') {
      socket.to(socket.sessionId).emit('phone-disconnected')
    }

    if (socket.role === 'receiver') {
      await redis.del(`session:${socket.sessionId}`)
      await Session.findOneAndUpdate(
        { sessionId: socket.sessionId },
        { status: 'ended' }
      )
      socket.to(socket.sessionId).emit('session-killed', { reason: 'pc-closed' })
    }
  })
}