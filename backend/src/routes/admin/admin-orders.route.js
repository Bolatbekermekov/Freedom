import express from 'express'

import { adminOrdersController } from '../../controllers/admin/admin-orders.controller.js'
import { hasRoles, isAuthenticated } from '../../middlewares/auth.js'

export const adminOrderRouter = express.Router()

adminOrderRouter.post(
	'/:id/payment',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminOrdersController.processPayment,
)

adminOrderRouter.post(
	'',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminOrdersController.createOrder,
)

adminOrderRouter.get(
	'/',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminOrdersController.getOrders,
)

adminOrderRouter.get(
	'/:id',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminOrdersController.getOrderDetails,
)

adminOrderRouter.post(
	'/:id/assignee',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminOrdersController.assignUserToOrder,
)

adminOrderRouter.put(
	'/:id',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminOrdersController.updateOrder,
)
