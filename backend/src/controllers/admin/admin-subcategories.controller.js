import mongoose from 'mongoose'

import { Category, Section } from '../../models/category.js'
import ErrorHandler from '../../utils/error.js'
import { logger } from '../../utils/logger.utils.js'
import { getPagination } from '../../utils/pagination.utils.js'
import { getSorting } from '../../utils/sorting.utils.js'

class AdminSubCategoriesController {
	async getAllSubCategories(req, res, next) {
		try {
			const { page, size, searchValue, sort, paginate, categoryId } = req.query
			const mongoQuery = {}

			if (searchValue) {
				mongoQuery.$or = [{ category: { $regex: new RegExp(searchValue.trim(), 'i') } }]
			}

			if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
				mongoQuery.section = categoryId
			}

			const sortValues = getSorting(sort)
			const pagination = getPagination(page, size, paginate)

			const categories = await Category.paginate(mongoQuery, {
				limit: pagination.limit,
				offset: pagination.offset,
				pagination: pagination.paginate,
				sort: sortValues,
				populate: ['section'],
			})

			return res.status(200).json(categories)
		} catch (error) {
			logger.error('Failed to get sub categories', error)
			return next(new ErrorHandler('Failed to get sub categories', 500))
		}
	}

	async getSubCategoryDetails(req, res, next) {
		const subCategory = await Category.findById(req.params.id)

		if (!subCategory) return next(new ErrorHandler('Sub category not found', 404))

		return res.status(200).json(subCategory)
	}

	async createSubCategory(req, res, next) {
		try {
			const { name, categoryId } = req.body

			const category = await Section.findById(categoryId)
			if (!category) return next(new ErrorHandler('Category not found', 404))

			await Category.create({
				category: name,
				section: category,
			})

			return res.status(200).json({ success: true })
		} catch (error) {
			logger.error('Failed to create sub categories', error)
			return next(new ErrorHandler('Failed to create a sub category', 500))
		}
	}

	async updateSubCategory(req, res, next) {
		try {
			const { name, categoryId } = req.body

			const subCategory = await Category.findById(req.params.id)
			if (!subCategory) return next(new ErrorHandler('Sub category not found', 404))

			if (name) subCategory.category = name
			if (categoryId) {
				const category = await Section.findById(categoryId)
				if (!category) return next(new ErrorHandler('Category not found', 404))

				subCategory.section = category
			}

			await subCategory.save()

			return res.status(200).json({ success: true })
		} catch (error) {
			logger.error('Failed to update sub categories', error)
			return next(new ErrorHandler('Failed to update a sub category', 500))
		}
	}
}

export const adminSubCategoriesController = new AdminSubCategoriesController()
