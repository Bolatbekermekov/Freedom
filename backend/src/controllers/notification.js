import { asyncError } from '../middlewares/error.js'
import { Notification } from '../models/notification.js'
import ErrorHandler from '../utils/error.js'

export const storeNotification = asyncError(async (req, res, next) => {
	const { token, title, body, data } = req.body

	try {
		const newNotification = new Notification({ token, title, body, data })
		await newNotification.save()
		console.log('Notification stored successfully')
		res.status(201).json({
			success: true,
			notifications: newNotification,
		})
	} catch (error) {
		console.error('Error storing notification:', error)
		next(new ErrorHandler('Error storing notification', 500))
	}
})

export const getNotifications = asyncError(async (req, res, next) => {
	const token = req.params.token

	try {
		const notifications = await Notification.find({ token }).sort({ dateSent: -1 }).limit(20)

		res.status(200).json({
			success: true,
			notifications,
		})
	} catch (error) {
		console.error('Error retrieving notifications:', error)
		next(new ErrorHandler('Error retrieving notifications', 500))
	}
})
