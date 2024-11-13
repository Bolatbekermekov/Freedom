import mongoose from 'mongoose'

import LocalizedError from '../errors/localized-error.js'
import { localizedErrorMessages } from '../errors/localized-messages.js'
import { asyncError } from '../middlewares/error.js'
import { ORDER_STATUSES, ORDER_STATUSES_LIST, Order } from '../models/order.js'
import { Product } from '../models/product.js'
import { Promotion } from '../models/promotion.js'
import { PushToken, User } from '../models/user.js'
import ErrorHandler from '../utils/error.js'
import {
	newOrderNotification,
	resetBadgeCount,
	sendOrderStatusNotification,
	sendUserOrderConfirmationNotification,
} from '../utils/features.js'
import { logger } from '../utils/logger.utils.js'
import { getSorting } from '../utils/sorting.utils.js'

import { usePromoCode } from './promotion.js'

const statusTranslations = {
	'Order Created': 'Заказ создан',
	Preparing: 'Подготовка',
	NEXT_DAY_SHIPPING: 'Доставка на следующий день',
	Shipped: 'Отправлено',
	Delivered: 'Доставлено',
	Cancelled: 'Отменено',
}

export const processPayment = asyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id)
	const { isPaid } = req.body
	if (!order) return next(new ErrorHandler('Order Not Found', 404))
	if (order.isPaid === isPaid) {
		return res.status(200).json({
			success: true,
		})
	}

	order.paidAt = isPaid ? new Date() : undefined
	order.isPaid = isPaid
	order.save()
	res.status(200).json({
		success: true,
	})
})

// Utility function to validate and get product details
const validateOrderItems = async orderItems => {
	return await Promise.all(
		orderItems
			.filter(orderItem => orderItem.quantity > 0)
			.map(async orderItem => {
				if (!mongoose.isValidObjectId(orderItem.product._id)) {
					throw new Error('Invalid product ID')
				}
				const product = await Product.findById(orderItem.product._id)
				if (!product) {
					throw new Error('Product not found')
				}
				return {
					quantity: orderItem.quantity,
					product,
					image: product.images[0],
				}
			}),
	)
}

// Utility function to group order items by store
const groupOrderItemsByStore = orderItems => {
	return orderItems.reduce((acc, item) => {
		acc[item.product.company] = acc[item.product.company] || []
		acc[item.product.company].push({
			name: item.product.name,
			price: item.product.price,
			quantity: item.quantity,
			barcode: item.product.barcode,
			color: item.product.color,
			size: item.product.size,
			product: item.product,
			image: item.image,
		})
		return acc
	}, {})
}

// Utility function to calculate item prices and stock updates by store
const calculatePricesAndStockUpdates = groupedOrderItems => {
	const itemsPriceByStore = {}
	const stockUpdatesByStore = {}

	for (const [storeId, storeOrderItems] of Object.entries(groupedOrderItems)) {
		const storeItemsPrice = storeOrderItems.reduce(
			(acc, item) => acc + item.product.price * item.quantity,
			0,
		)
		itemsPriceByStore[storeId] = storeItemsPrice

		stockUpdatesByStore[storeId] = storeOrderItems.reduce((acc, item) => {
			acc[item.product._id] = (acc[item.product._id] || 0) - item.quantity
			return acc
		}, {})
	}

	return { itemsPriceByStore, stockUpdatesByStore }
}

// Utility function to apply promotions and calculate shipping charges
const applyPromotionsAndCalculateShipping = async (itemsPriceByStore, shippingInfo) => {
	const activePromotions = await Promotion.find({
		company: { $in: Object.keys(itemsPriceByStore) },
		isActive: true,
		promotionType: 'automatic',
		applicableCities: shippingInfo.city,
	})

	const shippingChargesByCompany = {}
	const shippingCity = shippingInfo.city

	activePromotions.forEach(promotion => {
		if (
			promotion.applicableCities.includes(shippingCity) &&
			itemsPriceByStore[promotion.company.toString()] &&
			itemsPriceByStore[promotion.company.toString()] >= promotion.minimumOrderValue
		) {
			shippingChargesByCompany[promotion.company.toString()] = true
		} else {
			shippingChargesByCompany[promotion.company.toString()] = false
		}
	})

	return shippingChargesByCompany
}

export const createOrder = asyncError(async (req, res, next) => {
	try {
		const { shippingInfo, orderItems, paymentMethod, promoCode, company } = req.body

		const taxPrice = 0

		const validatedOrderItems = await validateOrderItems(orderItems)
		const groupedOrderItemsByStore = groupOrderItemsByStore(validatedOrderItems)
		const { itemsPriceByStore, stockUpdatesByStore } =
			calculatePricesAndStockUpdates(groupedOrderItemsByStore)

		let appliedPromotion = null
		let promoDiscount = 0
		let promoDiscountPercentage = 0
		if (promoCode && company) {
			const promoResult = await usePromoCode(req.user._id, promoCode, [company])
			if (promoResult.success && promoResult.company.toString() === company) {
				appliedPromotion = promoResult.promotionId // Assuming promotionId is returned in promoResult
				promoDiscount = (promoResult.discountPercentage / 100) * itemsPriceByStore[company]
				promoDiscountPercentage = promoResult.discountPercentage
			} else {
				return next(
					new ErrorHandler('Invalid or expired promo code for the selected company.', 400),
				)
			}
		}

		const shippingChargesByCompany = await applyPromotionsAndCalculateShipping(
			itemsPriceByStore,
			shippingInfo,
		)

		await Promise.all(
			Object.entries(groupedOrderItemsByStore).map(async ([companyId, storeOrderItems]) => {
				const customer = {
					name: req.user.name,
					phone: req.user.phone,
					user: req.user,
				}
				const shippingCharges =
					shippingChargesByCompany[companyId] !== undefined
						? shippingChargesByCompany[companyId]
						: false


				const discount = companyId === company ? promoDiscount : 0
				const discountPercentage = companyId === company ? promoDiscountPercentage : 0
				const promotion = companyId === company ? appliedPromotion : null
				const totalAmount = itemsPriceByStore[companyId] + taxPrice - discount

				const lastOrder = await Order.findOne({ storeCompany: companyId }).sort({ autoId: -1 })
				const autoId = lastOrder ? lastOrder.autoId + 1 : 1

				await Order.create({
					shippingInfo,
					orderItems: storeOrderItems,
					paymentMethod,
					itemsPrice: itemsPriceByStore[companyId],
					taxPrice,
					shippingCharges,
					totalAmount,
					storeCompany: companyId,
					customer,
					autoId,
					discount,
					discountPercentage,
					appliedPromotion: promotion,
				})
			}),
		)

		const flattenedStockUpdates = Object.values(stockUpdatesByStore).reduce((acc, storeUpdates) => {
			Object.entries(storeUpdates).forEach(([productId, quantity]) => {
				acc[productId] = (acc[productId] || 0) + quantity
			})
			return acc
		}, {})

		const bulkOperations = Object.entries(flattenedStockUpdates).map(([productId, quantity]) => ({
			updateOne: {
				filter: { _id: productId },
				update: { $inc: { stock: quantity } },
			},
		}))

		await Product.bulkWrite(bulkOperations, { ordered: false })

		const companiesWithOrders = Object.keys(groupedOrderItemsByStore)
		const objectIdCompaniesWithOrders = companiesWithOrders.map(id => mongoose.Types.ObjectId(id))

		const companyAdmins = await User.find({
			role: 'admin',
			company: { $in: objectIdCompaniesWithOrders },
		})

		const companyAdminIds = companyAdmins.map(admin => admin._id)

		let companyAdminPushTokens = await PushToken.find({ userId: { $in: companyAdminIds } })
		companyAdminPushTokens = companyAdminPushTokens.map(token => token.token)

		const orderItemsNames = orderItems.map(item => item.product.name).join(', ')

		companyAdminPushTokens = [...new Set(companyAdminPushTokens)]
		if (companyAdminPushTokens.length > 0) {
			await newOrderNotification(
				companyAdminPushTokens,
				req.user.name,
				req.user.phone,
				orderItemsNames,
			)
		}

		const userPushTokens = await PushToken.find({ userId: req.user._id })
		const userTokens = userPushTokens.map(token => token.token)
		const uniqueUserTokens = [...new Set(userTokens)]
		if (uniqueUserTokens.length > 0) {
			await sendUserOrderConfirmationNotification(uniqueUserTokens, orderItemsNames)
		}

		return res.status(201).json({ success: true })
	} catch (error) {
		logger.error('Error on create order', error)
		return next(new ErrorHandler('Failed to create order', 500))
	}
})

export const getAdminOrders = asyncError(async (req, res, next) => {
	const { sort, status, searchValue } = req.query
	const currentUser = req.user

	const mongoQuery = {
		storeCompany: currentUser.company,
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
					ORDER_STATUSES.UPDATED_BY_ADMIN,
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

	const orders = await Order.paginate(mongoQuery, {
		pagination: false,
		sort: sorting,
	})
	const userTokenDoc = await PushToken.findOne({ userId: currentUser._id })
	if (userTokenDoc) {
		const user = await User.findById(currentUser._id)
		if (user && user.role === 'admin') {
			const userToken = userTokenDoc.token
			await resetBadgeCount(userToken)
		}
	}

	res.status(200).json({
		success: true,
		orders: orders.docs,
	})
})

export const getMyOrders = asyncError(async (req, res, next) => {
	const orders = await Order.find({ 'customer.user': req.user._id }).sort({
		createdAt: -1,
	})

	const userTokenDoc = await PushToken.findOne({ userId: req.user._id })
	if (userTokenDoc) {
		const userToken = userTokenDoc.token
		await resetBadgeCount(userToken)
	}

	res.status(200).json({
		success: true,
		orders,
	})
})

export const getOrderDetails = asyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate([
		'storeCompany',
		'assignee',
		{
			path: 'orderItems.product',
			model: 'Product',
			populate: {
				path: 'company',
				model: 'Company',
			},
		},
	])

	if (!order) return next(new ErrorHandler('Order Not Found', 404))
	if (!order.user) {
		order.user = { name: 'deleted', phone: 'deleted' }
		order.save()
	}

	res.status(200).json({
		success: true,
		order,
	})
})

export const deleteOrder = asyncError(async (req, res, next) => {
	try {
		const orderId = req.params.id
		const order = await Order.findById(orderId)

		if (!order) {
			return next(new LocalizedError(localizedErrorMessages['404_ORDER_NOT_FOUND'], 404))
		}

		const restrictedDeleteStatuses = ['Shipped', 'Delivered']
		if (restrictedDeleteStatuses.includes(order.orderStatus)) {
			return next(
				new LocalizedError(localizedErrorMessages['400_ORDER_DELETE_STATUS_MISMATCH'], 404),
			)
		}

		const bulkRestoreOperations = order.orderItems.map(item => ({
			updateOne: {
				filter: { _id: item.product },
				update: { $inc: { stock: item.quantity } },
			},
		}))

		await Product.bulkWrite(bulkRestoreOperations)

		await order.delete()

		return res.status(200).json({ success: true })
	} catch (error) {
		logger.error('Failed to delete an order', error)
		return next(new LocalizedError(localizedErrorMessages['500_DELETE_ORDER_ERROR'], 500))
	}
})

export const proccessOrder = asyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id)

	if (!order) {
		return next(new LocalizedError(localizedErrorMessages['404_ORDER_NOT_FOUND'], 404))
	}
	const { newStatus } = req.body

	if (!Object.values(ORDER_STATUSES).includes(newStatus)) {
		return next(new ErrorHandler('Invalid Order Status', 400))
	}

	order.orderStatus = newStatus

	if (newStatus === ORDER_STATUSES.DELIVERED) {
		order.deliveredAt = new Date()
	}

	await order.save()

	const clientPushTokens = await PushToken.find({ userId: order.customer.user })
	const pushTokens = clientPushTokens.map(token => token.token)
	const uniquePushTokens = [...new Set(pushTokens)]

	const orderItemsNames = order.orderItems.map(item => item.name).join(', ')

	const russianStatus = statusTranslations[order.orderStatus]

	if (uniquePushTokens.length > 0) {
		await sendOrderStatusNotification(uniquePushTokens, russianStatus, orderItemsNames)
	}

	res.status(200).json({
		success: true,
		message: 'Заказ успешно обработан',
	})
})
