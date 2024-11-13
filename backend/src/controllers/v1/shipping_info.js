import { asyncError } from '../../middlewares/error.js'
import { ShippingInfo } from '../../models/shipping_info.js'
// Make sure this path matches where your model is located
import ErrorHandler from '../../utils/error.js'

// Fetch all shipping information entries
export const getAllShippingInfo = asyncError(async (req, res, next) => {
	const user = req.params.user
	const shippingInfos = await ShippingInfo.find({ user }).populate('user')
	res.status(200).json({
		success: true,
		shippingInfos,
	})
})

// Fetch a single shipping information entry by user ID
export const myShippingInfos = asyncError(async (req, res, next) => {
	const shippingInfo = await ShippingInfo.find({ user: req.user._id }).populate('user')
	if (!shippingInfo) return next(new ErrorHandler('Shipping information not found', 404))
	res.status(200).json({
		success: true,
		shippingInfo,
	})
})

// Create a new shipping information entry
export const createShippingInfo = asyncError(async (req, res, next) => {
	const { address, country, city } = req.body
	const info = await ShippingInfo.findOne({ user: req.user._id })
	let isDefault = false
	if (!info) {
		isDefault = true
	}
	await ShippingInfo.create({
		user: req.user._id,
		address,
		country,
		city,
		isDefault,
	})
	res.status(201).json({
		success: true,
		message: 'ShippingInfo Created Successfully',
	})
})

// Update a single shipping information entry by its ID
export const updateSingleShippingInfo = asyncError(async (req, res, next) => {
	const { address, country, city } = req.body
	if (!address || !country || !city) {
		return next(new ErrorHandler('Plese provide all info', 400))
	}
	const shippingInfo = await ShippingInfo.findById(req.params.id)
	if (!shippingInfo) return next(new ErrorHandler('Shipping information not found', 404))

	if (address) shippingInfo.address = address
	if (country) shippingInfo.country = country
	if (city) shippingInfo.city = city

	await shippingInfo.save()

	res.status(200).json({
		success: true,
		message: 'ShippingInfo Updated Successfully',
	})
})

// Delete a single shipping information entry by its ID
export const deleteSingleShippingInfo = asyncError(async (req, res, next) => {
	const shippingInfo = await ShippingInfo.findById(req.params.id)
	if (!shippingInfo) return next(new ErrorHandler('Shipping information not found', 404))

	const wasDefault = shippingInfo.isDefault
	await shippingInfo.remove()

	// If the deleted address was the default, set another one as default (if exists)
	if (wasDefault) {
		const nextDefaultInfo = await ShippingInfo.findOne({ user: req.user._id })
		if (nextDefaultInfo) {
			nextDefaultInfo.isDefault = true
			nextDefaultInfo.save()
		}
	}

	res.status(200).json({
		success: true,
		message: 'Shipping information deleted successfully',
	})
})
export const setDefaultShippingInfo = asyncError(async (req, res, next) => {
	let shippingInfo = await ShippingInfo.findOne({
		user: req.user._id,
		isDefault: true,
	})
	if (shippingInfo) {
		shippingInfo.isDefault = false
		await shippingInfo.save()
	}
	shippingInfo = await ShippingInfo.findById(req.params.id)
	shippingInfo.isDefault = true
	await shippingInfo.save()
	res.status(200).json({
		success: true,
		message: 'Set Default Shipping information updated successfully',
	})
})
