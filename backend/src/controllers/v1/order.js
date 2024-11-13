import { asyncError } from '../../middlewares/error.js'
import { Order } from '../../models/order.js'
import { Product } from '../../models/product.js'
import { PushToken, User } from '../../models/user.js'
import ErrorHandler from '../../utils/error.js'

// export const processPayment = asyncError(async (req, res, next) => {
//   const { totalAmount } = req.body;

//   const { client_secret } = await stripe.paymentIntents.create({
//     amount: Number(totalAmount * 100),
//     currency: "kzt",
//   });

//   res.status(200).json({
//     success: true,
//     client_secret,
//   });
// });

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

export const createOrder = asyncError(async (req, res, next) => {
	const {
		shippingInfo,
		orderItems,
		paymentMethod,
		itemsPrice,
		taxPrice,
		shippingCharges,
		totalAmount,
	} = req.body

	await Order.create({
		user: req.user._id,
		shippingInfo,
		orderItems,
		paymentMethod,
		itemsPrice,
		taxPrice,
		shippingCharges,
		totalAmount,
	})
	for (let i = 0; i < orderItems.length; i++) {
		const product = await Product.findById(orderItems[i].product)
		product.stock -= orderItems[i].quantity
		await product.save()
	}

	let adminUsers = await User.find({ role: 'admin' })
	adminUsers = adminUsers.map(user => user._id) // Extracting user IDs

	let pushTokens = await PushToken.find({ user: { $in: adminUsers } })

	pushTokens = pushTokens && pushTokens.map(token => token.token)

	// if (pushTokens && pushTokens.length > 0) newOrderNotification(pushTokens)

	res.status(201).json({
		success: true,
		// TODO: return in english Order Placed Successfully
		message: 'Заказ успешно оформлен.',
	})
})

export const getAdminOrders = asyncError(async (req, res, next) => {
	const orders = await Order.find({}).sort({ createdAt: -1 })

	res.status(200).json({
		success: true,
		orders,
	})
})

export const getMyOrders = asyncError(async (req, res, next) => {
	const orders = await Order.find({ user: req.user._id }).sort({
		createdAt: -1,
	})

	res.status(200).json({
		success: true,
		orders,
	})
})

export const getOrderDetails = asyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate('user')

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

export const proccessOrder = asyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id)
	if (!order) return next(new ErrorHandler('Order Not Found', 404))

	let pushTokens = await PushToken.find({ user: order.user })
	pushTokens = pushTokens && pushTokens.map(token => token.token)
	if (order.orderStatus === 'Preparing') order.orderStatus = 'Shipped'
	else if (order.orderStatus === 'Shipped') {
		order.orderStatus = 'Delivered'
		order.deliveredAt = new Date(Date.now())
	} else return next(new ErrorHandler('Order Already Delivered', 400))

	await order.save()
	// if (pushTokens && pushTokens.length > 0) sendOrderStatus(pushTokens, order.orderStatus)

	res.status(200).json({
		success: true,
		//TODO:  return Order Processed Successfully
		message: 'Заказ успешно обработан',
	})
})
