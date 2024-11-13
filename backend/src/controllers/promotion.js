import { asyncError } from '../middlewares/error.js'
import { Promotion } from '../models/promotion.js'
import { UserPromotion } from '../models/userpromotion.js'
import ErrorHandler from '../utils/error.js'
import { logger } from '../utils/logger.utils.js'

export async function checkPromoCode(userId, promoCode, companies) {
	try {
		const currentDate = new Date()

		const promotions = await Promotion.find({
			promoCode,
			company: { $in: companies },
			isActive: true,
			startDate: { $lte: currentDate },
			endDate: { $gte: currentDate },
		})

		if (!promotions.length) {
			throw new Error('Промокод не найден или не активен для указанных компаний.')
		}

		for (const promotion of promotions) {
			let userPromotion = await UserPromotion.findOne({ user: userId, promotion: promotion._id })
			if (!userPromotion) {
				userPromotion = new UserPromotion({
					user: userId,
					promotion: promotion._id,
					usedCount: 0,
				})
			}

			if (userPromotion.usedCount <= promotion.maxUsage) {
				return {
					success: true,
					message: 'Промокод валиден!',
					description: promotion.description,
					discountPercentage: promotion.discountPercentage,
					promoCode,
					company: promotion.company,
				}
			}
		}

		throw new Error('Все доступные промокоды были использованы максимальное количество раз.')
	} catch (error) {
		return { success: false, message: `Ошибка: ${error.message}` }
	}
}

export async function usePromoCode(userId, promoCode, companies) {
	try {
		const currentDate = new Date()

		const promotions = await Promotion.find({
			promoCode,
			company: { $in: companies },
			isActive: true,
			startDate: { $lte: currentDate },
			endDate: { $gte: currentDate },
		})

		if (!promotions.length) {
			throw new Error('Промокод не найден или не активен для указанных компаний.')
		}

		for (const promotion of promotions) {
			let userPromotion = await UserPromotion.findOne({ user: userId, promotion: promotion._id })
			if (!userPromotion) {
				userPromotion = new UserPromotion({
					user: userId,
					promotion: promotion._id,
					usedCount: 0,
				})
			}

			if (userPromotion.usedCount >= promotion.maxUsage) {
				continue
			}

			userPromotion.usedCount += 1
			userPromotion.lastUsedAt = new Date()
			await userPromotion.save()

			return {
				success: true,
				promotionId: promotion._id,
				message: 'Промокод успешно использован!',
				description: promotion.description,
				discountPercentage: promotion.discountPercentage,
				promoCode: promoCode,
				company: promotion.company,
			}
		}

		throw new Error('Все доступные промокоды были использованы максимальное количество раз.')
	} catch (error) {
		return { success: false, message: `Ошибка: ${error.message}` }
	}
}

export const applyPromocode = asyncError(async (req, res, next) => {
	const { promoCode, companies } = req.body
	const userId = req.user._id

	try {
		const result = await checkPromoCode(userId, promoCode, companies)
		if (result.success) {
			return res.status(200).json({ success: true, result })
		} else {
			return res.status(400).json(result)
		}
	} catch (error) {
		logger.error('Failed to apply promocode', error)
		return res.status(500).json({ message: error.message })
	}
})

export const generatePromotionCode = asyncError(async (req, res, next) => {
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

	res.status(201).json({
		success: true,
		promotion,
	})
})

export const getPromotionsByCity = asyncError(async (req, res, next) => {
	const { city } = req.query

	if (!city) return next(new ErrorHandler('City is required', 400))

	const promotion = await Promotion.find({
		promotionType: 'automatic',
		applicableCities: city,
		isActive: true,
	})
	if (!promotion) {
		throw new Error('Промокод не найден или не активен.')
	}

	res.status(200).json({
		success: true,
		promotion,
	})
})

export const getCompanyPromotions = asyncError(async (req, res, next) => {
	const companyId = req.user.company

	if (!companyId) return next(new ErrorHandler('Company ID is required', 400))

	const promotions = await Promotion.find({ company: companyId })

	res.status(200).json({
		success: true,
		promotions,
	})
})

export const updatePromotion = asyncError(async (req, res, next) => {
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

	res.status(200).json({
		success: true,
		promotion,
	})
})

export const deletePromotion = asyncError(async (req, res, next) => {
	const { promoId } = req.params
	const companyId = req.user.company

	const promotion = await Promotion.findOne({ _id: promoId, company: companyId })

	if (!promotion) return next(new ErrorHandler('Promotion not found', 404))

	await promotion.remove()

	res.status(200).json({
		success: true,
		message: 'Promotion deleted successfully',
	})
})
