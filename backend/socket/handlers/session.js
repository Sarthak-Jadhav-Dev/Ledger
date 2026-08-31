import redisConnect from '../../db/redis.js'
import {Session} from '../../models/session.models.js'

export const handleSession = (io, socket) => {
  socket.on('join-session', async ({ sessionId, role }) => {
    try {
      // Check Redis session is active
      const raw = await redisConnect.get(`session:${sessionId}`)
      if (!raw) {
        socket.emit('session-error', { code: 'SESSION_EXPIRED' })
        return
      }
      const session = typeof raw === 'string' ? JSON.parse(raw) : raw
      // Join the room
      socket.join(sessionId)
      socket.sessionId = sessionId

      if (role === 'sender') {
        socket.role = 'sender'

        // Update status to paired
        session.status = 'paired'
        const ttl = await redisConnect.ttl(`session:${sessionId}`)
        if (ttl > 0) {
          await redisConnect.set(`session:${sessionId}`, JSON.stringify(session), { ex: ttl })
        } else {
          await redisConnect.set(`session:${sessionId}`, JSON.stringify(session))
        }
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
    await redisConnect.del(`session:${sessionId}`)
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
      await redisConnect.del(`session:${socket.sessionId}`)
      await Session.findOneAndUpdate(
        { sessionId: socket.sessionId },
        { status: 'ended' }
      )
      socket.to(socket.sessionId).emit('session-killed', { reason: 'pc-closed' })
    }
  })
}