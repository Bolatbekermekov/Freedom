import { config } from 'dotenv'

import { connectDB } from '../src/database/database.js'
import { Order } from '../src/models/order.js'
import { logger } from '../src/utils/logger.utils.js'

config({ path: './.env' })

await connectDB()

async function findOrdersWithMismatchedCompanies() {
	const orders = await Order.aggregate([
		{
			$lookup: {
				from: 'products', // The collection name for products
				localField: 'orderItems.product',
				foreignField: '_id',
				as: 'productDetails',
			},
		},
		{
			$project: {
				orderItems: 1,
				productDetails: 1,
				mismatchedProducts: {
					$filter: {
						input: '$productDetails',
						as: 'productDetail',
						cond: { $ne: ['$$productDetail.company', '$storeCompany'] },
					},
				},
			},
		},
		{
			$match: {
				$expr: {
					$gt: [{ $size: '$mismatchedProducts' }, 0],
				},
			},
		},
	])

	return orders
}

// Usage
findOrdersWithMismatchedCompanies()
	.then(orders => {
		orders.forEach(order => {
			console.log('\nOrder ID:', order._id.toString())
			console.log('Mismatched Products:')
			order.mismatchedProducts.forEach(product => {
				console.log(`Product ID: ${product._id}, Company: ${product.company}`)
			})
		})
	})
	.catch(err => {
		logger.error('Error finding orders:', err)
	})
