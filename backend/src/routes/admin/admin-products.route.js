import express from 'express'

import { adminProductsController } from '../../controllers/admin/admin-products.controller.js'
import { hasRoles, isAuthenticated } from '../../middlewares/auth.js'
import { anyUpload, singleUpload } from '../../middlewares/multer.js'

export const adminProductRouter = express.Router()

adminProductRouter.get(
	'/',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminProductsController.getAllProducts,
)

adminProductRouter.post(
	'/upload',
	isAuthenticated,
	hasRoles('superadmin'),
	anyUpload,
	adminProductsController.uploadMultipleProducts,
)

adminProductRouter.post(
	'/',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	singleUpload,
	adminProductsController.createProduct,
)

adminProductRouter.post(
	'/generate-barcode',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminProductsController.generateBarcode,
)

adminProductRouter.get(
	'/:id',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminProductsController.getProductDetails,
)

adminProductRouter.get(
	'/barcode/:barcode',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminProductsController.getProductByBarcode,
)

adminProductRouter.put(
	'/:id',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	singleUpload,
	adminProductsController.updateProduct,
)

adminProductRouter.post(
	'/images/:id',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	singleUpload,
	adminProductsController.addProductImage,
)

adminProductRouter.delete(
	'/images/:id',
	isAuthenticated,
	hasRoles('superadmin', 'admin'),
	adminProductsController.deleteProductImage,
)
