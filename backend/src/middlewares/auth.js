import jwt from 'jsonwebtoken'

import { ROLES, ROLES_LIST, User } from '../models/user.js'
import { usersService } from '../services/users.service.js'
import ErrorHandler from '../utils/error.js'

import { asyncError } from './error.js'

export const isAuthenticated = asyncError(async (req, res, next) => {
	try {
		const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

		if (!token) {
			throw new ErrorHandler('Token not found', 401)
		}

		const decodedData = jwt.verify(token, process.env.JWT_SECRET)

		if (!decodedData || !decodedData._id) {
			throw new ErrorHandler('Invalid Token', 401)
		}

		const user = await usersService.getById(decodedData._id)

		req.user = user
		next()
	} catch (error) {
		next(new ErrorHandler(error.message, 401))
	}
})

export const isAdmin = asyncError(async (req, res, next) => {
	if (req.user.role !== ROLES.ADMIN) return next(new ErrorHandler('Only Admin allowed', 401))
	next()
})

export const hasRoles = (...roles) => {
	return asyncError(async (req, res, next) => {
		if (roles.some(role => !ROLES_LIST.includes(role))) {
			return next(new ErrorHandler('Role does not exist', 401))
		}

		if (!roles.includes(req.user.role)) return next(new ErrorHandler('Permissions denied', 401))

		next()
	})
}

export const getUserInfo = asyncError(async (req, res, next) => {
	const { token } = req.cookies

	if (!token) return next()

	const decodedData = jwt.verify(token, process.env.JWT_SECRET)

	req.user = await User.findById(decodedData._id).populate('company')

	next()
})
