import csv from 'csv-parser'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

import { connectDB } from '../src/database/database.js'
import { Category, Section } from '../src/models/category.js'
import { Product } from '../src/models/product.js'
import { logger } from '../src/utils/logger.utils.js'

config({ path: './.env' })

await connectDB()

const parseCSVAndInsertData = async (csvPath, companyId) => {
	try {
		const defaultImage = '/images/categories/noimage.png'
		fs.createReadStream(csvPath)
			.pipe(csv())
			.on('data', async row => {
				let {
					productCode,
					section,
					category,
					name,
					color,
					size,
					description,
					extraDescription,
					packageSize,
					manufacturer,
					country,
					labels,
				} = row

				section = section?.trim()
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
				labels = labels?.trim()

				let sectionImage = null
				if (section && fs.existsSync(`./public/images/categories/${section}.png`)) {
					sectionImage = `/images/categories/${section}.png`
				}

				const sectionObject = await Section.findOneAndUpdate(
					{ section },
					{ section, image: sectionImage || defaultImage },
					{ upsert: true, new: true },
				)

				const categoryObject = await Category.findOneAndUpdate(
					{ category, section: sectionObject._id },
					{ category, section: sectionObject._id },
					{ upsert: true, new: true },
				)

				const characteristics = new Map()
				if (color) characteristics.set('color', color)
				if (size) characteristics.set('size', size)
				if (country) characteristics.set('country', country)
				if (manufacturer) characteristics.set('manufacturer', manufacturer)
				if (packageSize) characteristics.set('packageSize', packageSize)

				const folderPath = `./public/images/products/${companyId}/${productCode}`
				const images = []
				if (productCode) {
					if (fs.existsSync(folderPath)) {
						const files = fs.readdirSync(folderPath)
						files.forEach(file => {
							const filePath = path.join(`/images/products/${companyId}/${productCode}`, file)
							images.push(filePath)
						})
					}
				}

				// Create or find the section in the database
				await Product.findOneAndUpdate(
					{ productCode, company: companyId },
					{
						name,
						description,
						company: companyId,
						extraDescription,
						productCode,
						category: categoryObject._id,
						stock: row.stock,
						color,
						size,
						images,
						labels,
						price: row.price,
						measureUnit: row.measureUnit,
						onecname: row.onecname,
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
		logger.error('Error parsing CSV and inserting data:', error)
	}
}

await parseCSVAndInsertData(
	'./data/products_dentalshop_V2024-06-28.csv',
	'66838b46c82483090e264a64',
)
