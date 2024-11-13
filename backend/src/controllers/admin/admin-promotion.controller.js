import { Promotion } from '../../models/promotion.js'
import ErrorHandler from '../../utils/error.js'
import { logger } from '../../utils/logger.utils.js'
import { getPagination } from '../../utils/pagination.utils.js'
import { getSorting } from '../../utils/sorting.utils.js'

class AdminPromotionController {
	async getCompanyPromotions(req, res, next) {
		try {
			const { page, size, searchValue, sort, paginate,promotionType } = req.query
			const companyId = req.user.company
			if (!companyId) return next(new ErrorHandler('Company ID is required', 400))

			const mongoQuery = { company: companyId }

			if (searchValue) {
				mongoQuery.$or = [{ promoCode: { $regex: new RegExp(searchValue.trim(), 'i') } }]
			}

			if (promotionType) {
				if (promotionType === 'All') {
					mongoQuery.promotionType = { $in: ['automatic', 'code'] }
				} else {
					mongoQuery.promotionType = promotionType
				}
			}

			const sortValues = getSorting(sort)
			const pagination = getPagination(page, size, paginate)

			const promotions = await Promotion.paginate(mongoQuery, {
				limit: pagination.limit,
				offset: pagination.offset,
				pagination: pagination.paginate,
				sort: sortValues,
			})

			return res.status(200).json(promotions)
		} catch (error) {
			logger.error('Failed to get promotions', error)
			return next(new ErrorHandler('Failed to get promotions', 500))
		}
	}

	async getPromotionDetails(req, res, next) {
		try {
			const promotion = await Promotion.findById(req.params.promoId)
			if (!promotion) return next(new ErrorHandler('Promotion not found', 404))

			return res.status(200).json({
				success: true,
				promotion,
			})
		} catch (error) {
			logger.error('Failed to get promotion details', error)
			return next(new ErrorHandler('Failed to get promotion details', 500))
		}
	}

	async generatePromotionCode(req, res, next) {
		try {
			const {
				description,
				discountPercentage,
				startDate,
				endDate,
				maxUsage,
				promoCode,
				promotionType,
				minimumOrderValue,
				applicableCities,
			} = req.body

			const companyId = req.user.company
			if (!companyId) return next(new ErrorHandler('Company ID is required', 400))

			if (promotionType === 'automatic') {
				await Promotion.deleteMany({
					company: companyId,
					promotionType: 'automatic',
				})
			}

			if (promotionType === 'code') {
				const existingPromotion = await Promotion.findOne({ promoCode })
				if (existingPromotion) {
					if (existingPromotion.company.toString() === companyId.toString()) {
						return next(new ErrorHandler('Промокод уже существует для вашей компании', 400))
					} else {
						return next(new ErrorHandler('Промокод уже используется другой компанией', 400))
					}
				}
			}

			const promotionData = {
				company: companyId,
				description,
				promotionType,
				isActive: true,
			}

			if (promotionType === 'code') {
				promotionData.promoCode = promoCode
				promotionData.discountPercentage = discountPercentage
				promotionData.maxUsage = maxUsage
				promotionData.endDate = endDate
				promotionData.startDate = startDate
			} else if (promotionType === 'automatic') {
				promotionData.minimumOrderValue = minimumOrderValue
				promotionData.applicableCities = applicableCities
			}

			const promotion = new Promotion(promotionData)

			await promotion.save()

			return res.status(201).json({
				success: true,
				promotion,
			})
		} catch (error) {
			logger.error('Failed to generate promotion code', error)
			return next(new ErrorHandler('Failed to generate promotion code', 500))
		}
	}

	async updatePromotion(req, res, next) {
		try {
			const { promoId } = req.params
			const companyId = req.user.company
			const {
				description,
				discountPercentage,
				startDate,
				endDate,
				maxUsage,
				isActive,
				promoCode,
				promotionType,
				minimumOrderValue,
				applicableCities,
				discountAmount,
			} = req.body

			if (!companyId) return next(new ErrorHandler('Company ID is required', 400))

			const promotion = await Promotion.findOne({ _id: promoId, company: companyId })
			if (!promotion) return next(new ErrorHandler('Promotion not found', 404))

			if (description !== undefined) promotion.description = description
			if (isActive !== undefined) promotion.isActive = isActive

			if (promotionType === 'code') {
				if (promoCode !== undefined) promotion.promoCode = promoCode
				if (discountPercentage !== undefined) promotion.discountPercentage = discountPercentage
				if (maxUsage !== undefined) promotion.maxUsage = maxUsage
				if (startDate !== undefined) promotion.startDate = startDate
				if (endDate !== undefined) promotion.endDate = endDate
			} else if (promotionType === 'automatic') {
				if (minimumOrderValue !== undefined) promotion.minimumOrderValue = minimumOrderValue
				if (applicableCities !== undefined) promotion.applicableCities = applicableCities
				if (discountAmount !== undefined) promotion.discountAmount = discountAmount
			}

			await promotion.save()

			return res.status(200).json({
				success: true,
				promotion,
			})
		} catch (error) {
			logger.error('Failed to update promotion', error)
			return next(new ErrorHandler('Failed to update promotion', 500))
		}
	}

	async deletePromotion(req, res, next) {
		try {
			const { promoId } = req.params
			const companyId = req.user.company

			const promotion = await Promotion.findOne({ _id: promoId, company: companyId })
			if (!promotion) return next(new ErrorHandler('Promotion not found', 404))

			await promotion.remove()

			return res.status(200).json({
				success: true,
				message: 'Promotion deleted successfully',
			})
		} catch (error) {
			logger.error('Failed to delete promotion', error)
			return next(new ErrorHandler('Failed to delete promotion', 500))
		}
	}
}

export const adminPromotionController = new AdminPromotionController()
