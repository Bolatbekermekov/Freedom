import DataUriParser from 'datauri/parser.js'
import { Expo } from 'expo-server-sdk'
import { createTransport } from 'nodemailer'
import path from 'path'

import { Notification } from '../models/notification.js'
import { Product } from '../models/product.js'
import { PushToken } from '../models/user.js'

import { logger } from './logger.utils.js'
import SMSApi from './smsc_api.js'

export const TOKEN_EXPIRATION = 6 * 30 * 24 * 60 * 60 * 1000
const expo = new Expo({
	useFcmV1: true,
})

export const getDataUri = file => {
	const parser = new DataUriParser()
	const extName = path.extname(file.originalname).toString()
	return parser.format(extName, file.buffer)
}

export const sendToken = (user, res, message, statusCode) => {
	const token = user.generateToken()

	return res
		.status(statusCode)
		.cookie('token', token, {
			...cookieOptions(),
			expires: new Date(Date.now() + TOKEN_EXPIRATION),
		})
		.json({
			success: true,
			message: message,
			token: token,
		})
}

export const cookieOptions = () => ({
	secure: process.env.NODE_ENV !== 'Development',
	httpOnly: true,
	sameSite: 'lax',
})

export const sendEmail = async (subject, to, text) => {
	const transporter = createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	})

	await transporter.sendMail({
		to,
		subject,
		text,
	})
}

export const sendSMS = async (phone, message) => {
	SMSApi.configure({
		login: process.env.SMSC_LOGIN,
		password: process.env.SMSC_PASSWORD,
		//ssl : true/false,
		//charset : 'utf-8',
	})

	console.log(message)
	SMSApi.send_sms(
		{
			phones: [phone],
			mes: message,
		},
		function (data, raw, err, code) {
			if (err) return console.log(err, `code: ${code}`)
			console.log(data) // object
			console.log(raw) // string in JSON format
		},
	)
}
const generateRandomString = length => {
	const characters = '0123456789'
	let result = ''
	const charactersLength = characters.length
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

const checkBarcodes = async barcodes => {
	const existingBarcodes = await Product.find({
		barcode: { $in: barcodes },
	}).select('barcode -_id')
	return new Set(existingBarcodes.map(p => p.barcode))
}

export const generateUniqueBarcode = async () => {
	let uniqueBarcode = ''
	const batchSize = 10
	while (!uniqueBarcode) {
		const barcodes = Array.from({ length: batchSize }, () => generateRandomString(15))
		const existingSet = await checkBarcodes(barcodes)
		uniqueBarcode = barcodes.find(code => !existingSet.has(code))
	}
	return uniqueBarcode
}
export const addPushToken = async (token, userId) => {
	const existingToken = await PushToken.findOne({ token, userId })
	if (!existingToken) {
		const newToken = new PushToken({ token, userId })
		await newToken.save()
	}
}

let badgeCounts = {}

const sendPushNotifications = async (tokens, title, body, data, redirectTo) => {
	let messages = []
	for (const token of tokens) {
		if (!Expo.isExpoPushToken(token)) {
			logger.error(`Push token ${token} is not a valid Expo push token`)
			continue
		}
		const badgeCount = badgeCounts[token] || 0

		const payload = {
			to: token,
			sound: 'default',
			title: title,
			badge: badgeCount + 1,
			body: body,
			data: {
				'content-available': 1,
				redirect_to: redirectTo,
				...data,
			},
		}

		messages.push(payload)
		badgeCounts[token] = badgeCount + 1

		try {
			const newNotification = new Notification({ token, title, body, data })
			await newNotification.save()
			console.log('Notification stored successfully')
		} catch (error) {
			console.error('Error storing notification:', error)
		}
	}

	const chunks = expo.chunkPushNotifications(messages)
	const tickets = []
	for (const chunk of chunks) {
		try {
			const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
			tickets.push(...ticketChunk)
		} catch (error) {
			logger.error('Error sending push notifications:', error)
		}
	}
}

const sendNotification = async (pushTokens, title, body, data, redirectTo) => {
	try {
		await sendPushNotifications(pushTokens, title, body, data, redirectTo)
	} catch (error) {
		console.error('Failed to send notification:', error)
	}
}

export const sendOrderStatusNotification = async (pushTokens, status, orderItemsNames) => {
	const title = 'Обновление статуса заказа'
	const body = `Статус: ${status}`
	const data = { orderItemsNames }
	const redirectTo = 'orders'
	await sendNotification(pushTokens, title, body, data, redirectTo)
}

export const newOrderNotification = async (pushTokens, name, phone, orderItemsNames) => {
	const title = 'Новый заказ'
	const body = `Клиент: ${name}, Телефон: ${phone}`
	const data = { orderItemsNames }
	const redirectTo = 'adminorders'
	await sendNotification(pushTokens, title, body, data, redirectTo)
}

export const sendUserOrderConfirmationNotification = async (pushTokens, orderItemsNames) => {
	const title = 'Подтвердите счет на оплату'
	const body = 'Ваш заказ был успешно создан. Пожалуйста, подтвердите счет на оплату.'
	const data = { orderItemsNames }
	const redirectTo = 'orders'
	await sendNotification(pushTokens, title, body, data, redirectTo)
}

export const sendReviewApprovedNotification = async (
	customerName,
	customerPhone,
	orderItemsNames,
	pushTokens,
) => {
	const title = 'Счет на оплату одобрен'
	const body = `Клиент: ${customerName}, Телефон: ${customerPhone}`
	const data = { customerName, customerPhone, orderItemsNames }
	const redirectTo = 'adminorders'
	await sendNotification(pushTokens, title, body, data, redirectTo)
}

export const sendReviewRejectedNotification = async (
	orderId,
	customerName,
	customerPhone,
	orderItemsNames,
	pushTokens,
) => {
	const title = 'Счет на оплату отклонен'
	const body = `Клиент: ${customerName}, Телефон: ${customerPhone}`
	const data = { orderId, customerName, customerPhone, orderItemsNames }
	const redirectTo = 'adminorders'
	await sendNotification(pushTokens, title, body, data, redirectTo)
}

export const resetBadgeCount = token => {
	try {
		if (token in badgeCounts) {
			badgeCounts[token] = 0
		}
	} catch (error) {
		logger.error('Error on reset badge count', error)
	}
}
