import express from 'express'

import {
	createShippingInfo,
	deleteSingleShippingInfo,
	getAllCities,
	getAllShippingInfo,
	getShippingInfoById,
	myShippingInfos,
	setDefaultShippingInfo,
	updateSingleShippingInfo,
} from '../controllers/shipping_info.js'
import { isAdmin, isAuthenticated } from '../middlewares/auth.js'

const router = express.Router()

router.post('/new', isAuthenticated, createShippingInfo)

router.get('/my', isAuthenticated, myShippingInfos)
router.get('/cities', isAuthenticated, getAllCities)
router.get('/admin/:user', isAuthenticated, isAdmin, getAllShippingInfo)
router.put('/set-default/:id', isAuthenticated, setDefaultShippingInfo)

router
	.route('/single/:id')
	.delete(isAuthenticated, deleteSingleShippingInfo)
	.get(isAuthenticated, getShippingInfoById)
	.put(isAuthenticated, updateSingleShippingInfo)

export default router
