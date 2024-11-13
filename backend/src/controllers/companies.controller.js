import LocalizedError from '../errors/localized-error.js'
import { localizedErrorMessages } from '../errors/localized-messages.js'
import { Company } from '../models/company.model.js'
import { User } from '../models/user.js'
import { companyService } from '../services/company.service.js'
import ErrorHandler from '../utils/error.js'
import { logger } from '../utils/logger.utils.js'

class CompaniesController {
	async getCompanies(req, res, next) {
		try {
			const { searchValue, type } = req.query
			const mongoQuery = {}

			if (searchValue) {
				mongoQuery.$or = [{ name: { $regex: new RegExp(searchValue.trim(), 'i') } }]
			}

			if (type) {
				mongoQuery.type = type
			}

			const companies = await Company.find(mongoQuery)

			res.status(200).json(companies)
		} catch (error) {
			logger.error(error)
			return next(new ErrorHandler('Failed to get companies', 500))
		}
	}

	async getStores(req, res, next) {
		try {
			const { searchValue } = req.query
			const mongoQuery = { type: 'STORE' }

			if (searchValue) {
				mongoQuery.$or = [{ name: { $regex: new RegExp(searchValue.trim(), 'i') } }]
			}

			const companies = await Company.find(mongoQuery)

			res.status(200).json(companies)
		} catch (error) {
			logger.error(error)
			return next(new ErrorHandler('Failed to get companies', 500))
		}
	}

	async getCompany(req, res, next) {
		try {
			const companyId = req.params.id

			const company = await Company.findById(companyId)

			if (!company) {
				return next(new ErrorHandler('Company not found', 404))
			}

			res.status(200).json(company)
		} catch (error) {
			logger.error(error)
			return next(new ErrorHandler('Failed to get company', 500))
		}
	}

	async getCurrentUserCompany(req, res, next) {
		try {
			const currentUser = req.user

			if (!currentUser.company) {
				return next(new ErrorHandler('Current user is missing company', 400))
			}

			const company = await Company.findById(currentUser.company._id)

			if (!company) {
				return next(new ErrorHandler('Company not found', 404))
			}

			res.status(200).json(company)
		} catch (error) {
			logger.error(error)
			return next(new ErrorHandler('Failed to get company', 500))
		}
	}

	async registerCompany(req, res, next) {
		try {
			const {
				name: companyName,
				phone: companyPhone,
				description: companyDescription,
				address: companyAddress,
				city: companyCity,
				iinBin: companyIinBin,
			} = req.body

			const currentUser = await User.findById(req.user._id).populate('company')

			if (currentUser.company)
				return next(new LocalizedError(localizedErrorMessages['400_STORE_ALREADY_EXISTS'], 400))

			const createdCompany = await companyService.createCompany({
				name: companyName,
				phone: companyPhone,
				description: companyDescription,
				address: companyAddress,
				type: 'STORE',
				city: companyCity,
				iinBin: companyIinBin,
			})

			currentUser.company = createdCompany
			currentUser.role = 'admin'
			await currentUser.save()

			return res.status(200).json({ success: true })
		} catch (error) {
			logger.error(error)
			return next(new LocalizedError(localizedErrorMessages['500_STORE_REGISTER_ERROR'], 500))
		}
	}

	async updateCompany(req, res, next) {
		try {
			const companyId = req.params.id
			const currentUserCompany = req.user.company

			if (!currentUserCompany)
				return next(new ErrorHandler('Данный пользователь не имеет магазина', 400))

			if (currentUserCompany._id !== companyId) {
				return next(new ErrorHandler('Данный пользователь не принадлежит данному магазину', 400))
			}

			await companyService.updateCompany(companyId, req.body)

			return res.status(200).json({ success: true })
		} catch (error) {
			logger.error('Failed to update a company', error)
			return next(new LocalizedError(localizedErrorMessages['500_COMPANY_UPDATE_ERROR'], 500))
		}
	}

	async updateCurrentCompany(req, res, next) {
		try {
			const currentUserCompany = req.user.company

			if (!currentUserCompany)
				return next(new ErrorHandler('Данный пользователь не имеет магазина', 400))

			await companyService.updateCompany(currentUserCompany._id, req.body)

			return res.status(200).json({ success: true })
		} catch (error) {
			logger.error('Failed to update current company', error)
			return next(new LocalizedError(localizedErrorMessages['500_COMPANY_UPDATE_ERROR'], 500))
		}
	}
}

export const companiesController = new CompaniesController()
