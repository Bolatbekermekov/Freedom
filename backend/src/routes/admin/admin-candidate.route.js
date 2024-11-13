import express from 'express'

import { uploadResumes } from '../../controllers/admin/admin-candidates.js'
import { isAdmin, isAuthenticated } from '../../middlewares/auth.js'
import { multipleUpload } from '../../middlewares/multer.js'

export const adminResumeRouter = express.Router()

// POST /api/v2/admin/resume/upload-resume - маршрут для загрузки и анализа резюме
adminResumeRouter.post('/upload-resume', isAuthenticated, isAdmin, multipleUpload, uploadResumes)
