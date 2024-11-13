import fs from 'fs'
import natural from 'natural'
import path from 'path'

import { asyncError } from '../../middlewares/error.js'
import { Category, Section } from '../../models/category.js'
import { Product, RecentProduct } from '../../models/product.js'
import { SearchQuery } from '../../models/searchquery.js'
import ErrorHandler from '../../utils/error.js'
import { logger } from '../../utils/logger.utils.js'

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
			const tokenizer = new natural.WordTokenizer()
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
		logger.error('Failed to get admin products', error)
		next(error)
	}
})

export const getProductDetails = asyncError(async (req, res, next) => {
	const product = await Product.findById(req.params.id).populate('category')

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

	const products = await Product.find({ name: product.name })
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

		if (!req.file) return next(new ErrorHandler('Please add image', 400))

		const folderPath = `./public/images/products/${productCode}`

		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true })
		}

		const filePath = path.join(folderPath, req.file.originalname)

		fs.writeFileSync(filePath, req.file.buffer)

		const imagePath = `/images/products/${productCode}/${req.file.originalname}`

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
		})

		res.status(200).json({
			success: true,
			message: 'Product Created Successfully',
		})
	} catch (error) {
		logger.error('Product creation failed', error)
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

		const folderPath = `./public/images/products/${product.productCode}`

		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true })
		}

		const filePath = path.join(folderPath, req.file.originalname)

		fs.writeFileSync(filePath, req.file.buffer)

		const imagePath = `/images/products/${product.productCode}/${req.file.originalname}`

		await Product.findByIdAndUpdate(req.params.id, { $push: { images: imagePath } }, { new: true })

		res.status(200).json({
			success: true,
			message: 'Image Added Successfully',
			imagePath: imagePath, // Добавлено: возвращаем путь к изображению
		})
	} catch (error) {
		logger.error('Failed to add product image', error)
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

		const filePath = `./public${imagePath}`

		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath)
		}

		if (!updateResult)
			return next(new ErrorHandler('Failed to update product with image deletion', 500))

		res.status(200).json({
			success: true,
			message: 'Image deleted successfully',
		})
	} catch (error) {
		logger.error('Failed to delete product image', error)
		return next(new ErrorHandler('Internal Server Error', 500))
	}
})

export const deleteProduct = async (req, res, next) => {
	try {
		const product = await Product.findById(req.params.id)
		if (!product) {
			return next(new ErrorHandler('Product not found', 404))
		}

		const folderPath = `./public/images/products/${product.productCode}`

		if (fs.existsSync(folderPath)) {
			fs.rm(folderPath, { recursive: true, force: true }, () => {
				product.remove()
			})
		}

		res.status(200).json({
			success: true,
			message: 'Product Deleted Successfully',
		})
	} catch (error) {
		logger.error('Failed to delete product', error)
		return next(new ErrorHandler('Failed to delete product', 500))
	}
}

export const getAllSections = asyncError(async (req, res, next) => {
	const sections = await Section.find({}).sort({ section: 1 }).collation({ locale: 'ru' })
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
	const categories = await Category.find({})
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
