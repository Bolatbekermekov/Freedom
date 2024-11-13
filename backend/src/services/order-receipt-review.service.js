import fs from 'fs'
import handlebars from 'handlebars'
import path, { dirname } from 'path'
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'

import { OrderReceiptReview } from '../models/order-receipt-review.model.js'
import { Order } from '../models/order.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SAVED_ORDERS_FOLDER = '../../public/purchase-orders'

handlebars.registerHelper('indexPlusOne', function (index) {
	return index + 1
})

class OrderReceiptReviewService {
	async createReview(orderId, userId, comment) {
		try {
			if (!orderId || !userId) {
				throw new Error('Order id and user id are required')
			}

			const existingReview = await OrderReceiptReview.findOne({ orderId, userId })
			if (existingReview) {
				throw new Error('User has already reviewed this order')
			}

			const newReview = new OrderReceiptReview({ orderId, userId, comment })
			await newReview.save()
			return newReview
		} catch (error) {
			throw new Error(`Failed to create review: ${error.message}`)
		}
	}

	async getReviewByOrderIdPopulated(orderId) {
		try {
			const review = await OrderReceiptReview.findOne({ orderId }).populate(['userId', 'orderId'])
			return review
		} catch (error) {
			throw new Error(`Failed to fetch review: ${error.message}`)
		}
	}

	async getReviewByOrderIdRaw(orderId) {
		try {
			const review = await OrderReceiptReview.findOne({ orderId })
			return review
		} catch (error) {
			throw new Error(`Failed to fetch review: ${error.message}`)
		}
	}

	async updateReview(orderId, comment) {
		try {
			const review = await OrderReceiptReview.findOneAndUpdate(
				{ orderId },
				{ comment },
				{
					new: true,
				},
			)

			return review
		} catch (error) {
			throw new Error(`Failed to update review: ${error.message}`)
		}
	}

	async approveReview(orderId, userId, comment) {
		try {
			let review = await this.getReviewByOrderIdRaw(orderId)
			if (!review) {
				review = await this.createReview(orderId, userId, comment)
			}

			review.comment = comment
			review.approved = true

			await review.save()

			const order = await Order.findById(orderId)
			if (!order) {
				throw new Error('Order not found')
			}

			order.orderStatus = 'Preparing'
			await order.save()

			this.saveApprovedFile(orderId)

			return { message: 'Review approved successfully' }
		} catch (error) {
			throw new Error(`Failed to approve review: ${error.message}`)
		}
	}

	async saveApprovedFile(orderId) {
		try {
			const pdfBuffer = await this.generateOrderReceiptPDF(orderId)

			const publicDir = path.join(__dirname, SAVED_ORDERS_FOLDER)

			if (!fs.existsSync(publicDir)) {
				fs.mkdirSync(publicDir, { recursive: true })
			}

			const pdfFileName = `${orderId}.pdf`
			const savePath = path.join(publicDir, pdfFileName)

			fs.writeFileSync(savePath, pdfBuffer)

			return pdfFileName
		} catch (error) {
			throw new Error(`Failed to generate PDF: ${error.message}`)
		}
	}

	async rejectReview(orderId, userId, comment) {
		try {
			let review = await this.getReviewByOrderIdRaw(orderId)
			if (!review) {
				review = await this.createReview(orderId, userId, comment)
			}

			review.comment = comment
			review.approved = false

			await review.save()

			const order = await Order.findById(orderId)
			if (!order) {
				throw new Error('Order not found')
			}

			order.orderStatus = 'REVIEW_REJECTED_BY_USER'
			await order.save()

			return { message: 'Review rejected successfully' }
		} catch (error) {
			throw new Error(`Failed to reject review: ${error.message}`)
		}
	}

	async getOrderReceiptPDF(orderId) {
		try {
			const review = await this.getReviewByOrderIdRaw(orderId)
			const pdfPath = path.join(__dirname, SAVED_ORDERS_FOLDER, `${orderId}.pdf`)

			if (review?.approved) {
				try {
					const existingPdfBuffer = fs.readFileSync(pdfPath)
					return existingPdfBuffer
				} catch (err) {
					if (err.code !== 'ENOENT') {
						throw err
					}
				}
			}

			const pdfBuffer = await this.generateOrderReceiptPDF(orderId)

			return pdfBuffer
		} catch (error) {
			throw new Error(`Failed to generate PDF: ${error.message}`)
		}
	}

	async generateOrderReceiptPDF(orderId) {
		try {
			const order = await Order.findById(orderId).populate([
				'storeCompany',
				'assignee',
				{
					path: 'orderItems.product',
					model: 'Product',
					populate: {
						path: 'company',
						model: 'Company',
					},
				},
			])

			if (!order) {
				throw new Error('Order not found')
			}

			const orderReceiptDTO = this.prepareOrderData(order)

			const pdfBuffer = await this.generatePDF(orderReceiptDTO)

			return pdfBuffer
		} catch (error) {
			throw new Error(`Failed to generate PDF: ${error.message}`)
		}
	}

	prepareOrderData(order) {
		const formatPrice = price => {
			const formatter = new Intl.NumberFormat('ru-RU', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2,
			})
			return formatter.format(price)
		}

		const options = {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		}
		const formatter = new Intl.DateTimeFormat('ru-RU', options)
		const formattedDateWithSuffix = `${formatter.format(order.createdAt)}`

		const emptyFieldPlaceholder = '-'

		return {
			store: {
				name: order.storeCompany.name,
				phone: order.storeCompany.phone,
				address: [
					order.storeCompany.address,
					order.storeCompany.city,
					order.storeCompany.country,
				].join(', '),
			},
			buyer: {
				name: order.customer.name,
				phone: order.customer.phone,
				address: [
					order.shippingInfo.address,
					order.shippingInfo.city,
					order.shippingInfo.country,
				].join(', '),
			},
			bank: {
				name: order.storeCompany?.bankInformation?.bankName ?? '',
				iik: order.storeCompany?.bankInformation?.individualIdentityCode ?? '',
				kbe: order.storeCompany?.bankInformation?.beneficiaryCode ?? '',
				bik: order.storeCompany?.bankInformation?.bankIdentificationCode ?? '',
				payment_code: order.storeCompany?.bankInformation?.paymentCode ?? '',
			},
			goods: order.orderItems.map(item => ({
				code: item.product.productCode,
				name: item.name,
				quantity: item.quantity,
				unit: item.product.measureUnit ?? emptyFieldPlaceholder,
				price: formatPrice(item.product.price),
				total: formatPrice(Number(item.price)),
			})),
			totals: formatPrice(order.totalAmount),
			itemsPrice: formatPrice(order.itemsPrice),
			shippingCharges: order.shippingCharges ? formatPrice(order.shippingCharges) : null,
			discount: {
				percentage: order.shippingCharges ? order.discountPercentage : null,
				price: formatPrice(order.discount ?? 0),
			},
			order: {
				id: order.autoId,
				date: formattedDateWithSuffix,
			},
		}
	}

	async generatePDF(data) {
		try {
			const templatePath = path.join(__dirname, '../views/pdf/order-details.hbs')
			const templateString = fs.readFileSync(templatePath, 'utf8')

			const template = handlebars.compile(templateString)
			const html = template(data)

			const browser = await puppeteer.launch({
				headless: true,
				args: ['--no-sandbox', '--disabled-setupid-sandbox'],
				ignoreDefaultArgs: ['--disable-extensions'],
			})

			const page = await browser.newPage()
			await page.setContent(html)

			const pdfBuffer = await page.pdf({
				format: 'A4',
				printBackground: true,
				margin: {
					top: '30px',
					bottom: '30px',
					left: '30px',
					right: '30px',
				},
			})

			await browser.close()
			return pdfBuffer
		} catch (error) {
			throw new Error(`Failed to generate PDF: ${error.message}`)
		}
	}
}

export const orderReceiptReviewService = new OrderReceiptReviewService()
