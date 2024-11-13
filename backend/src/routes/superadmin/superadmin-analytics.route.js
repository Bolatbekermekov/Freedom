import express from 'express'

import { superAdminAnalyticController } from '../../controllers/superadmin/superadmin-analytics.controller.js'
import { hasRoles, isAuthenticated } from '../../middlewares/auth.js'
import { ROLES } from '../../models/user.js'

export const superAdminAnalyticsRouter = express.Router()

superAdminAnalyticsRouter.get(
	'/stores/:id/avg-daily-sales',
	isAuthenticated,
	hasRoles(ROLES.SUPER_ADMIN),
	superAdminAnalyticController.getAverageDailySalesForCurrentMonth,
)

superAdminAnalyticsRouter.get(
	'/stores/:id/sales-by-period',
	isAuthenticated,
	hasRoles(ROLES.SUPER_ADMIN),
	superAdminAnalyticController.getSalesByPeriodType,
)

superAdminAnalyticsRouter.get(
	'/stores/:id/total-orders',
	isAuthenticated,
	hasRoles(ROLES.SUPER_ADMIN),
	superAdminAnalyticController.getTotalOrdersForCurrentMonth,
)

superAdminAnalyticsRouter.get(
	'/stores/:id/statistics',
	isAuthenticated,
	hasRoles(ROLES.SUPER_ADMIN),
	superAdminAnalyticController.getStoresStatistics,
)

superAdminAnalyticsRouter.get(
	'/stores/:id/total-sales',
	isAuthenticated,
	hasRoles(ROLES.SUPER_ADMIN),
	superAdminAnalyticController.getTotalSalesForCurrentMonth,
)

superAdminAnalyticsRouter.get(
	'/platform/statistics',
	isAuthenticated,
	hasRoles(ROLES.SUPER_ADMIN),
	superAdminAnalyticController.getPlatformStatistics,
)

superAdminAnalyticsRouter.get(
	'/platform/registered-users-by-month',
	isAuthenticated,
	hasRoles(ROLES.SUPER_ADMIN),
	superAdminAnalyticController.getRegisteredUsersByMonth,
)

superAdminAnalyticsRouter.get(
	'/platform/created-orders-by-month',
	isAuthenticated,
	hasRoles(ROLES.SUPER_ADMIN),
	superAdminAnalyticController.getCreatedOrdersByMonth,
)

superAdminAnalyticsRouter.get(
	'/platform/completed-orders-by-month',
	isAuthenticated,
	hasRoles(ROLES.SUPER_ADMIN),
	superAdminAnalyticController.getCompletedOrdersByMonth,
)
