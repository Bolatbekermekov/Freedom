import cloudinary from 'cloudinary'

import { User } from '../../models/user.js'
import { companyService } from '../../services/company.service.js'
import ErrorHandler from '../../utils/error.js'
import { getDataUri, sendToken } from '../../utils/features.js'
import { logger } from '../../utils/logger.utils.js'
import { getPagination } from '../../utils/pagination.utils.js'
import { getSorting } from '../../utils/sorting.utils.js'

class AdminUsersController {
	async getAllCompanyMembers(req, res, next) {
		try {
			const { page, size, searchValue, sort, paginate } = req.query
			const currentUser = req.user

			const mongoQuery = {
				company: currentUser.company,
			}

			if (searchValue) {
				mongoQuery.$or = [{ name: { $regex: new RegExp(searchValue.trim(), 'i') } }]
			}

			const sorting = getSorting(sort)
			const pagination = getPagination(page, size, paginate)

			const users = await User.paginate(mongoQuery, {
				limit: pagination.limit,
				offset: pagination.offset,
				pagination: pagination.paginate,
				sort: sorting,
			})

			return res.status(200).json(users)
		} catch (error) {
			logger.error('Failed to get members', error)
			return next(new ErrorHandler('Failed to get members', 500))
		}
	}

	async addCompanyMember(req, res, next) {
		try {
			const { name, phone, password } = req.body
			const currentUser = req.user
			const company = currentUser.company

			const candidate = await User.findOne({ phone })
			if (candidate) return next(new ErrorHandler('User Already Exist', 400))

			const user = await User.create({
				name,
				phone,
				password,
				company,
				role: 'admin',
			})

			return res.status(200).json(user)
		} catch (error) {
			logger.error('Failed to create member', error)
			return next(new ErrorHandler('Failed to add new member', 500))
		}
	}

	async getAllUsers(req, res, next) {
		try {
			const { page, size, searchValue, sort, paginate } = req.query
			const mongoQuery = {}

			if (searchValue) {
				mongoQuery.$or = [{ name: { $regex: new RegExp(searchValue.trim(), 'i') } }]
			}

			const sorting = getSorting(sort)
			const pagination = getPagination(page, size, paginate)

			const users = await User.paginate(mongoQuery, {
				limit: pagination.limit,
				offset: pagination.offset,
				pagination: pagination.paginate,
				sort: sorting,
			})

			return res.status(200).json(users)
		} catch (error) {
			logger.error('Failed to get users', error)
			return next(new ErrorHandler('Failed to get users', 500))
		}
	}

	async addUser(req, res, next) {
		try {
			const { name, phone, password, company } = req.body

			const candidate = await User.findOne({ phone })
			if (candidate) return next(new ErrorHandler('User Already Exist', 400))

			const createdCompany = await companyService.createCompany(company)

			const user = await User.create({
				name,
				phone,
				password,
				company: createdCompany,
			})

			return res.status(200).json(user)
		} catch (error) {
			logger.error('Failed to add new users', error)
			return next(new ErrorHandler('Failed to add user', 500))
		}
	}

	async signup(req, res, next) {
		const {
			name,
			phone,
			password,
			company: {
				name: companyName,
				phone: companyPhone,
				description: companyDescription,
				address: companyAddress,
				type: companyType,
				city: companyCity,
			},
		} = req.body

		const foundUser = await User.findOne({ phone })

		if (foundUser) return next(new ErrorHandler('User Already Exist', 400))

		const createdCompany = await companyService.createCompany({
			name: companyName,
			phone: companyPhone,
			description: companyDescription,
			address: companyAddress,
			type: companyType,
			city: companyCity,
		})

		let avatar
		if (req.file) {
			const file = getDataUri(req.file)
			const myCloud = await cloudinary.v2.uploader.upload(file.content)
			avatar = {
				public_id: myCloud.public_id,
				url: myCloud.secure_url,
			}
		}

		const createdUser = await User.create({
			avatar,
			name,
			phone,
			password,
			company: createdCompany,
			role: 'admin',
		})

		return sendToken(createdUser, res, 'Registered Successfully', 201)
	}

	async login(req, res, next) {
		const { phone, password } = req.body

		const user = await User.findOne({ phone }).select('+password')

		if (!user) {
			return next(new ErrorHandler('Incorrect Phone or Password', 400))
		}

		if (!password) return next(new ErrorHandler('Please Enter Password', 400))

		const isMatched = await user.comparePassword(password)

		if (!isMatched) {
			return next(new ErrorHandler('Incorrect Phone or Password', 400))
		}

		return sendToken(user, res, `Welcome Back, ${user.name}`, 200)
	}
}

export const adminUsersController = new AdminUsersController()
