import jwt from 'jsonwebtoken'

export const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      socket.isSender = false
      socket.isReceiver = true
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    socket.isSender = true
    socket.isReceiver = false

    return next()

  } catch (error) {
    return next(new Error('AUTH_FAILED'))
  }
}