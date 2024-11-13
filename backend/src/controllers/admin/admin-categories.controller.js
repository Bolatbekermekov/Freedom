import cloudinary from 'cloudinary'

import { Section } from '../../models/category.js'
import ErrorHandler from '../../utils/error.js'
import { getDataUri } from '../../utils/features.js'
import { logger } from '../../utils/logger.utils.js'
import { getPagination } from '../../utils/pagination.utils.js'
import { getSorting } from '../../utils/sorting.utils.js'

class AdminCategoriesController {
	async getAllCategories(req, res, next) {
		try {
			const { page, size, searchValue, sort, paginate } = req.query
			const mongoQuery = {}

			if (searchValue) {
				mongoQuery.$or = [{ section: { $regex: new RegExp(searchValue.trim(), 'i') } }]
			}

			const sortValues = getSorting(sort)
			const pagination = getPagination(page, size, paginate)

			const categories = await Section.paginate(mongoQuery, {
				limit: pagination.limit,
				offset: pagination.offset,
				pagination: pagination.paginate,
				sort: sortValues,
			})

			return res.status(200).json(categories)
		} catch (error) {
			logger.error('Failed to get categories', error)
			return next(new ErrorHandler('Failed to get categories', 500))
		}
	}

	async getCategoryDetails(req, res, next) {
		const section = await Section.findById(req.params.id)

		if (!section) return next(new ErrorHandler('Category not found', 404))

		return res.status(200).json(section)
	}

	async createCategory(req, res, next) {
		try {
			const { name } = req.body

			if (!req.file) return next(new ErrorHandler('Please add image', 400))

			const file = getDataUri(req.file)
			const myCloud = await cloudinary.v2.uploader.upload(file.content)
			const image = {
				public_id: myCloud.public_id,
				url: myCloud.secure_url,
			}

			await Section.create({
				section: name,
				image: image.url,
			})

			return res.status(200).json({ success: true })
		} catch (error) {
			logger.error('Failed to create category', error)
			return next(new ErrorHandler('Failed to create category', 500))
		}
	}

	async updateCategory(req, res, next) {
		try {
			const { name } = req.body

			const section = await Section.findById(req.params.id)
			if (!section) return next(new ErrorHandler('Sections not found', 404))

			if (name) section.section = name

			await section.save()

			return res.status(200).json({ success: true })
		} catch (error) {
			logger.error('Failed to update category', error)
			return next(new ErrorHandler('Failed to update category', 500))
		}
	}
}

export const adminCategoriesController = new AdminCategoriesController()
