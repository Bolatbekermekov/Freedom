import express from 'express'

import { adminUsersController } from '../../controllers/admin/admin-users.controller.js'
import { hasRoles, isAuthenticated } from '../../middlewares/auth.js'

export const adminUsersRouter = express.Router()

adminUsersRouter.get(
	'/company',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminUsersController.getAllCompanyMembers,
)

adminUsersRouter.post(
	'/company',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminUsersController.addCompanyMember,
)

adminUsersRouter.get('/', isAuthenticated, hasRoles('superadmin'), adminUsersController.getAllUsers)

adminUsersRouter.post('/', isAuthenticated, hasRoles('superadmin'), adminUsersController.addUser)

adminUsersRouter.post('/signup', adminUsersController.signup)

adminUsersRouter.post('/login', adminUsersController.login)
