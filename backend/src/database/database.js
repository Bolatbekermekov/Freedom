import mongoose from 'mongoose'

import { logger } from '../utils/logger.utils.js'

export const connectDB = async () => {
	const mongo_url =
		process.env.NODE_ENV === 'Production'
			? process.env.MONGO_URI_PRODUCTION
			: process.env.MONGO_URI_DEVELOPMENT
	try {
		const { connection } = await mongoose.connect(mongo_url, {
			dbName: process.env.MONGO_DATABASE,
		})

		logger.info(`Server connected to database ${connection.host}`)
	} catch (error) {
		logger.error('Some Error Occurred', error)
		process.exit(1)
	}
}
