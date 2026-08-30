import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

const uploadDir = 'uploads/'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Never use original filename — security risk
    // Generate random name, keep extension
    const ext = path.extname(file.originalname)
    const uniqueName = `${uuidv4()}${ext}`
    cb(null, uniqueName)
  }
})

// File size limit — 50MB maz
const limits = { fileSize: 50 * 1024 * 1024 }

export const upload = multer({ storage, limits })