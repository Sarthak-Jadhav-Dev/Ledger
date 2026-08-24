export const handleFastlane = (io, socket) => {
  socket.on('fastlane-clipboard', ({ sessionId, payload }) => {
    socket.to(sessionId).emit('fastlane-receive', {
      payload,
      timestamp: Date.now()
    })
  })

  socket.on('fastlane-file', ({ sessionId, fileUrl, filename, size }) => {
    socket.to(sessionId).emit('fastlane-file-ready', {
      fileUrl,
      filename,
      size,
      timestamp: Date.now()
    })
  })
}