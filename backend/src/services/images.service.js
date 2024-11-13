import crypto from 'crypto'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { logger } from '../utils/logger.utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const uploadPath = path.join(__dirname, '../../public/images/products')

class ImagesService {
	saveProductImage(storeId, productCode, file) {
		const hash = crypto.createHash('md5').update(file.originalname).digest('hex')
		const filename = `${hash}.${file.originalname.split('.').pop()}`

		const folderPath = path.join(uploadPath, storeId, productCode)

		try {
			if (!fs.existsSync(folderPath)) {
				fs.mkdirSync(folderPath, { recursive: true })
			}

			const filePath = path.join(folderPath, filename)
			fs.writeFileSync(filePath, file.buffer)

			return `images/products/${storeId}/${productCode}/${filename}`
		} catch (err) {
			logger.error('Error saving product image', err)
			throw err
		}
	}

	deleteImage(imagePath) {
		try {
			if (fs.existsSync(imagePath)) {
				fs.unlinkSync(imagePath)
			}
		} catch (err) {
			logger.error('Error deleting product image', err)
			throw err
		}
	}

	renameProductFolder(storeId, oldProductCode, newProductCode) {
		const oldFolderPath = path.join(uploadPath, storeId, oldProductCode)
		const newFolderPath = path.join(uploadPath, storeId, newProductCode)

		try {
			if (fs.existsSync(oldFolderPath)) {
				fs.renameSync(oldFolderPath, newFolderPath)
			}
		} catch (err) {
			logger.error('Error renaming product folder', err)
			throw err
		}
	}
}

export const imagesService = new ImagesService()
