import express from 'express'

import { adminSubCategoriesController } from '../../controllers/admin/admin-subcategories.controller.js'
import { hasRoles, isAuthenticated } from '../../middlewares/auth.js'
import { singleUpload } from '../../middlewares/multer.js'

export const adminSubCategoriesRouter = express.Router()

adminSubCategoriesRouter.get(
	'/',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminSubCategoriesController.getAllSubCategories,
)

adminSubCategoriesRouter.post(
	'/',
	isAuthenticated,
	hasRoles('superadmin'),
	singleUpload,
	adminSubCategoriesController.createSubCategory,
)

adminSubCategoriesRouter.get(
	'/:id',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminSubCategoriesController.getSubCategoryDetails,
)

adminSubCategoriesRouter.put(
	'/:id',
	isAuthenticated,
	hasRoles('superadmin'),
	adminSubCategoriesController.updateSubCategory,
)
