import express from 'express'

import {
	applyPromocode,
	deletePromotion,
	generatePromotionCode,
	getCompanyPromotions,
	getPromotionsByCity,
	updatePromotion,
} from '../controllers/promotion.js'
import { hasRoles, isAdmin, isAuthenticated } from '../middlewares/auth.js'

const router = express.Router()

router.post('/applyPromocode', isAuthenticated, applyPromocode)

router.post('/generate', isAuthenticated, hasRoles('admin', 'superadmin'), generatePromotionCode)

router.get('/', isAuthenticated, isAdmin, getCompanyPromotions)
router.get('/one', isAuthenticated, getPromotionsByCity)

router.put('/:promoId', isAuthenticated, isAdmin, updatePromotion)

router.delete('/:promoId', isAuthenticated, isAdmin, deletePromotion)

export default router
