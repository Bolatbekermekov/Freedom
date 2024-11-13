import express from 'express'

import {
	createShippingInfo,
	deleteSingleShippingInfo,
	getAllShippingInfo,
	myShippingInfos,
	setDefaultShippingInfo,
	updateSingleShippingInfo,
} from '../../controllers/v1/shipping_info.js'
import { isAdmin, isAuthenticated } from '../../middlewares/auth.js'

const router = express.Router()

router.post('/new', isAuthenticated, createShippingInfo)

router.get('/my', isAuthenticated, myShippingInfos)
router.get('/admin/:user', isAuthenticated, isAdmin, getAllShippingInfo)
router.get('/set-default/:id', isAuthenticated, setDefaultShippingInfo)

router
	.route('/single/:id')
	.delete(isAuthenticated, deleteSingleShippingInfo)
	.get(isAuthenticated, getAllShippingInfo)
	.put(isAuthenticated, updateSingleShippingInfo)

export default router
