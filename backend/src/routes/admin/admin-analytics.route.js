import express from 'express'

import { adminAnalyticsController } from '../../controllers/admin/admin-analytics.controller.js'
import { hasRoles, isAuthenticated } from '../../middlewares/auth.js'

export const adminAnalyticsRouter = express.Router()

adminAnalyticsRouter.get(
	'/total',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminAnalyticsController.getTotals,
)

adminAnalyticsRouter.get(
	'/superadmin/total',
	isAuthenticated,
	hasRoles('superadmin'),
	adminAnalyticsController.getSuperAdminTotals,
)

adminAnalyticsRouter.get(
	'/sales-by-period',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminAnalyticsController.getSalesByPeriod,
)

adminAnalyticsRouter.get(
	'/orders-by-assignees',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminAnalyticsController.getAssignedUsersWithOrders,
)

adminAnalyticsRouter.get(
	'/orders-by-statuses',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminAnalyticsController.getOrdersByStatus,
)
