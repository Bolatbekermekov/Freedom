import express from 'express'

import { getNotifications, storeNotification } from '../controllers/notification.js'
import { isAuthenticated } from '../middlewares/auth.js'

const router = express.Router()

router.post('/new', isAuthenticated, storeNotification)

router.get('/:token', isAuthenticated, getNotifications)

export default router
