import cloudinary from 'cloudinary'

import { asyncError } from '../../middlewares/error.js'
import { SupportMessage } from '../../models/supportMessage.js'
import { User } from '../../models/user.js'
import ErrorHandler from '../../utils/error.js'
import {
	addPushToken,
	cookieOptions,
	getDataUri,
	sendSMS,
	sendToken,
} from '../../utils/features.js'
import { logger } from '../../utils/logger.utils.js'

export const login = asyncError(async (req, res, next) => {
	const { phone, password, pushToken } = req.body
	const user = await User.findOne({ phone }).select('+password')

	if (!user) {
		return next(new ErrorHandler('Incorrect Phone or Password', 400))
	}

	if (!password) return next(new ErrorHandler('Please Enter Password', 400))

	// Handle error
	const isMatched = await user.comparePassword(password)

	if (!isMatched) {
		return next(new ErrorHandler('Incorrect Phone or Password', 400))
	}
	if (pushToken) addPushToken(pushToken, user._id)

	return sendToken(user, res, `Welcome Back, ${user.name}`, 200)
})

export const signup = asyncError(async (req, res, next) => {
	const { name, phone, password, pushToken } = req.body
	let user = await User.findOne({ phone })

	if (user) return next(new ErrorHandler('User Already Exist', 400))

	let avatar = undefined

	if (req.file) {
		const file = getDataUri(req.file)
		const myCloud = await cloudinary.v2.uploader.upload(file.content)
		avatar = {
			public_id: myCloud.public_id,
			url: myCloud.secure_url,
		}
	}

	user = await User.create({
		avatar,
		name,
		phone,
		password,
	})

	if (pushToken) addPushToken(pushToken, user._id)

	return sendToken(user, res, 'Registered Successfully', 201)
})

export const logOut = asyncError(async (req, res, next) => {
	res
		.status(200)
		.cookie('token', '', {
			...cookieOptions(),
			expires: new Date(Date.now()),
		})
		.json({
			success: true,
			message: 'Logged Out Successfully',
		})
})

export const getMyProfile = asyncError(async (req, res, next) => {
	const user = await User.findById(req.user._id)
	res.status(200).json({
		success: true,
		user,
	})
})

export const updateProfile = asyncError(async (req, res, next) => {
	const user = await User.findById(req.user._id)

	const { name, phone } = req.body

	if (name) user.name = name
	if (phone) user.phone = phone

	await user.save()

	res.status(200).json({
		success: true,
		message: 'Profile Updated Successfully',
	})
})

export const changePassword = asyncError(async (req, res, next) => {
	const user = await User.findById(req.user._id).select('+password')

	const { oldPassword, newPassword } = req.body

	if (!oldPassword || !newPassword)
		return next(new ErrorHandler('Please Enter Old Password & New Password', 400))

	const isMatched = await user.comparePassword(oldPassword)

	if (!isMatched) return next(new ErrorHandler('Incorrect Old Password', 400))

	user.password = newPassword
	await user.save()

	res.status(200).json({
		success: true,
		message: 'Password Changed Successully',
	})
})

export const updatePic = asyncError(async (req, res, next) => {
	const user = await User.findById(req.user._id)
	const file = getDataUri(req.file)

	if (user.avatar.public_id) await cloudinary.v2.uploader.destroy(user.avatar.public_id)

	const myCloud = await cloudinary.v2.uploader.upload(file.content)
	user.avatar = {
		public_id: myCloud.public_id,
		url: myCloud.secure_url,
	}

	await user.save()

	res.status(200).json({
		success: true,
		message: 'Avatar Updated Successfully',
	})
})

export const forgetpassword = asyncError(async (req, res, next) => {
	const { phone } = req.body
	const user = await User.findOne({ phone })

	if (!user) return next(new ErrorHandler('Incorrect phone', 404))
	// max,min 2000,10000
	// math.random()*(max-min)+min

	const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
	const otp = Math.floor(randomNumber)
	const otp_expire = 15 * 60 * 1000

	user.otp = otp
	user.otp_expire = new Date(Date.now() + otp_expire)
	await user.save()

	const message = `Код подтверждения для входа в DentX: ${otp}. Не передавайте код никому.`
	try {
		// change to send text message
		await sendSMS(user.phone, message)
	} catch (error) {
		user.otp = null
		user.otp_expire = null
		await user.save()
		return next(error)
	}

	res.status(200).json({
		success: true,
		message: `SMS Sent To ${user.phone}`,
	})
})

export const resetpassword = asyncError(async (req, res, next) => {
	const { otp, password } = req.body

	const user = await User.findOne({
		otp,
		otp_expire: {
			$gt: Date.now(),
		},
	})

	if (!user) return next(new ErrorHandler('Incorrect OTP or has been expired', 400))

	if (!password) return next(new ErrorHandler('Please Enter New Password', 400))

	user.password = password
	user.otp = undefined
	user.otp_expire = undefined

	await user.save()

	res.status(200).json({
		success: true,
		message: 'Password Changed Successfully, You can login now',
	})
})

export const deleteUser = async (req, res, next) => {
	try {
		const userId = req.user._id

		if (!userId) {
			return next(new ErrorHandler('User ID not provided', 400))
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				// Set other fields as needed
				avatar: null,
				name: null,
				password: null,
				pushToken: null,
				phone: userId,
				role: null,
				otp: null,
				otp_expire: null,
			},
			{ new: true },
		)

		if (!updatedUser) {
			return next(new ErrorHandler('User not found', 404))
		}

		res.status(200).json({
			success: true,
			message: 'User information has been anonymized successfully.',
		})
	} catch (error) {
		logger.error('Failed to update user', error)
		return next(new ErrorHandler(error.message || 'Internal Server Error', 500))
	}
}

export const submitMessage = asyncError(async (req, res, next) => {
	const { name, contact, message } = req.body

	if (!name || !contact || !message) return res.redirect('/error')

	await SupportMessage.create({ name, contact, message })

	res.redirect('/thankyou')
})
