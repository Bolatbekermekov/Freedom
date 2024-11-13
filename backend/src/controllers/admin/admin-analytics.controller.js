import { Company } from '../../models/company.model.js'
import { COMPLETED_ORDER_STATUSES, Order } from '../../models/order.js'
import { Product } from '../../models/product.js'
import { User } from '../../models/user.js'
import { storeAnalyticsService } from '../../services/analytics.service.js'
import ErrorHandler from '../../utils/error.js'
import { logger } from '../../utils/logger.utils.js'

class AdminAnalyticsController {
	async getTotals(req, res, next) {
		try {
			const currentUser = req.user
			const company = currentUser.company

			const [
				completedOrders,
				totalOrders,
				totalProductsAmount,
				totalActiveOrdersAmount,
				totalCompletedOrdersAmount,
				totalCompanyMembers,
			] = await Promise.all([
				Order.find({
					storeCompany: company._id,
					orderStatus: COMPLETED_ORDER_STATUSES,
				}).exec(),
				Order.find({
					storeCompany: company._id,
				}).exec(),
				Product.countDocuments({
					company: company._id,
				}),
				Order.countDocuments({
					storeCompany: company._id,
					orderStatus: { $ne: 'Delivered' },
				}),
				Order.countDocuments({
					storeCompany: company._id,
					orderStatus: 'Delivered',
				}),
				User.countDocuments({
					company: company._id,
				}),
			])

			const totalSales = completedOrders.reduce((acc, item) => acc + item.itemsPrice, 0)

			return res.status(200).json({
				sales: totalSales,
				products: totalProductsAmount,
				orders: totalOrders.length,
				activeOrders: totalActiveOrdersAmount,
				completedOrders: totalCompletedOrdersAmount,
				members: totalCompanyMembers,
			})
		} catch (error) {
			logger.error('Failed to get statistics', error)
			return next(new ErrorHandler('Failed to get statistics', 500))
		}
	}

	async getSuperAdminTotals(req, res, next) {
		try {
			const [usersCount, clinicsCount, storesCount] = await Promise.all([
				User.countDocuments(),
				Company.countDocuments({ type: 'CLINIC' }),
				Company.countDocuments({ type: 'STORE' }),
			])

			return res.status(200).json({
				users: usersCount,
				clinics: clinicsCount,
				stores: storesCount,
			})
		} catch (error) {
			logger.error('Failed to get statistics', error)
			return next(new ErrorHandler('Failed to get statistics', 500))
		}
	}

	async getSalesByPeriod(req, res, next) {
		try {
			const { periodType } = req.query

			const currentUser = req.user
			const company = currentUser.company

			const result = await storeAnalyticsService.getSalesByPeriodType(company._id, periodType)

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get sales analytics')
			return next(new ErrorHandler('Failed to get sales analytics', 500))
		}
	}

	async getAssignedUsersWithOrders(req, res, next) {
		try {
			const { periodType } = req.query

			const currentUser = req.user
			const company = currentUser.company

			const queryStartDate = getStartDateByPeriod(periodType)
			const queryEndDate = new Date()

			const pipeline = [
				{
					$match: {
						createdAt: {
							$gte: queryStartDate,
							$lt: queryEndDate,
						},
						storeCompany: company._id,
					},
				},
				{
					$lookup: {
						from: 'users',
						localField: 'assignee',
						foreignField: '_id',
						as: 'user',
					},
				},
				{
					$unwind: '$user',
				},
				{
					$group: {
						_id: '$user.name',
						orders: { $sum: 1 },
					},
				},
				{
					$project: {
						user: '$_id',
						orders: 1,
						_id: 0,
					},
				},
			]

			const ordersByAssigners = await Order.aggregate(pipeline)

			return res.status(200).json(ordersByAssigners)
		} catch (error) {
			logger.error('Failed to get assignees by orders', error)
			return next(new ErrorHandler('Failed to get assignees by orders', 500))
		}
	}

	async getOrdersByStatus(req, res, next) {
		try {
			const { periodType } = req.query

			const currentUser = req.user
			const company = currentUser.company

			const queryStartDate = getStartDateByPeriod(periodType)
			const queryEndDate = new Date()

			const pipeline = [
				{
					$match: {
						createdAt: {
							$gte: queryStartDate,
							$lt: queryEndDate,
						},
						storeCompany: company._id,
					},
				},
				{
					$group: {
						_id: '$orderStatus',
						orders: { $sum: 1 },
					},
				},
				{
					$project: {
						status: '$_id',
						orders: 1,
						_id: 0,
					},
				},
			]

			const ordersByStatus = await Order.aggregate(pipeline)

			return res.status(200).json(ordersByStatus)
		} catch (error) {
			logger.error('Failed to get orders by statuses analytics', error)
			return next(new ErrorHandler('Failed to get orders by statuses analytics', 500))
		}
	}
}

function getStartDateByPeriod(periodType) {
	const now = new Date()
	let queryStartDate

	switch (periodType) {
		case 'daily':
			queryStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			break
		case 'weekly':
			queryStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
			break
		case 'monthly':
			queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
			break
		case 'quarterly':
			queryStartDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
			break
		case 'yearly':
			queryStartDate = new Date(now.getFullYear(), 0, 1)
			break
		default:
			queryStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
	}

	return queryStartDate
}

export const adminAnalyticsController = new AdminAnalyticsController()
