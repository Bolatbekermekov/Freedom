import express from 'express'

import { adminPromotionController } from '../../controllers/admin/admin-promotion.controller.js'
import { getAllCities } from '../../controllers/shipping_info.js'
import { hasRoles, isAuthenticated } from '../../middlewares/auth.js'

export const adminPromotionRouter = express.Router()

adminPromotionRouter.get(
	'/',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminPromotionController.getCompanyPromotions,
)

adminPromotionRouter.get('/cities', isAuthenticated, hasRoles('superadmin', 'admin'), getAllCities)

adminPromotionRouter.get(
	'/:promoId',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminPromotionController.getPromotionDetails,
)

adminPromotionRouter.post(
	'/',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminPromotionController.generatePromotionCode,
)

adminPromotionRouter.put(
	'/:promoId',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminPromotionController.updatePromotion,
)

adminPromotionRouter.delete(
	'/:promoId',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminPromotionController.deletePromotion,
)
