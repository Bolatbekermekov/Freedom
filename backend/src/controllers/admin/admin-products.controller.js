import fs from 'fs'
import mongoose from 'mongoose'

import LocalizedError from '../../errors/localized-error.js'
import { localizedErrorMessages } from '../../errors/localized-messages.js'
import { Category, Section } from '../../models/category.js'
import { Product } from '../../models/product.js'
import { imagesService } from '../../services/images.service.js'
import ErrorHandler from '../../utils/error.js'
import { generateUniqueBarcode } from '../../utils/features.js'
import { logger } from '../../utils/logger.utils.js'
import { getPagination } from '../../utils/pagination.utils.js'
import { getSorting } from '../../utils/sorting.utils.js'

class AdminProductsController {
	async getAllProducts(req, res, next) {
		try {
			const { page, size, searchValue, sort, subCategoryId, paginate } = req.query
			const currentUser = req.user

			const mongoQuery = {
				company: currentUser.company,
			}

			if (searchValue) {
				mongoQuery.$or = [
					{ name: { $regex: new RegExp(searchValue.trim(), 'i') } },
					{ description: { $regex: new RegExp(searchValue.trim(), 'i') } },
					{ barcode: { $regex: new RegExp(searchValue.trim(), 'i') } },
				]
			}

			if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
				mongoQuery.category = subCategoryId
			}

			const sorting = getSorting(sort)
			const pagination = getPagination(page, size, paginate)

			const products = await Product.paginate(mongoQuery, {
				limit: pagination.limit,
				offset: pagination.offset,
				pagination: pagination.paginate,
				sort: sorting,
				populate: ['category'],
			})

			return res.status(200).json(products)
		} catch (error) {
			logger.error('Failed to get products', error)
			return next(new ErrorHandler('Failed to get products', 500))
		}
	}

	async getProductByBarcode(req, res, next) {
		const product = await Product.findOne({ barcode: req.params.barcode })

		if (!product) return next(new ErrorHandler('Product not found', 404))

		res.status(200).json(product)
	}

	async getProductDetails(req, res, next) {
		const product = await Product.findById(req.params.id).populate('category')

		if (!product) return next(new ErrorHandler('Product not found', 404))

		return res.status(200).json(product)
	}

	async createProduct(req, res, next) {
		try {
			const {
				name,
				description,
				subCategoryId,
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
				measureUnit,
				barcode,
			} = req.body

			const currentUser = req.user

			if (!req.file) {
				return next(new LocalizedError(localizedErrorMessages['400_MISSING_IMAGE'], 400))
			}

			const existingProductByCode = await Product.findOne({
				productCode: productCode,
				company: currentUser.company._id,
			})

			if (existingProductByCode) {
				return next(
					new LocalizedError(localizedErrorMessages['400_PRODUCT_CODE_EXISTS_IN_STORE'], 400),
				)
			}

			const existingProductByBarcode = await Product.findOne({ barcode })
			if (existingProductByBarcode) {
				return next(new LocalizedError(localizedErrorMessages['400_BARCODE_EXISTS'], 400))
			}

			const imagePath = imagesService.saveProductImage(
				currentUser.company._id.toString(),
				productCode,
				req.file,
			)

			const characteristics = new Map()
			if (color) characteristics.set('color', color)
			if (size) characteristics.set('size', size)
			if (country) characteristics.set('country', country)
			if (manufacturer) characteristics.set('manufacturer', manufacturer)
			if (packageSize) characteristics.set('packageSize', packageSize)
			if (measureUnit) characteristics.set('measureUnit', measureUnit)

			await Product.create({
				name,
				description,
				productCode,
				category: subCategoryId,
				price,
				stock,
				size,
				color,
				images: [imagePath],
				characteristics,
				onecname,
				extraDescription,
				labels,
				measureUnit,
				company: currentUser.company,
				manufacturer,
				packageSize,
				barcode,
			})

			return res.status(200).json({
				success: true,
				message: 'Product Created Successfully',
			})
		} catch (error) {
			logger.error('Failed to create a product', error)
			return next(new LocalizedError(localizedErrorMessages['500_CREATE_PRODUCT_ERROR'], 500))
		}
	}

	async generateBarcode(req, res, next) {
		try {
			const newBarcode = await generateUniqueBarcode()
			return res.status(200).json({
				success: true,
				barcode: newBarcode,
			})
		} catch (error) {
			logger.error('Failed to generate barcode', error)
			return next(new LocalizedError(localizedErrorMessages['500_GENERATE_BARCODE_ERROR'], 500))
		}
	}

	async updateProduct(req, res, next) {
		try {
			const {
				name,
				description,
				subCategoryId,
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
				hidden,
				measureUnit,
			} = req.body

			const currentUser = req.user
			const product = await Product.findById(req.params.id)
			if (!product) {
				return next(new ErrorHandler('Product not found', 404))
			}

			if (productCode && productCode !== product.productCode) {
				const existingProductByCode = await Product.findOne({
					productCode: productCode,
					company: currentUser.company._id,
					_id: { $ne: req.params.id }, // Exclude current product
				})

				if (existingProductByCode) {
					return next(new ErrorHandler('Product with same code already exists in this store', 400))
				}

				imagesService.renameProductFolder(
					product.company.toString(),
					product.productCode,
					productCode,
				)

				if (product.images && product.images.length > 0) {
					for (let i = 0; i < product.images.length; i++) {
						const imagePath = product.images[i]
						const newImagePath = imagePath.replace(product.productCode, productCode)
						product.images[i] = newImagePath
					}
				}

				product.productCode = productCode
			}

			if (name) product.name = name
			if (description) product.description = description
			if (subCategoryId) product.category = subCategoryId
			if (price) product.price = price
			if (stock) product.stock = stock
			if (onecname) product.onecname = onecname
			if (extraDescription) product.extraDescription = extraDescription
			if (labels) product.labels = labels
			if (size) {
				product.size = size
				product.characteristics.set('size', size)
			}
			if (color) {
				product.color = color
				product.characteristics.set('color', color)
			}
			if (country) {
				product.country = country
				product.characteristics.set('country', country)
			}
			if (manufacturer) {
				product.manufacturer = manufacturer
				product.characteristics.set('manufacturer', manufacturer)
			}
			if (packageSize) {
				product.packageSize = packageSize
				product.characteristics.set('packageSize', packageSize)
			}
			if (measureUnit) {
				product.measureUnit = measureUnit
				product.characteristics.set('measureUnit', measureUnit)
			}
			if (hidden !== undefined && hidden !== null) {
				product.hidden = hidden
			}
			if (req.file) {
				const imagePath = imagesService.saveProductImage(
					product.company.toString(),
					productCode,
					req.file,
				)

				product.images = [imagePath]
			}

			await product.save()

			res.status(200).json({
				success: true,
				message: 'Product Updated Successfully',
			})
		} catch (error) {
			logger.error('Failed to update a product', error)
			return next(new ErrorHandler('Failed to update a product', 500))
		}
	}

	async uploadMultipleProducts(req, res, next) {
		try {
			const reqProducts = req.body.products
			const images = req.files
			const currentUser = req.user

			const productsToSave = await Promise.all(
				reqProducts.map(async (product, index) => {
					const image = images.find(file => file.fieldname === `products[${index}][file]`)
					const imagePath = imagesService.saveProductImage(
						currentUser.company._id.toString(),
						product.productCode,
						image,
					)

					const defaultSectionImage = '/images/categories/noimage.png'

					let sectionImage = null
					if (
						product.section &&
						fs.existsSync(`../../../public/images/categories/${product.section}.png`)
					) {
						sectionImage = `/images/categories/${product.section}.png`
					}

					const sectionObject = await Section.findOneAndUpdate(
						{ section: product.section },
						{ section: product.section, image: sectionImage || defaultSectionImage },
						{ upsert: true, new: true },
					)

					const categoryObject = await Category.findOneAndUpdate(
						{ category: product.category, section: sectionObject._id },
						{ category: product.category, section: sectionObject._id },
						{ upsert: true, new: true },
					)

					const characteristics = new Map()
					if (product.color) characteristics.set('color', product.color)
					if (product.size) characteristics.set('size', product.size)
					if (product.country) characteristics.set('country', product.country)
					if (product.manufacturer) characteristics.set('manufacturer', product.manufacturer)
					if (product.packageSize) characteristics.set('packageSize', product.packageSize)
					if (product.measureUnit) characteristics.set('measureUnit', product.measureUnit)

					return {
						name: product.name,
						description: product.description,
						category: categoryObject,
						price: Number(product.price),
						stock: Number(product.stock),
						productCode: product.productCode,
						size: product.size,
						color: product.color,
						country: product.country,
						manufacturer: product.manufacturer,
						packageSize: product.packageSize,
						onecname: product.onecname,
						extraDescription: product.extraDescription,
						labels: product.labels,
						measureUnit: product.measureUnit,
						images: [imagePath],
						characteristics,
						company: currentUser.company,
						barcode: new mongoose.Types.ObjectId().toHexString(),
					}
				}),
			)

			await Product.insertMany(productsToSave)

			return res.status(200).json({
				success: true,
				message: 'Products Uploaded Successfully',
			})
		} catch (error) {
			logger.error('Failed to upload multiple products', error)
			return next(new LocalizedError(localizedErrorMessages['500_CREATE_PRODUCT_ERROR'], 500))
		}
	}

	async addProductImage(req, res, next) {
		try {
			if (!req.file) return next(new ErrorHandler('Please add image', 400))

			const product = await Product.findById(req.params.id)
			if (!product) return next(new ErrorHandler('Product not found', 404))

			const imagePath = imagesService.saveProductImage(
				product.company.toString(),
				product.productCode,
				req.file,
			)

			await Product.findByIdAndUpdate(
				req.params.id,
				{ $push: { images: imagePath } },
				{ new: true },
			)

			res.status(200).json({
				success: true,
				message: 'Image Added Successfully',
			})
		} catch (error) {
			logger.error('Failed to add images', error)
			return next(new ErrorHandler('Failed to add images', 500))
		}
	}

	async deleteProductImage(req, res, next) {
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
			logger.error('Failed to delete an image', error)
			return next(new ErrorHandler('Failed to delete an image', 500))
		}
	}
}

export const adminProductsController = new AdminProductsController()
