import express from 'express'

import { orderReceiptController } from '../controllers/order-receipt.controller.js'
import { isAuthenticated } from '../middlewares/auth.js'

export const orderReceiptRouter = express.Router()

orderReceiptRouter.get('/:orderId/pdf', orderReceiptController.getOrderReceiptPDF)
orderReceiptRouter.post('/', isAuthenticated, orderReceiptController.createReview)
orderReceiptRouter.get('/:orderId', isAuthenticated, orderReceiptController.getReviewByOrderId)
orderReceiptRouter.post('/:orderId/approve', isAuthenticated, orderReceiptController.approveReview)
orderReceiptRouter.post('/:orderId/reject', isAuthenticated, orderReceiptController.rejectReview)
orderReceiptRouter.put('/:orderId', isAuthenticated, orderReceiptController.updateReview)
