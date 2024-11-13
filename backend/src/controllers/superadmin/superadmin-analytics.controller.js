import { storeAnalyticsService } from '../../services/analytics.service.js'
import ErrorHandler from '../../utils/error.js'
import { logger } from '../../utils/logger.utils.js'

class SuperAdminAnalyticController {
	async getAverageDailySalesForCurrentMonth(req, res, next) {
		try {
			const id = req.params.id

			const result = await storeAnalyticsService.getAverageDailySalesForCurrentMonth(id)

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get average daily sales for current month', error)
			return next(new ErrorHandler('Failed to get average daily sales for current month', 500))
		}
	}

	async getTotalOrdersForCurrentMonth(req, res, next) {
		try {
			const id = req.params.id

			const result = await storeAnalyticsService.getTotalOrdersForCurrentMonth(id)

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get total orders for current month', error)
			return next(new ErrorHandler('Failed to get total orders for current month', 500))
		}
	}

	async getTotalSalesForCurrentMonth(req, res, next) {
		try {
			const id = req.params.id

			const result = await storeAnalyticsService.getTotalSalesForCurrentMonth(id)

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get total sales for current month', error)
			return next(new ErrorHandler('Failed to get total sales for current month', 500))
		}
	}

	async getStoresStatistics(req, res, next) {
		try {
			const id = req.params.id

			const result = await storeAnalyticsService.getStoreStatistics(id)

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get store statistics', error)
			return next(new ErrorHandler('Failed to get store statistics', 500))
		}
	}

	async getSalesByPeriodType(req, res, next) {
		try {
			const id = req.params.id
			const periodType = req.query.periodType

			const result = await storeAnalyticsService.getSalesByPeriodType(id, periodType)

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get sales by period type', error)
			return next(new ErrorHandler('Failed to get sales by period type', 500))
		}
	}

	async getPlatformStatistics(req, res, next) {
		try {
			const result = await storeAnalyticsService.getPlatformStatistics()

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get total sales for current month', error)
			return next(new ErrorHandler('Failed to get total sales for current month', 500))
		}
	}

	async getRegisteredUsersByMonth(req, res, next) {
		try {
			const result = await storeAnalyticsService.getRegisteredUsersByMonth()

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get registered users by month: ', error)
			return next(new ErrorHandler('Failed to get registered users by month', 500))
		}
	}

	async getCreatedOrdersByMonth(req, res, next) {
		try {
			const result = await storeAnalyticsService.getCreatedOrdersByMonth()

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get created orders by month: ', error)
			return next(new ErrorHandler('Failed to get created orders by month', 500))
		}
	}

	async getCompletedOrdersByMonth(req, res, next) {
		try {
			const result = await storeAnalyticsService.getCompletedOrdersByMonth()

			return res.status(200).json(result)
		} catch (error) {
			logger.error('Failed to get completed orders by month: ', error)
			return next(new ErrorHandler('Failed to get completed orders by month', 500))
		}
	}
}

export const superAdminAnalyticController = new SuperAdminAnalyticController()
