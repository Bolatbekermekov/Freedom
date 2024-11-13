import { config } from 'dotenv'

import { connectDB } from '../src/database/database.js'
import { Product } from '../src/models/product.js'
import { logger } from '../src/utils/logger.utils.js'
import { transliterateTextLatinToCyrillic } from '../src/utils/transliterate.js'

config({
	path: './.env',
})

await connectDB()

const transliterateAndAppend = async () => {
	try {
		const products = await Product.find()
		let count = 0

		for (const product of products) {
			try {
				const existingWords = (product.extraDescription || '').split(/\s+/)
				const newWords = transliterateTextLatinToCyrillic(product.name)
					.split(/\s+/)
					.filter(word => !existingWords.includes(word))

				const updatedDescription = `${product.extraDescription || ''} ${newWords.join(' ')}`.trim()

				product.extraDescription = updatedDescription
				await product.save()
				count++

				console.log(`Processed ${count} products`)
			} catch (error) {
				logger.error('Error updating product', product._id, error)
			}
		}

		console.log('Transliteration and concatenation completed successfully!')
	} catch (error) {
		logger.error(error)
	}
}

await transliterateAndAppend()
