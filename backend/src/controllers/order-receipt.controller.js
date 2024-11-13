import LocalizedError from '../errors/localized-error.js'
import { localizedErrorMessages } from '../errors/localized-messages.js'
import { Order } from '../models/order.js'
import { PushToken, User } from '../models/user.js'
import { orderReceiptReviewService } from '../services/order-receipt-review.service.js'
import ErrorHandler from '../utils/error.js'
import { sendReviewApprovedNotification } from '../utils/features.js'
import { logger } from '../utils/logger.utils.js'

class OrderReceiptController {
	async createReview(req, res, next) {
		const { orderId, userId, comment } = req.body

		if (!orderId || !userId || !comment) {
			return next(new ErrorHandler('Missing required fields', 400))
		}

		try {
			const newReview = await orderReceiptReviewService.createReview(orderId, userId, comment)

			return res.status(201).json(newReview)
		} catch (error) {
			logger.error('Error while creating review', error)
			return next(new ErrorHandler(error.message, 500))
		}
	}

	async getReviewByOrderId(req, res, next) {
		const { orderId } = req.params

		if (!orderId) {
			return next(new ErrorHandler('Missing orderId', 400))
		}

		try {
			const review = await orderReceiptReviewService.getReviewByOrderIdPopulated(orderId)

			if (!review) {
				return res.status(404).json({ error: 'Review not found' })
			}

			return res.status(200).json(review)
		} catch (error) {
			logger.error('Error while fetching review', error)
			return next(new ErrorHandler(error.message, 500))
		}
	}

	async updateReview(req, res, next) {
		const { orderId } = req.params
		const updatedReview = req.body

		if (!orderId) {
			return next(new ErrorHandler('Missing required fields', 400))
		}

		try {
			const review = await orderReceiptReviewService.updateReview(orderId, updatedReview)

			if (!review) {
				return res.status(404).json({ error: 'Review not found' })
			}

			return res.status(200).json(review)
		} catch (error) {
			logger.error('Error while updating review', error)
			return next(new ErrorHandler(error.message, 500))
		}
	}

	async rejectReview(req, res, next) {
		const { orderId } = req.params
		const { comment } = req.body
		const user = req.user

		if (!orderId || !user || !comment) {
			return next(new ErrorHandler('Missing required fields', 400))
		}

		try {
			const result = await orderReceiptReviewService.rejectReview(orderId, user.id, comment)
			const orderDetails = await this.getOrderDetails(orderId)

			await sendReviewApprovedNotification(
				orderDetails.customerName,
				orderDetails.customerPhone,
				orderDetails.orderItemsNames,
				orderDetails.tokens,
			)

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Error while rejecting review', error)
			return next(new ErrorHandler(error.message, 500))
		}
	}

	async approveReview(req, res, next) {
		const { orderId } = req.params
		const { comment } = req.body
		const user = req.user

		if (!orderId || !user) {
			return next(new ErrorHandler('Missing required fields', 400))
		}

		try {
			const result = await orderReceiptReviewService.approveReview(orderId, user.id, comment)
			const orderDetails = await this.getOrderDetails(orderId)

			await sendReviewApprovedNotification(
				orderDetails.customerName,
				orderDetails.customerPhone,
				orderDetails.orderItemsNames,
				orderDetails.tokens,
			)

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Error while approving review', error)
			return next(new ErrorHandler(error.message, 500))
		}
	}

	async getOrderDetails(orderId) {
		const order = await Order.findById(orderId)

		if (!order) {
			throw new Error('Order not found')
		}

		const storeCompanyId = order.storeCompany
		const admins = await User.find({ role: 'admin', company: storeCompanyId })

		const adminIds = admins.map(admin => admin._id)
		const pushTokens = await PushToken.find({ userId: { $in: adminIds } })

		const tokens = pushTokens.map(token => token.token)

		const customerName = order.customer.name
		const customerPhone = order.customer.phone
		const orderItemsNames = order.orderItems.map(item => item.name).join(', ')

		return {
			tokens,
			customerName,
			customerPhone,
			orderItemsNames,
		}
	}

	async getOrderReceiptPDF(req, res, next) {
		try {
			const orderId = req.params.orderId

			if (!orderId) {
				return next(new ErrorHandler('Missing orderId', 400))
			}

			const pdfBuffer = await orderReceiptReviewService.getOrderReceiptPDF(orderId)

			const order = await Order.findById(orderId)

			if (!order) {
				return next(new LocalizedError(localizedErrorMessages['404_ORDER_NOT_FOUND'], 404))
			}

			const orderDateForFilename = order.createdAt.toLocaleDateString('ru-RU', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
			})

			const filename = `Счет на оплату #${order.autoId} от ${orderDateForFilename}`
			const encodedFilename = encodeURIComponent(filename)

			res.setHeader('Content-Type', 'application/pdf')
			res.setHeader('Content-Disposition', `inline; filename=${encodedFilename}.pdf`)
			return res.send(pdfBuffer)
		} catch (error) {
			logger.error('Error generating PDF', error)
			return next(new ErrorHandler('Failed to generate order details file', 500))
		}
	}
}

export const orderReceiptController = new OrderReceiptController()
