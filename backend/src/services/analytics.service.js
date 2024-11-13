import moment from 'moment/moment.js'

import { Company } from '../models/company.model.js'
import { COMPLETED_ORDER_STATUSES, Order } from '../models/order.js'
import { Product } from '../models/product.js'
import { User } from '../models/user.js'
import { convertToObjectId, isObjectId } from '../utils/mongoose.utils.js'

class StoreAnalyticsService {
	async getCurrentAndPreviousMonthSales(storeId) {
		if (!isObjectId(storeId)) {
			throw new Error('Invalid store id')
		}

		const now = new Date()
		const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
		const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
		const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

		const [currentMonthSales, previousMonthSales] = await Promise.all([
			Order.aggregate([
				{
					$match: {
						storeCompany: convertToObjectId(storeId),
						createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
						orderStatus: { $in: COMPLETED_ORDER_STATUSES },
					},
				},
				{ $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
			]),
			Order.aggregate([
				{
					$match: {
						storeCompany: convertToObjectId(storeId),
						createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
						orderStatus: { $in: COMPLETED_ORDER_STATUSES },
					},
				},
				{ $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
			]),
		])

		const currentSales = currentMonthSales.length > 0 ? currentMonthSales[0].totalSales : 0
		const previousSales = previousMonthSales.length > 0 ? previousMonthSales[0].totalSales : 0

		return {
			currentValue: currentSales,
			previousValue: previousSales,
		}
	}

	async getTotalSalesForCurrentMonth(storeId) {
		if (!isObjectId(storeId)) {
			throw new Error('Invalid store id')
		}

		const { currentValue: currentSales, previousValue: previousSales } =
			await this.getCurrentAndPreviousMonthSales(storeId)

		const changeRate = this.calculateChangeRate(currentSales, previousSales)

		return {
			value: currentSales,
			changeRate,
		}
	}

	async getAverageDailySalesForCurrentMonth(storeId) {
		const now = new Date()
		const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
		const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

		const daysInCurrentMonth = endOfCurrentMonth.getDate()
		const daysInPreviousMonth = endOfPreviousMonth.getDate()

		const sales = await this.getCurrentAndPreviousMonthSales(storeId)

		const averageDailySalesCurrentMonth = sales.currentValue / daysInCurrentMonth
		const averageDailySalesPreviousMonth = sales.previousValue / daysInPreviousMonth

		const changeRate = this.calculateChangeRate(
			averageDailySalesCurrentMonth,
			averageDailySalesPreviousMonth,
		)

		return {
			value: averageDailySalesCurrentMonth,
			changeRate,
		}
	}

	async getTotalOrdersForCurrentMonth(storeId) {
		if (!isObjectId(storeId)) {
			throw new Error('Invalid store id')
		}

		const now = new Date()
		const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
		const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
		const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

		const [currentMonthOrders, previousMonthOrders] = await Promise.all([
			Order.countDocuments({
				storeCompany: convertToObjectId(storeId),
				createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
			}),
			Order.countDocuments({
				storeCompany: convertToObjectId(storeId),
				createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
			}),
		])

		const changeRate = this.calculateChangeRate(currentMonthOrders, previousMonthOrders)

		return {
			value: currentMonthOrders,
			changeRate,
		}
	}

	async getSalesByPeriodType(storeId, periodType) {
		if (!isObjectId(storeId)) {
			throw new Error('Invalid store id')
		}

		const now = new Date()
		const matchCondition = {
			storeCompany: convertToObjectId(storeId),
			orderStatus: { $in: COMPLETED_ORDER_STATUSES },
		}

		let groupBy, project, labels

		switch (periodType) {
			case 'ONE_DAY':
				matchCondition.createdAt = { $gte: moment().startOf('day').toDate() }
				groupBy = { $hour: '$createdAt' }
				project = {
					_id: 0,
					label: { $toString: '$_id' },
					value: { $ifNull: ['$totalSales', 0] },
				}
				labels = Array.from({ length: 24 }, (_, i) => ({
					label: i.toString(),
					value: 0,
				}))
				break

			case 'FIVE_DAYS':
				matchCondition.createdAt = { $gte: moment().subtract(5, 'days').startOf('day').toDate() }
				groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
				project = {
					_id: 0,
					label: { $toString: '$_id' },
					value: { $ifNull: ['$totalSales', 0] },
				}
				labels = Array.from({ length: 5 }, (_, i) => ({
					label: moment().subtract(i, 'days').format('YYYY-MM-DD'),
					value: 0,
				})).reverse()
				break

			case 'ONE_MONTH':
				matchCondition.createdAt = { $gte: moment().startOf('month').toDate() }
				groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
				project = {
					_id: 0,
					label: { $toString: '$_id' },
					value: { $ifNull: ['$totalSales', 0] },
				}
				labels = Array.from({ length: now.getDate() }, (_, i) => ({
					label: moment().startOf('month').add(i, 'days').format('YYYY-MM-DD'),
					value: 0,
				}))
				break

			case 'SIX_MONTHS':
				matchCondition.createdAt = {
					$gte: moment().subtract(5, 'months').startOf('month').toDate(),
				}
				groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
				project = {
					_id: 0,
					label: { $toString: '$_id' },
					value: { $ifNull: ['$totalSales', 0] },
				}
				labels = Array.from({ length: 6 }, (_, i) => ({
					label: moment().subtract(i, 'months').format('YYYY-MM'),
					value: 0,
				})).reverse()
				break

			case 'MAX':
				groupBy = { $year: '$createdAt' }
				project = {
					_id: 0,
					label: { $toString: '$_id' },
					value: { $ifNull: ['$totalSales', 0] },
				}
				labels = []
				break

			default:
				throw new Error('Invalid period type')
		}

		const salesData = await Order.aggregate([
			{ $match: matchCondition },
			{ $group: { _id: groupBy, totalSales: { $sum: '$totalAmount' } } },
			{ $project: project },
			{ $sort: { label: 1 } },
		])

		if (periodType === 'MAX') {
			labels = salesData.map(data => ({
				label: moment(data.label, 'YYYY').format('YYYY'),
				value: 0,
			}))
		}

		const salesMap = new Map(salesData.map(item => [item.label, item.value]))

		labels = labels.map(item => ({
			label: item.label,
			value: salesMap.get(item.label) || 0,
		}))

		labels = labels.map(item => ({
			label:
				periodType === 'ONE_DAY'
					? moment().startOf('day').add(item.label, 'hours').toISOString()
					: moment(item.label).toISOString(),
			value: item.value,
		}))

		return labels
	}

	calculateChangeRate(currentValue, previousValue) {
		if (previousValue === 0) {
			return currentValue === 0 ? 0 : 100
		}
		return Math.round(((currentValue - previousValue) / previousValue) * 100)
	}

	async getPlatformStatistics() {
		try {
			const now = moment()
			const startOfMonth = now.clone().startOf('month').toDate()
			const endOfMonth = now.clone().endOf('month').toDate()

			const [
				customersCount,
				storesCount,
				productsCount,
				completedOrdersCount,
				monthlyActiveUsers,
				newUsersCount,
			] = await Promise.all([
				User.countDocuments(),
				Company.countDocuments({ type: 'STORE' }),
				Product.countDocuments(),
				Order.countDocuments({
					orderStatus: {
						$in: COMPLETED_ORDER_STATUSES,
					},
				}),
				Order.find({
					createdAt: {
						$gte: startOfMonth,
						$lte: endOfMonth,
					},
					orderStatus: {
						$in: COMPLETED_ORDER_STATUSES,
					},
				})
					.distinct('customer.user')
					.count(),
				User.countDocuments({
					createdAt: {
						$gte: startOfMonth,
						$lte: endOfMonth,
					},
				}),
			])

			return {
				customersCount,
				storesCount,
				productsCount,
				completedOrdersCount,
				monthlyActiveUsers: monthlyActiveUsers,
				registeredUsersForCurrentMonth: newUsersCount,
			}
		} catch (error) {
			throw new Error('Unable to fetch platform statistics')
		}
	}

	async getRegisteredUsersByMonth() {
		const currentYear = moment().year()
		const currentMonth = moment().month()

		const usersCountByMonth = await User.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(`${currentYear}-01-01`),
						$lte: new Date(`${currentYear}-${currentMonth + 1}-31`),
					},
				},
			},
			{
				$group: {
					_id: { month: { $month: '$createdAt' } },
					count: { $sum: 1 },
				},
			},
			{
				$project: {
					_id: 0,
					month: '$_id.month',
					count: 1,
				},
			},
		])

		const months = moment.months().slice(0, currentMonth + 1)
		const result = months.map(month => ({
			label: month,
			value: 0,
		}))

		usersCountByMonth.forEach(item => {
			result[item.month - 1].value = item.count
		})

		return result
	}

	async getCreatedOrdersByMonth() {
		const currentYear = moment().year()
		const currentMonth = moment().month()

		const ordersCountByMonth = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(`${currentYear}-01-01`),
						$lte: new Date(`${currentYear}-${currentMonth + 1}-31`),
					},
				},
			},
			{
				$group: {
					_id: { month: { $month: '$createdAt' } },
					count: { $sum: 1 },
				},
			},
			{
				$project: {
					_id: 0,
					month: '$_id.month',
					count: 1,
				},
			},
		])

		const months = moment.months().slice(0, currentMonth + 1)
		const result = months.map(month => ({
			label: month,
			value: 0,
		}))

		ordersCountByMonth.forEach(item => {
			result[item.month - 1].value = item.count
		})

		return result
	}

	async getCompletedOrdersByMonth() {
		const currentYear = moment().year()
		const currentMonth = moment().month()

		const ordersCountByMonth = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(`${currentYear}-01-01`),
						$lte: new Date(`${currentYear}-${currentMonth + 1}-31`),
					},
					orderStatus: {
						$in: COMPLETED_ORDER_STATUSES,
					},
				},
			},
			{
				$group: {
					_id: { month: { $month: '$createdAt' } },
					count: { $sum: 1 },
				},
			},
			{
				$project: {
					_id: 0,
					month: '$_id.month',
					count: 1,
				},
			},
		])

		const months = moment.months().slice(0, currentMonth + 1)
		const result = months.map(month => ({
			label: month,
			value: 0,
		}))

		ordersCountByMonth.forEach(item => {
			result[item.month - 1].value = item.count
		})

		return result
	}

	async getStoreStatistics(storeId) {
		if (!isObjectId(storeId)) {
			throw new Error('Invalid store id')
		}

		const storeObjectId = convertToObjectId(storeId)

		const [
			totalSalesResult,
			totalOrdersResult,
			activeOrdersResult,
			completedOrdersResult,
			productsCountResult,
			employeesCountResult,
		] = await Promise.all([
			// Total sales for completed orders
			Order.aggregate([
				{
					$match: { storeCompany: storeObjectId, orderStatus: { $in: COMPLETED_ORDER_STATUSES } },
				},
				{ $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
			]),

			// Total orders count
			Order.countDocuments({ storeCompany: storeObjectId }),

			// Active orders count
			Order.countDocuments({
				storeCompany: storeObjectId,
				orderStatus: { $nin: COMPLETED_ORDER_STATUSES },
			}),

			// Completed orders count
			Order.countDocuments({
				storeCompany: storeObjectId,
				orderStatus: { $in: COMPLETED_ORDER_STATUSES },
			}),

			// Products count
			Product.countDocuments({ company: storeObjectId }),

			// Employees count
			User.countDocuments({ company: storeObjectId }),
		])

		return {
			totalSales: totalSalesResult[0]?.totalSales || 0,
			totalOrders: totalOrdersResult ?? 0,
			activeOrders: activeOrdersResult ?? 0,
			completedOrders: completedOrdersResult ?? 0,
			products: productsCountResult ?? 0,
			employees: employeesCountResult ?? 0,
		}
	}
}

export const storeAnalyticsService = new StoreAnalyticsService()
