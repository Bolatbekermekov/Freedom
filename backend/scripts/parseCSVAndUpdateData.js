import csv from 'csv-parser'
import { config } from 'dotenv'
import fs from 'fs'
import mongoose from 'mongoose'

import { connectDB } from '../src/database/database.js'
import { Category } from '../src/models/category.js'
import { Product } from '../src/models/product.js'
import { logger } from '../src/utils/logger.utils.js'

config({ path: './.env' })

await connectDB()

const productCodesToUpdate = ['00000000035'] // Replace with your array of product codes
const csvFilePath = './data/productsV4.csv' // Replace with your CSV file path
const companyId = '65f544ee3e891c20d188e841' // Replace with your company ID

const parseCSVAndUpdateData = async (csvPath, companyId) => {
	try {
		fs.createReadStream(csvPath)
			.pipe(csv())
			.on('data', async row => {
				let {
					productCode,
					category,
					name,
					color,
					size,
					description,
					extraDescription,
					packageSize,
					manufacturer,
					country,
					measureUnit,
					onecname,
				} = row

				if (!productCodesToUpdate.includes(productCode)) return

				category = category?.trim()
				name = name?.trim()
				productCode = productCode?.trim().padStart(11, '0')
				country = country?.trim()
				manufacturer = manufacturer?.trim()
				description = description?.trim()
				extraDescription = extraDescription?.trim()
				color = color?.trim()
				size = size?.trim()
				packageSize = packageSize?.trim()
				measureUnit = measureUnit?.trim()
				onecname = onecname?.trim()

				const categoryObject = await Category.findOne({ category: category })

				const characteristics = new Map()
				if (color) characteristics.set('color', color)
				if (size) characteristics.set('size', size)
				if (country) characteristics.set('country', country)
				if (manufacturer) characteristics.set('manufacturer', manufacturer)
				if (packageSize) characteristics.set('packageSize', packageSize)

				const originalProduct = await Product.findOne({ productCode })

				if (originalProduct) {
					const copiedProduct = new Product(originalProduct.toObject())
					copiedProduct._id = mongoose.Types.ObjectId()
					await copiedProduct.save()

					await Product.findOneAndUpdate(
						{ _id: originalProduct._id },
						{
							name,
							description,
							company: companyId,
							extraDescription,
							productCode,
							category: categoryObject._id,
							stock: 100,
							color,
							size,
							price: row.price,
							measureUnit: measureUnit,
							onecname: onecname,
							packageSize,
							characteristics,
						},
						{ new: true },
					)
				}

				await Product.findOneAndUpdate(
					{ productCode, company: companyId },
					{
						name,
						description,
						company: companyId,
						extraDescription,
						productCode,
						category: categoryObject._id,
						stock: 100,
						color,
						size,
						price: row.price,
						measureUnit: measureUnit,
						onecname: onecname,
						packageSize,
						characteristics,
					},
					{ upsert: true, new: true },
				)
			})
			.on('end', () => {
				logger.info('CSV file successfully processed')
			})
	} catch (error) {
		logger.error('Error parsing CSV and updating data:', error)
	}
}

await parseCSVAndUpdateData(csvFilePath, companyId)
