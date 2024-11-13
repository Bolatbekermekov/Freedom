import crypto from 'crypto'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { logger } from '../utils/logger.utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const uploadPath = path.join(__dirname, '../../public/images/products')
const uploadWay = path.join(__dirname, '../../public/resumes')

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


class ResumesService {
	saveResumeFile(candidateId, file) {
		// Используем candidateId и оригинальное имя файла для сохранения
		const filename = `${candidateId}-${file.originalname}`

		// Путь для хранения резюме
		const folderPath = path.join(uploadWay)

		try {
			if (!fs.existsSync(folderPath)) {
				fs.mkdirSync(folderPath, { recursive: true })
			}

			const filePath = path.join(folderPath, filename)
			fs.writeFileSync(filePath, file.buffer)

			// Возвращаем путь, по которому будет доступно резюме
			return `resumes/${filename}`
		} catch (err) {
			logger.error('Error saving resume file', err)
			throw err
		}
	}

	deleteResumeFile(resumePath) {
		try {
			const absolutePath = path.join(uploadWay, resumePath)
			if (fs.existsSync(absolutePath)) {
				fs.unlinkSync(absolutePath)
			}
		} catch (err) {
			logger.error('Error deleting resume file', err)
			throw err
		}
	}
}

export const resumesService = new ResumesService()
export const imagesService = new ImagesService()
