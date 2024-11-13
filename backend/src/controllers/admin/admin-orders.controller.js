import mongoose from 'mongoose'

import LocalizedError from '../../errors/localized-error.js'
import { localizedErrorMessages } from '../../errors/localized-messages.js'
import { ORDER_STATUSES, ORDER_STATUSES_LIST, Order } from '../../models/order.js'
import { Product } from '../../models/product.js'
import { User } from '../../models/user.js'
import { orderReceiptReviewService } from '../../services/order-receipt-review.service.js'
import ErrorHandler from '../../utils/error.js'
import { logger } from '../../utils/logger.utils.js'
import { getPagination } from '../../utils/pagination.utils.js'
import { getSorting } from '../../utils/sorting.utils.js'

class AdminOrdersController {
	async getOrders(req, res, next) {
		try {
			const { page, size, searchValue, sort, status, paginate } = req.query
			const currentUser = req.user

			const mongoQuery = {
				storeCompany: currentUser.company._id,
			}

			if (searchValue) {
				mongoQuery.$or = [
					{
						'orderItems.name': {
							$regex: new RegExp(searchValue.trim(), 'i'),
						},
					},
					{
						'orderItems.barcode': {
							$regex: new RegExp(searchValue.trim(), 'i'),
						},
					},
				]

				if (mongoose.Types.ObjectId.isValid(searchValue.trim())) {
					mongoQuery.$or = [
						...mongoQuery.$or,
						{
							_id: mongoose.Types.ObjectId(searchValue.trim()),
						},
					]
				}
			}

			if (status) {
				if (status === 'Active') {
					mongoQuery.orderStatus = {
						$in: [
							ORDER_STATUSES.ORDER_CREATED,
							ORDER_STATUSES.PREPARING,
							ORDER_STATUSES.REVIEW_REJECTED_BY_USER,
							ORDER_STATUSES.NEXT_DAY_SHIPPING,
							ORDER_STATUSES.SHIPPED,
						],
					}
				} else if (status === 'All') {
					mongoQuery.orderStatus = {
						$in: ORDER_STATUSES_LIST,
					}
				} else {
					mongoQuery.orderStatus = status
				}
			}

			const sorting = getSorting(sort)
			const pagination = getPagination(page, size, paginate)

			const orders = await Order.paginate(mongoQuery, {
				limit: pagination.limit,
				offset: pagination.offset,
				pagination: pagination.paginate,
				sort: sorting,
				populate: ['orderItems.product', 'assignee'],
			})

			return res.status(200).json(orders)
		} catch (error) {
			logger.error('Failed to get orders', error)
			return next(new ErrorHandler('Failed to get orders', 500))
		}
	}

	async getOrderDetails(req, res, next) {
		try {
			const order = await Order.findById(req.params.id).populate([
				'orderItems.product',
				'customer.user',
				'assignee',
			])

			if (!order) {
				return next(new ErrorHandler('Order Not Found', 404))
			}

			const orderReceiptReview = await orderReceiptReviewService.getReviewByOrderIdRaw(order._id)

			return res.status(200).json({ ...order.toObject(), receiptReview: orderReceiptReview })
		} catch (error) {
			logger.error('Failed to get an order', error)
			return next(new ErrorHandler('Failed to get an order', 500))
		}
	}

	async updateOrder(req, res, next) {
		try {
			const {
				shippingInfo,
				orderItems,
				status,
				paymentMethod,
				taxPrice = 0,
				shippingCharges,
				customerName,
				customerPhone,
			} = req.body
			const orderId = req.params.id

			const order = await Order.findById(orderId)

			if (!order) {
				return next(new LocalizedError(localizedErrorMessages['404_ORDER_NOT_FOUND'], 404))
			}

			if (status) order.orderStatus = status
			if (shippingInfo) order.shippingInfo = shippingInfo
			if (paymentMethod) order.paymentMethod = paymentMethod
			if (!isNaN(taxPrice)) order.taxPrice = taxPrice
			if (typeof shippingCharges === 'boolean') order.shippingCharges = shippingCharges
			if (customerName) order.customer.name = customerName
			if (customerPhone) order.customer.phone = customerPhone

			if (orderItems) {
				const restoreStockOperations = order.orderItems.map(item => ({
					updateOne: {
						filter: { _id: item.product },
						update: { $inc: { stock: item.quantity } },
					},
				}))

				await Product.bulkWrite(restoreStockOperations)

				order.orderItems = orderItems

				const updateStockOperations = orderItems.map(item => ({
					updateOne: {
						filter: { _id: item.product },
						update: { $inc: { stock: -item.quantity } },
					},
				}))

				await Product.bulkWrite(updateStockOperations)

				order.itemsPrice = orderItems.reduce(
					(acc, item) => acc + item.product.price * item.quantity,
					0,
				)
			}

			if (order.discountPercentage) {
				const discountPrice = ((order.itemsPrice * order.discountPercentage) / 100).toFixed(0)
				order.discount = discountPrice
			}

			order.totalAmount = (order.itemsPrice ?? 0) + (order.taxPrice ?? 0) - (order.discount ?? 0)

			const orderReceiptReview = await orderReceiptReviewService.getReviewByOrderIdPopulated(
				order._id,
			)
			if (
				orderReceiptReview &&
				!orderReceiptReview.approved &&
				order.orderStatus === ORDER_STATUSES.REVIEW_REJECTED_BY_USER
			) {
				order.orderStatus = ORDER_STATUSES.UPDATED_BY_ADMIN
			}

			await order.save()

			return res.status(200).json({ success: true, order })
		} catch (error) {
			logger.error('Failed to update an order', error)
			return next(new LocalizedError(localizedErrorMessages['500_UPDATE_ORDER_ERROR'], 500))
		}
	}

	async processPayment(req, res, next) {
		try {
			const { isPaid } = req.body
			const order = await Order.findById(req.params.id)
			if (!order) return next(new ErrorHandler('Order Not Found', 404))

			order.paidAt = isPaid ? new Date() : undefined
			order.isPaid = isPaid
			order.save()

			res.status(200).json({
				success: true,
			})
		} catch (error) {
			logger.error('Failed to process order payment', error)
			return next(new ErrorHandler('Failed to process order payment', 500))
		}
	}

	async createOrder(req, res, next) {
		try {
			const {
				shippingInfo,
				orderItems,
				paymentMethod,
				taxPrice = 0,
				shippingCharges,
				barcode,
				customerName,
				customerPhone,
			} = req.body

			// Validate input data
			if (
				!shippingInfo ||
				!orderItems ||
				!paymentMethod ||
				isNaN(taxPrice) ||
				typeof shippingCharges !== 'boolean' ||
				!customerName ||
				!customerPhone
			) {
				return next(new LocalizedError(localizedErrorMessages['400_MISSING_REQUIRED_FIELDS'], 400))
			}

			const itemsPrice = orderItems.reduce((acc, item) => acc + item.price, 0)
			const totalAmount = itemsPrice + taxPrice

			const lastOrder = await Order.findOne({ storeCompany: req.user.company._id }).sort({
				autoId: -1,
			})
			const autoId = lastOrder ? lastOrder.autoId + 1 : 1

			// Create order
			await Order.create({
				user: req.user._id,
				shippingInfo,
				orderItems,
				paymentMethod,
				itemsPrice,
				taxPrice,
				shippingCharges,
				totalAmount,
				storeCompany: req.user.company,
				barcode,
				customer: {
					name: customerName,
					phone: customerPhone,
				},
				autoId,
			})

			// Update product stock
			const bulkOperations = []
			for (const orderItem of orderItems) {
				if (!mongoose.isValidObjectId(orderItem.product)) {
					throw new Error('Invalid product ID')
				}

				bulkOperations.push({
					updateOne: {
						filter: { _id: orderItem.product },
						update: { $inc: { stock: -orderItem.quantity } },
					},
				})
			}

			await Product.bulkWrite(bulkOperations)

			return res.status(201).json({ success: true })
		} catch (error) {
			logger.error('Failed to create order', error)
			return next(new LocalizedError(localizedErrorMessages['500_CREATE_ORDER_ERROR'], 500))
		}
	}

	async assignUserToOrder(req, res, next) {
		try {
			const { userId } = req.body
			const order = await Order.findById(req.params.id)
			const user = await User.findById(userId)

			order.assignee = user

			order.save()

			return res.status(201).json({
				success: true,
			})
		} catch (error) {
			logger.error('Failed to assign user to order', error)
			return next(new ErrorHandler('Failed to assign user to order', 500))
		}
	}
}

export const adminOrdersController = new AdminOrdersController()
