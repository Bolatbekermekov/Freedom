import mongoose from 'mongoose'
import natural from 'natural'

import { asyncError } from '../middlewares/error.js'
import { Category, Section } from '../models/category.js'
import { Product, RecentProduct } from '../models/product.js'
import { SearchQuery } from '../models/searchquery.js'
import { User } from '../models/user.js'
import { imagesService } from '../services/images.service.js'
import ErrorHandler from '../utils/error.js'
import { logger } from '../utils/logger.utils.js'
import { getSorting } from '../utils/sorting.utils.js'
import { rm } from 'fs/promises'

const saveProductImage = (productCode, file) => {
	imagesService.saveImage(`products/${productCode}`, file)
	const imagePath = `images/products/${productCode}/${file.originalname}`

	return imagePath
}

const getScoredProducts = (products, searchValue, percentile = 0.5) => {
	const tokenizer = new natural.WordTokenizer()
	const queryTokens = tokenizer.tokenize(searchValue.toLowerCase())

	const weights = {
		name: 4,
		description: 3,
		extraDescription: 2,
		labels: 1,
	}

	const scoredProducts = products
		.map(product => {
			let score = 0
			let maxMatchDistance = Infinity

			const fields = [
				product.name,
				product.description,
				product.extraDescription || '',
				product.labels || '',
			]

			const aggregatedText = fields.join(' ').toLowerCase()
			const documentWords = aggregatedText.split(/\s+/)

			queryTokens.forEach(token => {
				let minDistance = Infinity

				documentWords.forEach((word, index) => {
					if (word.includes(token)) {
						const distance = Math.abs(index - aggregatedText.indexOf(token))
						minDistance = Math.min(minDistance, distance)
					}
				})

				const fieldScore =
					weights[Object.keys(weights).find(field => aggregatedText.startsWith(`${field} `))] || 1
				score += (minDistance === Infinity ? 0 : 1 / minDistance) * fieldScore
				maxMatchDistance = Math.min(maxMatchDistance, minDistance)
			})

			product.matchScore = score
			product.maxMatchDistance = maxMatchDistance

			return product
		})
		.sort((a, b) => b.matchScore - a.matchScore)

	if (scoredProducts.length === 0) return []

	const thresholdIndex = Math.ceil(scoredProducts.length * percentile) - 1
	const thresholdScore = scoredProducts[thresholdIndex].matchScore

	return scoredProducts.filter(product => product.matchScore >= thresholdScore)
}

export const getAllProducts = asyncError(async (req, res, next) => {
	try {
		const { keyword, category } = req.query
		let queryTokens = []

		// Tokenize the query
		if (keyword) {
			const tokenizer = new natural.WordTokenizer()
			queryTokens = tokenizer.tokenize(keyword.toLowerCase() || '')
		}

		// Compute TF-IDF scores for the query
		const tfidf = new natural.TfIdf()
		if (queryTokens.length > 0) tfidf.addDocument(queryTokens)

		// Find products matching the category
		const query = category ? { category } : {}
		const products = await Product.find(query)

		if (keyword && keyword.trim() !== '') {
			const searchQueryData = {
				query: keyword,
				user: req.user, // Добавление userId к данным запроса
			}
			await SearchQuery.create(searchQueryData)
		}

		// Compute TF-IDF scores for each product based on aggregated text
		const productsWithScores = products.map(product => {
			const aggregatedText = `${product.name} ${product.description} ${product.labels}`
			const documentWords = aggregatedText.toLowerCase().split(/\s+/)

			let score = 0

			// Calculate the score based on the presence and frequency of query tokens in the document
			queryTokens.forEach(token => {
				// Check if the word contains part of the token
				documentWords.forEach(word => {
					if (word.includes(token)) {
						score += 0.5 // Increase the score for partial matches
					}
				})

				// Calculate the frequency of the token within the document
				const tokenFrequency = documentWords.filter(word => word.includes(token)).length
				if (tokenFrequency > 0) {
					// Increase the score based on token frequency
					score += tokenFrequency * 0.5 // Adjust the score multiplier as needed
				}
			})

			// Assign the score to the product
			product.tfidfScore = score
			return product
		})

		// Filter products based on TF-IDF score relevance to the query
		const filteredProducts = productsWithScores.filter(
			product => queryTokens.length === 0 || product.tfidfScore > 0,
		)

		// // Sort products by TF-IDF score in descending order if queryTokens are provided
		// if (queryTokens.length > 0) {
		//   filteredProducts.sort((a, b) => b.tfidfScore - a.tfidfScore);
		// }

		// After scoring, use MongoDB's aggregation to group by name and count variants
		const ids = filteredProducts.map(product => product._id) // Extract ids of relevant products

		const aggregationPipeline = [
			{ $match: { _id: { $in: ids } } }, // Filter by the relevant products only
			{
				$group: {
					_id: '$name',
					firstProductId: { $first: '$_id' },
					count: { $sum: 1 },
					firstProduct: { $first: '$$ROOT' },
				},
			},
			{
				$addFields: {
					'firstProduct.count': '$count',
				},
			},
			{ $replaceRoot: { newRoot: '$firstProduct' } },
			{
				$sort: {
					tfidfScore: -1,
					name: 1,
				},
			},
		]
		const groupedProducts = await Product.aggregate(aggregationPipeline)

		res.status(200).json({
			success: true,
			products: groupedProducts,
		})
	} catch (error) {
		next(error) // Forward error to the global error handler
	}
})

export const searchProducts = async (req, res, next) => {
	try {
		const { searchValue, sort, subCategoryId, minPrice, maxPrice, companyId } = req.query
		const mongoQuery = {
			$or: [{ hidden: false }, { hidden: { $exists: false } }],
		}

		if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
			mongoQuery.category = mongoose.Types.ObjectId(subCategoryId)
		}
		if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
			mongoQuery.company = mongoose.Types.ObjectId(companyId)
		}
		if (minPrice && !isNaN(minPrice)) {
			mongoQuery.price = { ...mongoQuery.price, $gte: Number(minPrice) }
		}
		if (maxPrice && !isNaN(maxPrice)) {
			mongoQuery.price = { ...mongoQuery.price, $lte: Number(maxPrice) }
		}

		if (searchValue) {
			if (req.user) {
				await SearchQuery.create({ query: searchValue.trim(), user: req.user })
			}

			const searchValueRegex = new RegExp(searchValue.trim(), 'i')
			mongoQuery.$or = [
				{ name: searchValueRegex },
				{ description: searchValueRegex },
				{ labels: searchValueRegex },
				{ extraDescription: searchValueRegex },
			]
		}
		const pipeline = [
			{ $match: mongoQuery },
			{
				$addFields: {
					lowercaseName: { $toLower: '$name' },
				},
			},
			{
				$group: {
					_id: { lowercaseName: '$lowercaseName', companyId: '$company' },
					firstProduct: { $first: '$$ROOT' },
					count: { $sum: 1 },
				},
			},
			{ $addFields: { 'firstProduct.count': '$count' } },
			{ $replaceRoot: { newRoot: '$firstProduct' } },
			{
				$lookup: {
					from: 'companies',
					localField: 'company',
					foreignField: '_id',
					as: 'company',
				},
			},
			{
				$unwind: {
					path: '$company',
					preserveNullAndEmptyArrays: true,
				},
			},
			// {
			// 	$group: {
			// 		_id: '$company._id',
			// 		companyName: { $first: '$company.name' },
			// 		products: { $push: '$$ROOT' },
			// 	},
			// },
			{
				$addFields: {
					id: '$_id',
				},
			},
			{ $sort: getSorting(sort) },
		]

		let products = await Product.aggregate(pipeline)
		if (searchValue) {
			products = getScoredProducts(products, searchValue)
		}

		return res.status(200).json(products)
	} catch (error) {
		logger.error(error)
		return next(new ErrorHandler('Failed to get products', 500))
	}
}

export const getAdminProducts = asyncError(async (req, res, next) => {
	try {
		const products = await Product.find({}).populate('category')

		// Проверяем, что products действительно является массивом
		if (!Array.isArray(products)) {
			return res.status(500).json({
				success: false,
				message: 'Failed to retrieve products',
			})
		}

		const outOfStock = products.filter(i => i.stock === 0)

		res.status(200).json({
			success: true,
			products,
			outOfStock: outOfStock.length,
			inStock: products.length - outOfStock.length,
		})
	} catch (error) {
		logger.error(error)
		next(error)
	}
})

export const getProductDetails = asyncError(async (req, res, next) => {
	const product = await Product.findById(req.params.id).populate('category').populate('company')
	if (!product) return next(new ErrorHandler('Product not found', 404))

	res.status(200).json({
		success: true,
		product,
	})
})

export const getProductsByName = asyncError(async (req, res, next) => {
	const product = await Product.findById(req.params.id)

	if (!product) return next(new ErrorHandler('Product not found', 404))

	if (req.user && product) {
		await addRecentProduct(req.user._id, product._id, next)
	}

	const products = await Product.find({ name: product.name, company: product.company }).populate(
		'company',
	)

	res.status(200).json({
		success: true,
		products,
	})
})

export const createProduct = async (req, res, next) => {
	try {
		const {
			name,
			description,
			category,
			price,
			stock,
			productCode,
			size,
			color,
			country,
			manufacturer,
			packageSize,
			onecname,
			extraDescription,
			labels,
		} = req.body

		const currentUser = await User.findById(req.user._id)

		if (!req.file) return next(new ErrorHandler('Please add image', 400))

		const imagePath = saveProductImage(productCode, req.file)

		const characteristics = new Map()
		if (color) characteristics.set('color', color)
		if (size) characteristics.set('size', size)
		if (country) characteristics.set('country', country)
		if (manufacturer) characteristics.set('manufacturer', manufacturer)
		if (packageSize) characteristics.set('packageSize', packageSize)

		await Product.create({
			name,
			description,
			productCode,
			category,
			price,
			stock,
			size,
			color,
			images: [imagePath],
			characteristics,
			onecname,
			extraDescription,
			labels,
			company: currentUser.company,
		})
		res.status(200).json({
			success: true,
			message: 'Product Created Successfully',
		})
	} catch (error) {
		logger.error(error)
		return next(new ErrorHandler('Product creation failed', 500))
	}
}

export const updateProduct = asyncError(async (req, res, next) => {
	const {
		name,
		description,
		category,
		price,
		stock,
		productCode,
		size,
		color,
		onecname,
		extraDescription,
		labels,
		country,
		manufacturer,
		packageSize,
	} = req.body

	const product = await Product.findById(req.params.id)
	if (!product) return next(new ErrorHandler('Product not found', 404))

	if (req.body) {
		const { color, size, country, manufacturer, packageSize } = req.body
		product.characteristics = {
			color,
			size,
			country,
			manufacturer,
			packageSize,
		}
	}
	if (name) product.name = name
	if (description) product.description = description
	if (category) product.category = category
	if (price) product.price = price
	if (stock) product.stock = stock
	if (productCode) product.productCode = productCode
	if (size) product.size = size
	if (color) product.color = color

	if (onecname) product.onecname = onecname
	if (extraDescription) product.extraDescription = extraDescription
	if (labels) product.labels = labels
	if (country) product.country = country
	if (manufacturer) product.manufacturer = manufacturer
	if (packageSize) product.packageSize = packageSize

	await product.save()

	res.status(200).json({
		success: true,
		message: 'Product Updated Successfully',
	})
})

export const addProductImage = asyncError(async (req, res, next) => {
	try {
		if (!req.file) return next(new ErrorHandler('Please add image', 400))

		// Получаем код продукта для создания папки специфичной для продукта
		const product = await Product.findById(req.params.id)
		if (!product) return next(new ErrorHandler('Product not found', 404))

		const imagePath = saveProductImage(product.productCode, req.file)

		await Product.findByIdAndUpdate(req.params.id, { $push: { images: imagePath } }, { new: true })

		res.status(200).json({
			success: true,
			message: 'Image Added Successfully',
			imagePath: imagePath, // Добавлено: возвращаем путь к изображению
		})
	} catch (error) {
		logger.error(error)
		return next(new ErrorHandler('Internal Server Error', 500))
	}
})

export const deleteProductImage = asyncError(async (req, res, next) => {
	try {
		const { id } = req.params
		const { imagePath } = req.query

		const product = await Product.findById(id)
		if (!product) return next(new ErrorHandler('Product not found', 404))

		if (!product.images.includes(imagePath)) return next(new ErrorHandler('Image not found', 404))

		const updateResult = await Product.findByIdAndUpdate(
			id,
			{ $pull: { images: imagePath } },
			{ new: true },
		)

		imagesService.deleteImage(imagePath)

		if (!updateResult)
			return next(new ErrorHandler('Failed to update product with image deletion', 500))

		res.status(200).json({
			success: true,
			message: 'Image deleted successfully',
		})
	} catch (error) {
		logger.error(error)
		return next(new ErrorHandler('Internal Server Error', 500))
	}
})

export const deleteProduct = async (req, res, next) => {
	try {
		const { id } = req.params

		const product = await Product.findById(id)
		if (!product) {
			return next(new ErrorHandler('Product not found', 404))
		}

		const folderPath = `./public/images/products/${product.productCode}`
		await rm(folderPath, { force: true, recursive: true })

		await product.remove()

		res.status(200).json({
			success: true,
			message: 'Product deleted successfully',
		})
	} catch (error) {
		logger.error(error)
		return next(new ErrorHandler('Failed to delete product', 500))
	}
}

export const getAllSections = asyncError(async (req, res, next) => {
	const { includeSubCategory } = req.query

	let query = Section.find().sort({ section: 1 }).collation({ locale: 'ru' })

	if (includeSubCategory === 'true') {
		query = query.populate({
			path: 'subCategories',
		})
	}

	const sections = await query.exec()

	res.status(200).json({
		success: true,
		sections,
	})
})

export const addSection = asyncError(async (req, res, next) => {
	await Section.create(req.body)

	res.status(201).json({
		success: true,
		message: 'Section Added Successfully',
	})
})

export const deleteSection = asyncError(async (req, res, next) => {
	const section = await Section.findById(req.params.id)
	if (!section) return next(new ErrorHandler('Section Not Found', 404))
	const category = await Category.find({ section: section._id })

	for (let i = 0; i < category.length; i++) {
		const cateogry = category[i]
		cateogry.section = undefined
		await cateogry.save()
	}

	await section.remove()

	res.status(200).json({
		success: true,
		message: 'Section Deleted Successfully',
	})
})

export const getSectionCategories = asyncError(async (req, res, next) => {
	const categories = await Category.find({ section: req.params.id })
	res.status(200).json({
		success: true,
		categories,
	})
})

export const addCategory = asyncError(async (req, res, next) => {
	await Category.create(req.body)

	res.status(201).json({
		success: true,
		message: 'Category Added Successfully',
	})
})

export const getAllCategories = asyncError(async (req, res, next) => {
	const { searchValue, categoryId } = req.query
	const mongoQuery = {}

	if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
		mongoQuery.section = categoryId
	}

	if (searchValue) {
		mongoQuery.$or = [{ category: { $regex: new RegExp(searchValue.trim(), 'i') } }]
	}

	const categories = await Category.find(mongoQuery).populate(['section'])

	res.status(200).json({
		success: true,
		categories,
	})
})

export const deleteCategory = asyncError(async (req, res, next) => {
	const category = await Category.findById(req.params.id)
	if (!category) return next(new ErrorHandler('Category Not Found', 404))
	const products = await Product.find({ category: category._id })

	for (let i = 0; i < products.length; i++) {
		const product = products[i]
		product.category = undefined
		await product.save()
	}

	await category.remove()

	res.status(200).json({
		success: true,
		message: 'Category Deleted Successfully',
	})
})

export const getRecentProducts = asyncError(async (req, res, next) => {
	const user = req.user._id
	let products = []
	const recentlyViewed = await RecentProduct.findOne({ user }).populate('products')

	if (recentlyViewed) products = recentlyViewed.products
	res.status(200).json({
		success: true,
		products,
	})
})

export const redirectToProduct = asyncError(async (req, res, next) => {
	const productId = req.params.id
	res.redirect(`dentx://productdetails/${productId}`)
})

const addRecentProduct = async (user, product, next) => {
	try {
		if (user && product) {
			let recentProduct = await RecentProduct.findOne({ user })

			if (!recentProduct) {
				recentProduct = new RecentProduct({ user, products: [product] })
			} else {
				const index = recentProduct.products.indexOf(product)
				if (index !== -1) {
					recentProduct.products.splice(index, 1)
				}
				recentProduct.products.unshift(product)

				recentProduct.products = recentProduct.products.slice(0, 15)
			}
			await recentProduct.save()
		}
	} catch (error) {
		return next(new ErrorHandler(error.message, 500))
	}
}
