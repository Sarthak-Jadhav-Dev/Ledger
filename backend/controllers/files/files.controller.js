// backend/controllers/upload.controller.js
import fs from 'fs'
import path from 'path'

const fileTimers = {}

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const { sessionId } = req.body
    const file = req.file

    const downloadUrl = `${process.env.SERVER_URL}/api/v1/upload/file/${file.filename}`

    const timer = setTimeout(() => {
      deleteFileFromDisk(file.filename)
    }, 5 * 60 * 1000) // 5 min

    // Store timer reference so we can cancel if needed
    fileTimers[file.filename] = timer

    return res.status(200).json({
      success: true,
      data: {
        filename: file.originalname,  // original name for display
        fileKey: file.filename,       // generated name on disk
        downloadUrl,
        size: file.size,
        expiresIn: 300                // seconds
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    })
  }
}

export const downloadFile = (req, res) => {
  const { filename } = req.params
  const filePath = path.join('uploads', filename)

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found or already expired'
    })
  }

  // Send file to browser — triggers download
  res.download(filePath)
}

export const deleteFile = (req, res) => {
  const { fileKey } = req.body

  // Cancel auto delete timer
  if (fileTimers[fileKey]) {
    clearTimeout(fileTimers[fileKey])
    delete fileTimers[fileKey]
  }

  deleteFileFromDisk(fileKey)

  return res.status(200).json({
    success: true,
    message: 'File deleted'
  })
}

const deleteFileFromDisk = (filename) => {
  const filePath = path.join('uploads', filename)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`Deleted: ${filename}`)
  }
  // Clean up timer reference
  delete fileTimers[filename]
}