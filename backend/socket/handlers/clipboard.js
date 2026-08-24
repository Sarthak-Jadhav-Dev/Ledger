export const handleClipboard = (io, socket) => {
  socket.on('send-clipboard', ({ sessionId, payload }) => {
    // Pure relay — server never reads payload (its encrypted)
    socket.to(sessionId).emit('receive-clipboard', {
      payload,
      timestamp: Date.now()
    })
  })
}