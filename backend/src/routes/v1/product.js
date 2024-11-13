import express from 'express'

import {
	addCategory,
	addProductImage,
	addSection,
	createProduct,
	deleteCategory,
	deleteProduct,
	deleteProductImage,
	deleteSection,
	getAdminProducts,
	getAllCategories,
	getAllProducts,
	getAllSections,
	getProductDetails,
	getProductsByName,
	getRecentProducts,
	getSectionCategories,
	updateProduct,
} from '../../controllers/v1/product.js'
import { getUserInfo, isAdmin, isAuthenticated } from '../../middlewares/auth.js'
import { singleUpload } from '../../middlewares/multer.js'

const router = express.Router()

router.get('/all', getUserInfo, getAllProducts)
router.get('/admin', isAuthenticated, isAdmin, getAdminProducts)

router.get('/name/:id', getUserInfo, getProductsByName)

router
	.route('/single/:id')
	.get(getProductDetails)
	.put(isAuthenticated, isAdmin, updateProduct)
	.delete(isAuthenticated, isAdmin, deleteProduct)

router.get('/recent', isAuthenticated, getRecentProducts)
// router.post("/new", isAuthenticated, isAdmin, upload, createProduct);
router.post('/new', isAuthenticated, isAdmin, singleUpload, createProduct)

router
	.route('/images/:id')
	.post(isAuthenticated, isAdmin, singleUpload, addProductImage)
	.delete(isAuthenticated, isAdmin, deleteProductImage)

router.post('/section', addSection)
// router.post("/section", isAuthenticated, isAdmin, addSection);
router.get('/sections', getAllSections)
router.delete('/section/:id', isAuthenticated, isAdmin, deleteSection)
router.get('/section/:id', getSectionCategories)

router.post('/category', isAuthenticated, isAdmin, addCategory)
router.get('/categories', getAllCategories)
router.delete('/category/:id', isAuthenticated, isAdmin, deleteCategory)

export default router
