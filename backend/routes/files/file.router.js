import express from 'express'
import { uploadFile, downloadFile, deleteFile } from '../../controllers/files/files.controller.js'
import { verifyJWT } from '../../middleware/auth.middleware.js'
import { upload } from '../../helpers/multer.helpers.js'

const FileRouter = express.Router()

// Upload — only logged in users
FileRouter.post('/', verifyJWT, upload.single('file'), uploadFile)

// Download — NO auth needed
// College PC has no login, must be able to download
FileRouter.get('/file/:filename', downloadFile)

// Delete — only logged in users
FileRouter.delete('/', verifyJWT, deleteFile)

export default FileRouter