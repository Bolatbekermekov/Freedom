import express from 'express'

import { adminCategoriesController } from '../../controllers/admin/admin-categories.controller.js'
import { hasRoles, isAuthenticated } from '../../middlewares/auth.js'
import { singleUpload } from '../../middlewares/multer.js'

export const adminCategoriesRouter = express.Router()

adminCategoriesRouter.get(
	'/',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminCategoriesController.getAllCategories,
)

adminCategoriesRouter.post(
	'/',
	isAuthenticated,
	hasRoles('superadmin'),
	singleUpload,
	adminCategoriesController.createCategory,
)

adminCategoriesRouter.get(
	'/:id',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminCategoriesController.getCategoryDetails,
)

adminCategoriesRouter.put(
	'/:id',
	isAuthenticated,
	hasRoles('superadmin'),
	adminCategoriesController.updateCategory,
)
