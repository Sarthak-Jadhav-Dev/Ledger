import api from './axios'

export const uploadFile = async (file, sessionId, onProgress) => {
  // Use FormData to send file
  const formData = new FormData()
  formData.append('file', file)
  formData.append('sessionId', sessionId)

  const res = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percent)
      }
    }
  })

  return res.data.data
  // returns { filename, fileKey, downloadUrl, size, expiresIn }
}